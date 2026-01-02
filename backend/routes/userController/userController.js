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


const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const query = userSqlc.deleteUser(id);
    await dbqueryexecute.executeSelectObj(query);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

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

      if (isPasswordValid) {
        const payload = {
          id: userRow.n_user_id,
          role: userRow.n_role,
        };

        const accessToken = signAccess(payload);

        const refreshToken = signRefresh(payload);

        await dbqueryexecute.executeSelectObj(
          userSqlc.updateRefreshToken({ refreshToken, userId: payload.id }),
          pool,
        );
        res.cookie('jid', refreshToken, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          secure: process.env.NODE_ENV === 'production',
          path:"/",
        });

        return res.status(200).json({
          accessToken,
          email: userRow.s_email,
          empID: userRow.n_user_id,
          fullName: userRow.s_full_name,
          role: userRow.n_role,
        });
      }

      return res.status(404).json({ Mess: 'Email/Password not matched' });
    } catch (error) {
      console.log(err);
      
      return res.status(500).json(error);
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
        } catch  {
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
      } catch (err) {
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
      const payload = { id: userId, role: userRow.n_role };
      const accessToken = signAccess(payload);
      return res.status(200).json({
        accessToken,
        email: userRow.s_email,
        empID: userRow.n_user_id,
        fullName: userRow.s_full_name,
        role: userRow.n_role,
      });
    } catch (err) {
      return res.status(500).json({ message: 'Refresh failed' });
    }
  },

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
    } catch(err) {
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
            pool
          );
        }
      } catch {
        // ignore decode error
      }
    }

    // Clear cookie
    res.clearCookie("jid", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Logout failed", err });
  }
}
,
async createUser(req, res) {
  try {
    const { s_full_name, s_email, s_role , d_joining_date} = req.body;

    // 🔒 Basic validation
    if (!s_full_name || !s_email || !s_role || !d_joining_date) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Build SQL query
    const query = userSqlc.createUser({
      s_full_name,
      s_email,
      s_role,
      d_joining_date,
    });

    // 🔥 IMPORTANT: pass pool as 2nd argument
    const result = await dbqueryexecute.executeSelectObj(query, pool);

    res.status(201).json({
      message: "User created successfully",
      data: result,
    });

  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
},
async getUsers (req, res) {
  try {
    const result = await dbqueryexecute.executeSelectObj(
      userSqlc.getAllUsers(),
      pool
    );

    res.status(200).json(result); // <-- VERY IMPORTANT
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
},
async updateUserDetails(req, res) {
  try {
    const { n_user_id, s_full_name, s_email, s_role, d_joining_date } = req.body;

    if (!n_user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const query = userSqlc.updateUserDetails({
      n_user_id,
      s_full_name,
      s_email,
      s_role,
      d_joining_date,
    });

    const result = await dbqueryexecute.executeSelectObj(query, pool);

    res.status(200).json({
      message: "User updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
},
async deleteUser(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const query = userSqlc.deleteUserById({ n_user_id: id });

    await dbqueryexecute.executeSelectObj(query, pool);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
},

async createRole(req, res) {
    try {
      const { s_role_name } = req.body;

      if (!s_role_name || !s_role_name.trim()) {
        return res.status(400).json({ error: "Role name is required" });
      }

      const query = userSqlc.createRole({
        s_role_name: s_role_name.trim(),
      });

      const result = await dbqueryexecute.executeSelectObj(query, pool);

      return res.status(201).json({
        message: "Role created successfully",
        data: result,
      });
    } catch (err) {
      console.error("CREATE ROLE ERROR:", err);
      return res.status(500).json({ error: "Failed to create role" });
    }
  },

async getRoles(req, res) {
  try {
    const result = await dbqueryexecute.executeSelectObj(
      userSqlc.getAllRoles(),
      pool
    );

    res.status(200).json(result);
  } catch (err) {
    console.error("GET ROLES ERROR:", err);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
},

async updateRole(req, res) {
  try {
    const { n_id, s_role_name } = req.body;

    if (!n_id) {
      return res.status(400).json({ error: "Role ID is required" });
    }

    if (!s_role_name || !s_role_name.trim()) {
      return res.status(400).json({ error: "Role name is required" });
    }

    // First, get the old role name
    const getRoleQuery = {
      queryString: `SELECT s_role_name FROM tbl_role_master WHERE n_id = $1`,
      arr: [n_id],
    };
    
    const oldRoleResult = await dbqueryexecute.executeSelectObj(getRoleQuery, pool);
    
    if (!oldRoleResult || oldRoleResult.length === 0) {
      return res.status(404).json({ error: "Role not found" });
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
      message: "Role updated successfully and user records updated",
    });
  } catch (err) {
    console.error("UPDATE ROLE ERROR:", err);
    res.status(500).json({ 
      error: "Failed to update role",
      details: err.message 
    });
  }
},

async deleteRole(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Role ID is required" });
    }

    const query = userSqlc.deleteRole({ n_id: id });

    await dbqueryexecute.executeSelectObj(query, pool);

    res.status(200).json({ message: "Role deleted successfully" });
  } catch (err) {
    console.error("DELETE ROLE ERROR:", err);
    res.status(500).json({ error: "Failed to delete role" });
  }
},

async getAllPermissions(req, res) {
  try {
    const result = await dbqueryexecute.executeSelectObj(
      userSqlc.getAllPermissions(),
      pool
    );
    res.status(200).json(result);
  } catch (err) {
    console.error("GET PERMISSIONS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch permissions" });
  }
},

async createPermission(req, res) {
  try {
    const { s_permission_name } = req.body;

    if (!s_permission_name || !s_permission_name.trim()) {
      return res.status(400).json({ error: "Permission name required" });
    }

    const result = await dbqueryexecute.executeSelectObj(
      userSqlc.createPermission({ s_permission_name: s_permission_name.trim() }),
      pool
    );

    res.status(201).json(result[0]);
  } catch (err) {
    console.error("CREATE PERMISSION ERROR:", err);
    res.status(500).json({ error: "Failed to create permission" });
  }
},

// Replace your deletePermission function in userController.js with this:

async deletePermission(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Permission ID is required" });
    }

    // First, delete all role-permission assignments for this permission
    const deleteAssignmentsQuery = userSqlc.deletePermissionAssignments(id);
    await dbqueryexecute.executeSelectObj(deleteAssignmentsQuery, pool);

    // Then, delete the permission itself
    const deletePermissionQuery = userSqlc.deletePermission(id);
    await dbqueryexecute.executeSelectObj(deletePermissionQuery, pool);

    res.status(200).json({ message: "Permission deleted successfully" });
  } catch (err) {
    console.error("DELETE PERMISSION ERROR:", err);
    res.status(500).json({ 
      error: "Failed to delete permission",
      details: err.message 
    });
  }
},

async assignPermission(req, res) {
  try {
    const { role_id, permission_id } = req.body;

    if (!role_id || !permission_id) {
      return res.status(400).json({ error: "Role and Permission required" });
    }

    // ✅ FIX: Pass 'pool' as the second argument
    await dbqueryexecute.executeSelectObj(
      userSqlc.assignPermission({ role_id, permission_id }),
      pool  // <-- This was missing!
    );

    res.status(201).json({ message: "Permission assigned successfully" });
  } catch (err) {
    console.error("ASSIGN PERMISSION ERROR:", err);
    res.status(500).json({ error: "Failed to assign permission" });
  }
},
// Add these two methods to your userController.js

async getPermissionsByRole(req, res) {
  try {
    const { roleId } = req.params;

    if (!roleId) {
      return res.status(400).json({ error: "Role ID is required" });
    }

    const query = userSqlc.getPermissionsByRole({ roleId });
    const result = await dbqueryexecute.executeSelectObj(query, pool);

    res.status(200).json(result);
  } catch (err) {
    console.error("GET PERMISSIONS BY ROLE ERROR:", err);
    res.status(500).json({ error: "Failed to fetch role permissions" });
  }
},

async unassignPermission(req, res) {
  try {
    const { role_id, permission_id } = req.body;

    if (!role_id || !permission_id) {
      return res.status(400).json({ error: "Role and Permission required" });
    }

    const query = userSqlc.unassignPermission({ role_id, permission_id });
    await dbqueryexecute.executeSelectObj(query, pool);

    res.status(200).json({ message: "Permission unassigned successfully" });
  } catch (err) {
    console.error("UNASSIGN PERMISSION ERROR:", err);
    res.status(500).json({ error: "Failed to unassign permission" });
  }
},
};
