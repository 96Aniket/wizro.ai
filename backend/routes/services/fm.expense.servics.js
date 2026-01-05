import pool from "../../config/config.js";
import dbqueryexecute from "../../utils/dbqueryexecute.js";
 
/* ================= FETCH ================= */
 
export const fetchAllExpenses = async () => {
  return pool.query(`
    SELECT *
    FROM tbl_fm_expense_master
    ORDER BY created_at DESC
  `);
};
 
export const fetchAllEmployees = async () => {
  return pool.query(`
    SELECT employee_id, employee_name
    FROM tbl_employee_master
    ORDER BY employee_name
  `);
};
 
export const fetchExpensesByEmployee = async (empID) => {
  return pool.query(
    `
    SELECT *
    FROM tbl_fm_expense_master
    WHERE employee_id = $1
    ORDER BY created_at DESC
    `,
    [empID]
  );
};
 
/* ================= INSERT ================= */
 
export const insertExpense = async (data) => {
  const {
    expense_type,
    expense_title,
    expense_category_id,
    amount,
    expense_date,
    payment_mode,
    employee_id,
    project_id,
    vendor_id,
    remarks,
    created_by,
  } = data;
 
  return pool.query(
    `
    INSERT INTO tbl_fm_expense_master
    (
      expense_type,
      expense_title,
      expense_category_id,
      amount,
      expense_date,
      payment_mode,
      employee_id,
      project_id,
      vendor_id,
      remarks,
      approval_status,
      created_by
    )
    VALUES
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'PENDING',$11)
    RETURNING expense_id;
    `,
    [
      expense_type,
      expense_title,
      expense_category_id,
      amount,
      expense_date,
      payment_mode,
      employee_id,
      project_id,
      vendor_id,
      remarks,
      created_by,
    ]
  );
};
 
/* ================= PENDING ================= */
 
export const fetchPendingExpenses = async () => {
  return pool.query(`
    SELECT *
    FROM tbl_fm_expense_master
    WHERE approval_status = 'PENDING'
    ORDER BY created_at DESC
  `);
};
 
/* ================= APPROVE ================= */
 
export const approveExpenseById = async (expenseId, approvedBy) => {
  return pool.query(
    `
    UPDATE tbl_fm_expense_master
    SET approval_status = 'APPROVED',
        approved_by = $1
    WHERE expense_id = $2
    `,
    [approvedBy, expenseId]
  );
};
 
/* ================= REJECT ================= */
 
export const rejectExpenseById = async (
  expenseId,
  approvedBy,
  remarks
) => {
  return pool.query(
    `
    UPDATE tbl_fm_expense_master
    SET approval_status = 'REJECTED',
        approved_by = $1,
        remarks = $2
    WHERE expense_id = $3
    `,
    [approvedBy, remarks, expenseId]
  );
};
 
/* ================= DELETE ================= */
 
export const deleteExpenseById = async (expenseId) => {
  return pool.query(
    "DELETE FROM tbl_fm_expense_master WHERE expense_id = $1",
    [expenseId]
  );
};
 
 