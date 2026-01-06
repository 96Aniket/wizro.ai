export default {
  clearRefreshToken(data) {
    const obj = {};

    const { userId } = data;

    obj.queryString = `
      UPDATE public.tbl_users
      SET refresh_token = NULL
      WHERE n_user_id = $1;
    `;
    obj.arr = [userId];

    return obj;
  },
  // deleteUser: (data) => {
  //   const obj = {};

  //   obj.queryString = 'DELETE FROM tbl_users where n_user_id = $1';
  //   obj.arr = [parseInt(data.id, 10)];

  //   return obj;
  // },
  getDuplicate: (data) => {
    const obj = {};

    obj.queryString = 'SELECT * FROM tbl_users WHERE s_email = $1;';
    obj.arr = [data.email];

    return obj;
  },
  getUserById(data) {
    const obj = {};

    const { userId } = data;

    obj.queryString = `
      SELECT * FROM public.tbl_users WHERE n_user_id = $1;
    `;
    obj.arr = [userId];

    return obj;
  },
  login: (data) => {
    const obj = {};

    obj.queryString = 'SELECT * FROM tbl_users WHERE s_email = $1;';
    obj.arr = [data.email];

    return obj;
  },

  register: (data) => {
    const obj = {};

    obj.queryString =
      'INSERT INTO tbl_users (s_full_name, s_email, s_password, n_role, n_created_by) VALUES ($1,$2,$3,$4,$5);';
    obj.arr = [data.fullName, data.email, data.password, 'admin', 0];

    return obj;
  },

  updateRefreshToken(data) {
    const obj = {};

    const { userId, refreshToken } = data;

    obj.queryString = `
      UPDATE public.tbl_users
      SET refresh_token = $1
      WHERE n_user_id = $2;
    `;
    obj.arr = [refreshToken, userId];

    return obj;
  },

  // updateUser: (data) => {
  //   const obj = {};

  //   obj.queryString =
  //     'UPDATE tbl_users SET username = $1, s_email = $2, s_full_name = $3, n_role = $4 where n_user_id = $5';
  //   obj.arr = [
  //     data.username,
  //     data.email,
  //     data.full_name,
  //     data.role,
  //     parseInt(data.id, 10),
  //   ];

  //   return obj;
  // },

  // ==================== USER CRUD ====================

  getAllUsers() {
    return {
      queryString: `
        SELECT
          n_user_id,
          s_full_name,
          s_email,
          n_role,
          n_status,
          TO_CHAR(d_joining_date, 'YYYY-MM-DD') AS d_joining_date,
          s_aadhar_card_no,
          s_pan_card_no,
          s_bank_name,
          s_bank_account_no,
          s_bank_ifsc_code,
          CASE WHEN b_aadhar_card_img IS NOT NULL THEN true ELSE false END as has_aadhar_img,
          CASE WHEN b_pan_card_img IS NOT NULL THEN true ELSE false END as has_pan_img,
          CASE WHEN b_passport_photo IS NOT NULL THEN true ELSE false END as has_passport_photo,
          CASE WHEN b_10th_mark_sheet IS NOT NULL THEN true ELSE false END as has_10th_marksheet,
          CASE WHEN b_12th_mark_sheet IS NOT NULL THEN true ELSE false END as has_12th_marksheet,
          CASE WHEN b_degree_mark_sheet IS NOT NULL THEN true ELSE false END as has_degree_marksheet,
          CASE WHEN b_certificates IS NOT NULL THEN true ELSE false END as has_certificates,
          CASE WHEN b_professional_certifications IS NOT NULL THEN true ELSE false END as has_professional_certs,
          CASE WHEN b_offer_letter IS NOT NULL THEN true ELSE false END as has_offer_letter,
          CASE WHEN b_experience_letter IS NOT NULL THEN true ELSE false END as has_experience_letter,
          CASE WHEN b_salary_slips IS NOT NULL THEN true ELSE false END as has_salary_slips,
          CASE WHEN b_bank_passbook_copy IS NOT NULL THEN true ELSE false END as has_bank_passbook,
          CASE WHEN b_resume_cv IS NOT NULL THEN true ELSE false END as has_resume
        FROM tbl_users
        ORDER BY n_user_id ASC;
      `,
      arr: [],
    };
  },

  getUserWithDocuments(data) {
    return {
      queryString: `
        SELECT *
        FROM tbl_users
        WHERE n_user_id = $1;
      `,
      arr: [data.n_user_id],
    };
  },

  createUser(data) {
    return {
      queryString: `
        INSERT INTO tbl_users (
          s_full_name, s_email, s_password, n_role, n_status, d_joining_date,
          s_aadhar_card_no, b_aadhar_card_img,
          s_pan_card_no, b_pan_card_img,
          b_passport_photo, b_10th_mark_sheet, b_12th_mark_sheet,
          b_degree_mark_sheet, b_certificates, b_professional_certifications,
          b_offer_letter, b_experience_letter, b_salary_slips,
          s_bank_name, s_bank_account_no, s_bank_ifsc_code, b_bank_passbook_copy,
          b_resume_cv
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,
          $7,$8,$9,$10,$11,$12,$13,
          $14,$15,$16,$17,$18,$19,
          $20,$21,$22,$23,$24
        )
        RETURNING n_user_id;
      `,
      arr: [
        data.s_full_name,
        data.s_email,
        data.s_password,
        data.n_role,
        data.n_status,
        data.d_joining_date,
        data.s_aadhar_card_no || null,
        data.b_aadhar_card_img || null,
        data.s_pan_card_no || null,
        data.b_pan_card_img || null,
        data.b_passport_photo || null,
        data.b_10th_mark_sheet || null,
        data.b_12th_mark_sheet || null,
        data.b_degree_mark_sheet || null,
        data.b_certificates || null,
        data.b_professional_certifications || null,
        data.b_offer_letter || null,
        data.b_experience_letter || null,
        data.b_salary_slips || null,
        data.s_bank_name || null,
        data.s_bank_account_no || null,
        data.s_bank_ifsc_code || null,
        data.b_bank_passbook_copy || null,
        data.b_resume_cv || null,
      ],
    };
  },

  updateUser(data) {
    return {
      queryString: `
        UPDATE tbl_users
        SET
          s_full_name = $1,
          s_email = $2,
          n_role = $3,
          d_joining_date = $4,
          n_status = $5,
          s_aadhar_card_no = COALESCE($6, s_aadhar_card_no),
          b_aadhar_card_img = COALESCE($7, b_aadhar_card_img),
          s_pan_card_no = COALESCE($8, s_pan_card_no),
          b_pan_card_img = COALESCE($9, b_pan_card_img),
          b_passport_photo = COALESCE($10, b_passport_photo),
          b_10th_mark_sheet = COALESCE($11, b_10th_mark_sheet),
          b_12th_mark_sheet = COALESCE($12, b_12th_mark_sheet),
          b_degree_mark_sheet = COALESCE($13, b_degree_mark_sheet),
          b_certificates = COALESCE($14, b_certificates),
          b_professional_certifications = COALESCE($15, b_professional_certifications),
          b_offer_letter = COALESCE($16, b_offer_letter),
          b_experience_letter = COALESCE($17, b_experience_letter),
          b_salary_slips = COALESCE($18, b_salary_slips),
          s_bank_name = COALESCE($19, s_bank_name),
          s_bank_account_no = COALESCE($20, s_bank_account_no),
          s_bank_ifsc_code = COALESCE($21, s_bank_ifsc_code),
          b_bank_passbook_copy = COALESCE($22, b_bank_passbook_copy),
          b_resume_cv = COALESCE($23, b_resume_cv)
        WHERE n_user_id = $24
        RETURNING n_user_id, s_full_name, s_email, n_role, d_joining_date, n_status;
      `,
      arr: [
        data.s_full_name,
        data.s_email,
        data.n_role,
        data.d_joining_date,
        data.n_status ?? 1,
        data.s_aadhar_card_no,
        data.b_aadhar_card_img,
        data.s_pan_card_no,
        data.b_pan_card_img,
        data.b_passport_photo,
        data.b_10th_mark_sheet,
        data.b_12th_mark_sheet,
        data.b_degree_mark_sheet,
        data.b_certificates,
        data.b_professional_certifications,
        data.b_offer_letter,
        data.b_experience_letter,
        data.b_salary_slips,
        data.s_bank_name,
        data.s_bank_account_no,
        data.s_bank_ifsc_code,
        data.b_bank_passbook_copy,
        data.b_resume_cv,
        data.n_user_id,
      ],
    };
  },

  deleteUsers(data) {
    return {
      queryString: `
        DELETE FROM tbl_users
        WHERE n_user_id = $1;
      `,
      arr: [data.n_user_id],
    };
  },


  createRole(data) {
    return {
      queryString: `
      INSERT INTO tbl_role_master (s_role_name)
      VALUES ($1)
      RETURNING *;
    `,
      arr: [data.s_role_name],
    };
  },

  getAllRoles() {
    return {
      queryString: `
      SELECT n_id, s_role_name
      FROM tbl_role_master
      ORDER BY n_id ASC;
    `,
      arr: [],
    };
  },

  updateRole(data) {
    return {
      queryString: `
      UPDATE tbl_role_master
      SET s_role_name = $1
      WHERE n_id = $2
      RETURNING *;
    `,
      arr: [data.s_role_name, data.n_id],
    };
  },

  deleteRole(data) {
    return {
      queryString: `
      DELETE FROM tbl_role_master
      WHERE n_id = $1;
    `,
      arr: [data.n_id],
    };
  },

  getAllPermissions() {
    return {
      queryString: 'SELECT * FROM tbl_permission_master ORDER BY n_id ASC;',
      arr: [],
    };
  },

  createPermission(data) {
    return {
      queryString: `
        INSERT INTO tbl_permission_master (s_permission_name)
        VALUES ($1)
        RETURNING *;
      `,
      arr: [data.s_permission_name],
    };
  },

  updatePermission(data) {
    return {
      queryString: `
        UPDATE tbl_permission_master
        SET s_permission_name = $1
        WHERE n_id = $2
        RETURNING *;
      `,
      arr: [data.s_permission_name, data.n_id],
    };
  },

  deletePermissionAssignments(id) {
    return {
      queryString: `DELETE FROM tbl_role_permissions WHERE permission_id = $1`,
      arr: [id],
    };
  },

  deletePermission(id) {
    return {
      queryString: `DELETE FROM tbl_permission_master WHERE n_id = $1`,
      arr: [id],
    };
  },
  assignPermission(data) {
    return {
      queryString: `
      INSERT INTO tbl_role_permissions (role_id, permission_id)
      VALUES ($1, $2)
      RETURNING *;
    `,
      arr: [data.role_id, data.permission_id],
    };
  },
  // Add these two methods to your userSqlc.js export default object

  getPermissionsByRole(data) {
    return {
      queryString: `
      SELECT 
        rp.id,
        rp.role_id,
        rp.permission_id,
        pm.s_permission_name as permission_name
      FROM tbl_role_permissions rp
      INNER JOIN tbl_permission_master pm ON rp.permission_id = pm.n_id
      WHERE rp.role_id = $1
      ORDER BY pm.s_permission_name ASC
    `,
      arr: [data.roleId],
    };
  },

  unassignPermission(data) {
    return {
      queryString: `
      DELETE FROM tbl_role_permissions 
      WHERE role_id = $1 AND permission_id = $2
    `,
      arr: [data.role_id, data.permission_id],
    };
  },
  getPermissionsByRoleId(data) {
  return {
    queryString: `
      SELECT pm.s_permission_name
      FROM tbl_role_permissions rp
      JOIN tbl_permission_master pm
        ON pm.n_id = rp.permission_id
      WHERE rp.role_id = $1
      ORDER BY pm.s_permission_name ASC
    `,
    arr: [data.roleId],
  };
},

};
