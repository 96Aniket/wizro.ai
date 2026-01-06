import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import userSqlc from './userSqlc.js';
import pool from '../../config/config.js';
import dbqueryexecute from '../../utils/dbqueryexecute.js';

dotenv.config();

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || process.env.SECRET_KEY || 'sahil_1234';

const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || 'refresh-secret';

// Helper to sign tokens
const signAccess = (payload) =>
  jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

const signRefresh = (payload) =>
  jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

// const getUsers = async (req, res) => {
//   try {
//     const query = userSqlc.getAllUsers();
//     const result = await dbqueryexecute.executeSelect(query);
//     res.json(result.rows || result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch users" });
//   }
// };

// const deleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const query = userSqlc.deleteUser(id);
//     await dbqueryexecute.executeSelectObj(query, pool);
//     res.json({ message: 'User deleted successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to delete user' });
//   }
// };

export default {
  // getUsers,

  // deleteUser,
  // deleteUser(req, res) {
  //   dbqueryexecute
  //     .executeSelectObj(userSqlc.deleteUser(req.body), pool)
  //     .then((data) => {
  //       res.status(200).json(data);
  //     })
  //     .catch((err) => {
  //       res.status(500).json(err);
  //     });
  // },

async login(req, res) {
  try {
    const result = await dbqueryexecute.executeSelectObj(
      userSqlc.login(req.body),
      pool,
    );

    if (result.length === 0) {
      return res.status(404).json({ Mess: 'Email/Password not matched' });
    }

    const userRow = result[0];

    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      userRow.s_password,
    );

    if (!isPasswordValid) {
      return res.status(404).json({ Mess: 'Email/Password not matched' });
    }

    // 🔐 JWT payload
    const payload = {
      id: userRow.n_user_id,
      role: userRow.n_role,
      empID: userRow.n_user_id,
    };

    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);

    // store refresh token
    await dbqueryexecute.executeSelectObj(
      userSqlc.updateRefreshToken({
        refreshToken,
        userId: payload.id,
      }),
      pool,
    );

    res.cookie('jid', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    // 🔥 FETCH PERMISSIONS (THIS WAS MISSING)
    const permResult = await dbqueryexecute.executeSelectObj(
      userSqlc.getPermissionsByRoleId({ roleId: userRow.n_role }),
      pool,
    );

    const permissions = permResult.map(
      (row) => row.s_permission_name
    );

    // ✅ SEND permissions to frontend
    return res.status(200).json({
      accessToken,
      email: userRow.s_email,
      empID: userRow.n_user_id,
      fullName: userRow.s_full_name,
      role: userRow.n_role,
      permissions, // 🔥 VERY IMPORTANT
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
},

  // NEW: logout - clear cookie and DB token
  async logout(req, res) {
    try {
      const token = req.cookies.jid;

      if (token) {
        try {
          const decoded = jwt.decode(token);

          if (decoded?.id) {
            await dbqueryexecute.executeSelectObj(
              userSqlc.clearRefreshToken({ userId: Number(decoded.id) }),
              pool,
            );
          }
        } catch {
          // Ignore
        }
      }
      res.clearCookie('jid', {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      return res.json({ ok: true });
    } catch {
      return res.status(500).json({ message: 'Logout failed' });
    }
  },

  // NEW: refresh token endpoint
async refreshToken(req, res) {
  try {
    const token = req.cookies.jid;
    if (!token) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const userId = decoded.id;

    const q = await dbqueryexecute.executeSelectObj(
      userSqlc.getUserById({ userId }),
      pool,
    );

    const userRow = q[0];
    if (!userRow || userRow.refresh_token !== token) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const payload = {
      id: userRow.n_user_id,
      role: userRow.n_role,
      empID: userRow.n_user_id,
    };

    const accessToken = signAccess(payload);

    // 🔥 FETCH PERMISSIONS AGAIN
    const permResult = await dbqueryexecute.executeSelectObj(
      userSqlc.getPermissionsByRoleId({ roleId: userRow.n_role }),
      pool,
    );

    const permissions = permResult.map(
      (row) => row.s_permission_name
    );

    return res.status(200).json({
      accessToken,
      email: userRow.s_email,
      empID: userRow.n_user_id,
      fullName: userRow.s_full_name,
      role: userRow.n_role,
      permissions, // 🔥 REQUIRED
    });
  } catch (err) {
    console.error('REFRESH ERROR:', err);
    return res.status(500).json({ message: 'Refresh failed' });
  }
}
,

  async register(req, res) {
    try {
      const result = await dbqueryexecute.executeSelectObj(
        userSqlc.getDuplicate(req.body),
        pool,
      );

      if (result.length > 0) {
        return res.status(409).json({ mess: 'Email Already Exists' });
      }

      const SALT = 10;

      const hashedPassword = await bcrypt.hash(req.body.password, SALT);

      const data = await dbqueryexecute.executeSelectObj(
        userSqlc.register({ ...req.body, password: hashedPassword }),
        pool,
      );

      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json(err);
    }
  },

  updateUser(req, res) {
    dbqueryexecute
      .executeSelectObj(userSqlc.updateUser(req.body), pool)
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  },

  async logout(req, res) {
    try {
      const token = req.cookies.jid;

      if (token) {
        try {
          const decoded = jwt.decode(token);

          if (decoded?.id) {
            await dbqueryexecute.executeSelectObj(
              userSqlc.clearRefreshToken({ userId: Number(decoded.id) }),
              pool,
            );
          }
        } catch {
          // ignore decode error
        }
      }

      // Clear cookie
      res.clearCookie('jid', {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
      return res.status(500).json({ message: 'Logout failed', err });
    }
  },

 // ==================== USER MANAGEMENT ====================

  async getUsers(req, res) {
    try {
      const query = userSqlc.getAllUsers();
      const result = await dbqueryexecute.executeSelectObj(query, pool);

      res.status(200).json(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('❌ GET USERS ERROR:', err);
      console.error('❌ Error Stack:', err.stack);
      console.error('❌ Error Message:', err.message);
      res.status(500).json({
        error: 'Failed to fetch users',
        details: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      });
    }
  },

  async getUserById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const query = userSqlc.getUserWithDocuments({ n_user_id: parseInt(id) });
      const result = await dbqueryexecute.executeSelectObj(query, pool);

      if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(result[0]);
    } catch (err) {
      console.error('❌ GET USER BY ID ERROR:', err);
      res.status(500).json({
        error: 'Failed to fetch user',
        details: err.message,
      });
    }
  },

  async createUser(req, res) {
    try {
      const {
        s_full_name,
        s_email,
        s_password,
        n_role,
        n_status,
        d_joining_date,
        s_aadhar_card_no,
        s_pan_card_no,
        s_bank_name,
        s_bank_account_no,
        s_bank_ifsc_code,
      } = req.body;

      console.log('📝 CREATE USER Request:', {
        s_full_name,
        s_email,
        n_role,
        n_status,
        d_joining_date,
        files: req.files,
      });

      // Validation
      if (
        !s_full_name ||
        !s_email ||
        !s_password ||
        !n_role ||
        !n_status ||
        !d_joining_date
      ) {
        return res.status(400).json({ error: 'All required fields must be provided' });
      }

      // Check duplicate email
      const duplicate = await dbqueryexecute.executeSelectObj(
        userSqlc.getDuplicate({ email: s_email }),
        pool,
      );

      if (duplicate.length > 0) {
        return res.status(409).json({ error: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(s_password, 10);

      const fileData = {};

      if (req.files) {
        const fileFields = [
          "b_aadhar_card_img",
          "b_pan_card_img",
          "b_passport_photo",
          "b_10th_mark_sheet",
          "b_12th_mark_sheet",
          "b_degree_mark_sheet",
          "b_certificates",
          "b_professional_certifications",
          "b_offer_letter",
          "b_experience_letter",
          "b_salary_slips",
          "b_bank_passbook_copy",
          "b_resume_cv",
        ];

        fileFields.forEach((field) => {
          if (req.files[field]?.[0]) {
            fileData[field] = req.files[field][0].buffer;
          }
        });
      }


      const query = userSqlc.createUser({
        s_full_name,
        s_email,
        s_password: hashedPassword,
        n_role: parseInt(n_role),
        n_status: parseInt(n_status) || 1,
        d_joining_date,
        s_aadhar_card_no,
        s_pan_card_no,
        s_bank_name,
        s_bank_account_no,
        s_bank_ifsc_code,
        ...fileData,
      });

      console.log('🔍 CREATE Query:', query);

      const result = await dbqueryexecute.executeSelectObj(query, pool);

      console.log('✅ CREATE Result:', result);

      res.status(201).json(result[0] || result);
    } catch (err) {
      console.error('❌ CREATE USER ERROR:', err);
      console.error('❌ Error Details:', err.message);
      res.status(500).json({
        error: 'Failed to create user',
        details: err.message,
      });
    }
  },

  async updateUser(req, res) {
    try {
      const {
        n_user_id,
        s_full_name,
        s_email,
        n_role,
        n_status,
        d_joining_date,
        s_aadhar_card_no,
        s_pan_card_no,
        s_bank_name,
        s_bank_account_no,
        s_bank_ifsc_code,
      } = req.body;

      if (!n_user_id) {
        return res.status(400).json({ error: 'User ID required' });
      }

      // Check if email is being changed to existing email
      if (s_email) {
        const duplicate = await dbqueryexecute.executeSelectObj(
          {
            queryString:
              'SELECT n_user_id FROM tbl_users WHERE s_email = $1 AND n_user_id != $2',
            arr: [s_email, n_user_id],
          },
          pool,
        );

        if (duplicate.length > 0) {
          return res.status(409).json({ error: 'Email already exists' });
        }
      }

      // Process file uploads
      const fileData = {};
      if (req.files) {
        const fileMapping = {
        b_aadhar_card_img: 'b_aadhar_card_img',
        b_pan_card_img: 'b_pan_card_img',
        b_passport_photo: 'b_passport_photo',
        b_10th_mark_sheet: 'b_10th_mark_sheet',
        b_12th_mark_sheet: 'b_12th_mark_sheet',
        b_degree_mark_sheet: 'b_degree_mark_sheet',
        b_certificates: 'b_certificates',
        b_professional_certifications: 'b_professional_certifications',
        b_offer_letter: 'b_offer_letter',
        b_experience_letter: 'b_experience_letter',
        b_salary_slips: 'b_salary_slips',
        b_bank_passbook_copy: 'b_bank_passbook_copy',
        b_resume_cv: 'b_resume_cv',
      };
        Object.entries(fileMapping).forEach(([fieldName, dbColumn]) => {
        if (req.files?.[fieldName]?.[0]) {
          fileData[dbColumn] = req.files[fieldName][0].buffer;
        }
      });
      }

      const query = userSqlc.updateUser({
        n_user_id: parseInt(n_user_id),
        s_full_name,
        s_email,
        n_role: parseInt(n_role),
        n_status: n_status || 1,
        d_joining_date,
        s_aadhar_card_no,
        s_pan_card_no,
        s_bank_name,
        s_bank_account_no,
        s_bank_ifsc_code,
        ...fileData,
      });

      const result = await dbqueryexecute.executeSelectObj(query, pool);

      res.status(200).json(result[0] || result);
    } catch (err) {
      console.error('❌ UPDATE USER ERROR:', err);
      console.error('❌ Error Stack:', err.stack);
      console.error('❌ Error Message:', err.message);
      res.status(500).json({
        error: 'Failed to update user',
        details: err.message,
      });
    }
  },

  async deleteUsers(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'user ID is required' });
      }
      const query = userSqlc.deleteUsers({ n_user_id: id });
      await dbqueryexecute.executeSelectObj(query, pool);
      res.status(200).json({ message: 'user deleted successfully' });
    } catch (err) {
      console.error('DELETE user ERROR:', err);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  },

  async downloadDocument(req, res) {
    try {
      const { id, docType } = req.params;

      if (!id || !docType) {
        return res.status(400).json({ error: 'User ID and document type required' });
      }

      const query = userSqlc.getUserWithDocuments({ n_user_id: parseInt(id) });
      const result = await dbqueryexecute.executeSelectObj(query, pool);

      if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = result[0];
      const documentBuffer = user[docType];

      if (!documentBuffer) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Determine content type based on file signature
      let contentType = 'application/octet-stream';
      const firstBytes = documentBuffer.slice(0, 4).toString('hex');

      if (firstBytes.startsWith('ffd8ff')) contentType = 'image/jpeg';
      else if (firstBytes.startsWith('89504e47')) contentType = 'image/png';
      else if (firstBytes.startsWith('25504446')) contentType = 'application/pdf';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${docType}_${id}"`);
      res.send(documentBuffer);
    } catch (err) {
      console.error('DOWNLOAD DOCUMENT ERROR:', err);
      res.status(500).json({ error: 'Failed to download document' });
    }
  },


  async createRole(req, res) {
    try {
      const { s_role_name } = req.body;

      if (!s_role_name || !s_role_name.trim()) {
        return res.status(400).json({ error: 'Role name is required' });
      }

      const query = userSqlc.createRole({
        s_role_name: s_role_name.trim(),
      });

      const result = await dbqueryexecute.executeSelectObj(query, pool);

      return res.status(201).json({
        message: 'Role created successfully',
        data: result,
      });
    } catch (err) {
      console.error('CREATE ROLE ERROR:', err);
      return res.status(500).json({ error: 'Failed to create role' });
    }
  },

  async getRoles(req, res) {
    try {
      const result = await dbqueryexecute.executeSelectObj(
        userSqlc.getAllRoles(),
        pool,
      );

      res.status(200).json(result);
    } catch (err) {
      console.error('GET ROLES ERROR:', err);
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  },

  async updateRole(req, res) {
    try {
      const { n_id, s_role_name } = req.body;

      if (!n_id) {
        return res.status(400).json({ error: 'Role ID is required' });
      }

      if (!s_role_name || !s_role_name.trim()) {
        return res.status(400).json({ error: 'Role name is required' });
      }

      // First, get the old role name
      const getRoleQuery = {
        queryString: `SELECT s_role_name FROM tbl_role_master WHERE n_id = $1`,
        arr: [n_id],
      };

      const oldRoleResult = await dbqueryexecute.executeSelectObj(
        getRoleQuery,
        pool,
      );

      if (!oldRoleResult || oldRoleResult.length === 0) {
        return res.status(404).json({ error: 'Role not found' });
      }

      const oldRoleName = oldRoleResult[0].s_role_name;

      // Update the role in role_master
      const updateRoleQuery = userSqlc.updateRole({
        n_id,
        s_role_name: s_role_name.trim(),
      });

      await dbqueryexecute.executeSelectObj(updateRoleQuery, pool);

      // Update all users who have the old role name
      if (oldRoleName && oldRoleName !== s_role_name.trim()) {
        const updateUsersQuery = {
          queryString: `
          UPDATE tbl_users_management
          SET s_role = $1
          WHERE s_role = $2
        `,
          arr: [s_role_name.trim(), oldRoleName],
        };

        await dbqueryexecute.executeSelectObj(updateUsersQuery, pool);
      }

      res.status(200).json({
        message: 'Role updated successfully and user records updated',
      });
    } catch (err) {
      console.error('UPDATE ROLE ERROR:', err);
      res.status(500).json({
        error: 'Failed to update role',
        details: err.message,
      });
    }
  },

  async deleteRole(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'Role ID is required' });
      }

      const query = userSqlc.deleteRole({ n_id: id });

      await dbqueryexecute.executeSelectObj(query, pool);

      res.status(200).json({ message: 'Role deleted successfully' });
    } catch (err) {
      console.error('DELETE ROLE ERROR:', err);
      res.status(500).json({ error: 'Failed to delete role' });
    }
  },

  async getAllPermissions(req, res) {
    try {
      const result = await dbqueryexecute.executeSelectObj(
        userSqlc.getAllPermissions(),
        pool,
      );
      res.status(200).json(result);
    } catch (err) {
      console.error('GET PERMISSIONS ERROR:', err);
      res.status(500).json({ error: 'Failed to fetch permissions' });
    }
  },

  async createPermission(req, res) {
    try {
      const { s_permission_name } = req.body;

      if (!s_permission_name || !s_permission_name.trim()) {
        return res.status(400).json({ error: 'Permission name required' });
      }

      const result = await dbqueryexecute.executeSelectObj(
        userSqlc.createPermission({
          s_permission_name: s_permission_name.trim(),
        }),
        pool,
      );

      res.status(201).json(result[0]);
    } catch (err) {
      console.error('CREATE PERMISSION ERROR:', err);
      res.status(500).json({ error: 'Failed to create permission' });
    }
  },

  // Replace your deletePermission function in userController.js with this:

  async deletePermission(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'Permission ID is required' });
      }

      // First, delete all role-permission assignments for this permission
      const deleteAssignmentsQuery = userSqlc.deletePermissionAssignments(id);
      await dbqueryexecute.executeSelectObj(deleteAssignmentsQuery, pool);

      // Then, delete the permission itself
      const deletePermissionQuery = userSqlc.deletePermission(id);
      await dbqueryexecute.executeSelectObj(deletePermissionQuery, pool);

      res.status(200).json({ message: 'Permission deleted successfully' });
    } catch (err) {
      console.error('DELETE PERMISSION ERROR:', err);
      res.status(500).json({
        error: 'Failed to delete permission',
        details: err.message,
      });
    }
  },

  async assignPermission(req, res) {
    try {
      const { role_id, permission_id } = req.body;

      if (!role_id || !permission_id) {
        return res.status(400).json({ error: 'Role and Permission required' });
      }

      // ✅ FIX: Pass 'pool' as the second argument
      await dbqueryexecute.executeSelectObj(
        userSqlc.assignPermission({ role_id, permission_id }),
        pool, // <-- This was missing!
      );

      res.status(201).json({ message: 'Permission assigned successfully' });
    } catch (err) {
      console.error('ASSIGN PERMISSION ERROR:', err);
      res.status(500).json({ error: 'Failed to assign permission' });
    }
  },
  // Add these two methods to your userController.js

  async getPermissionsByRole(req, res) {
    try {
      const { roleId } = req.params;

      if (!roleId) {
        return res.status(400).json({ error: 'Role ID is required' });
      }

      const query = userSqlc.getPermissionsByRole({ roleId });
      const result = await dbqueryexecute.executeSelectObj(query, pool);

      res.status(200).json(result);
    } catch (err) {
      console.error('GET PERMISSIONS BY ROLE ERROR:', err);
      res.status(500).json({ error: 'Failed to fetch role permissions' });
    }
  },

  async unassignPermission(req, res) {
    try {
      const { role_id, permission_id } = req.body;

      if (!role_id || !permission_id) {
        return res.status(400).json({ error: 'Role and Permission required' });
      }

      const query = userSqlc.unassignPermission({ role_id, permission_id });
      await dbqueryexecute.executeSelectObj(query, pool);

      res.status(200).json({ message: 'Permission unassigned successfully' });
    } catch (err) {
      console.error('UNASSIGN PERMISSION ERROR:', err);
      res.status(500).json({ error: 'Failed to unassign permission' });
    }
  },
};
