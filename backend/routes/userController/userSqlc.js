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
  deleteUser: (data) => {
    const obj = {};

    obj.queryString = 'DELETE FROM tbl_users where n_user_id = $1';
    obj.arr = [parseInt(data.id, 10)];

    return obj;
  },
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

  updateUser: (data) => {
    const obj = {};

    obj.queryString =
      'UPDATE tbl_users SET username = $1, s_email = $2, s_full_name = $3, n_role = $4 where n_user_id = $5';
    obj.arr = [
      data.username,
      data.email,
      data.full_name,
      data.role,
      parseInt(data.id, 10),
    ];

    return obj;
  },
  getAllUsers() {
    return {
      text: `SELECT * FROM tbl_users_management ORDER BY n_user_id DESC`,
      values: [],
    };
  },

createUser(data) {
  return {
    queryString: `
      INSERT INTO tbl_users_management 
      (s_full_name, s_email, s_role, d_joining_date)
      VALUES ($1, $2, $3, $4::date)
      RETURNING 
        n_user_id,
        s_full_name,
        s_email,
        s_role,
        TO_CHAR(d_joining_date, 'YYYY-MM-DD') as d_joining_date;
    `,
    arr: [data.s_full_name, data.s_email, data.s_role, data.d_joining_date],
  };
},

getAllUsers() {
  return {
    queryString: `
      SELECT 
        n_user_id,
        s_full_name,
        s_email,
        s_role,
        TO_CHAR(d_joining_date, 'YYYY-MM-DD') as d_joining_date,
        n_status,
        created_at,
        updated_at
      FROM tbl_users_management 
      ORDER BY n_user_id DESC
    `,
    arr: [],
  };
},

updateUserDetails(data) {
  return {
    queryString: `
      UPDATE tbl_users_management
      SET 
        s_full_name = $1,
        s_email = $2,
        s_role = $3,
        d_joining_date = $4::date
      WHERE n_user_id = $5
      RETURNING 
        n_user_id,
        s_full_name,
        s_email,
        s_role,
        TO_CHAR(d_joining_date, 'YYYY-MM-DD') as d_joining_date;
    `,
    arr: [
      data.s_full_name,
      data.s_email,
      data.s_role,
      data.d_joining_date,
      data.n_user_id
    ],
  };
},
deleteUserById(data) {
  return {
    queryString: `DELETE FROM tbl_users_management WHERE n_user_id = $1`,
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
      queryString: "SELECT * FROM tbl_permission_master ORDER BY n_id ASC;",
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

  deletePermission(id) {
    return {
      queryString: `DELETE FROM tbl_permission_master WHERE n_id = $1`,
      arr: [id],
    };
  },


};
