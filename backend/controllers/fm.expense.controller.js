import {
  fetchAllEmployees,
  fetchAllExpenses,
  fetchExpensesByEmployee,
  insertExpense,
  approveExpenseById,
  rejectExpenseById,
  fetchPendingExpenses,
  deleteExpenseById,
} from '../routes/services/fm.expense.servics';

/* ================= GET ALL EXPENSES ================= */

export const getPendingExpenses = async (_req, res) => {
  try {
    const result = await fetchPendingExpenses();
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('GET PENDING EXPENSES ERROR:', error);
    res.status(500).json({ message: 'Failed to fetch pending expenses' });
  }
};

export const getAllExpenses = async (req, res) => {
  try {
    let result;

    // EMP → only own expenses
    if (req.user.role === 3) {
      result = await fetchExpensesByEmployee(req.user.empID);
    } else {
      result = await fetchAllExpenses();
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('GET EXPENSES ERROR:', error);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
};

/* ================= GET ALL EMPLOYEES ================= */

export const getAllEmployees = async (_req, res) => {
  try {
    const result = await fetchAllEmployees();
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('GET EMPLOYEES ERROR:', error);
    res.status(500).json({ message: 'Failed to fetch employees' });
  }
};

/* ================= CREATE EXPENSE ================= */

export const createExpense = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.user.empID,
    };

    const result = await insertExpense(payload);

    res.status(201).json({
      success: true,
      expense_id: result.rows[0].expense_id,
    });
  } catch (error) {
    console.error('CREATE EXPENSE ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

/* ================= APPROVE ================= */

export const approveExpense = async (req, res) => {
  try {
    await approveExpenseById(req.params.id, req.body.approved_by);

    res.status(200).json({ message: 'Expense approved' });
  } catch (error) {
    console.error('APPROVE ERROR:', error);
    res.status(500).json({ message: 'Approve failed' });
  }
};

/* ================= REJECT ================= */

export const rejectExpense = async (req, res) => {
  try {
    await rejectExpenseById(
      req.params.id,
      req.body.approved_by,
      req.body.remarks,
    );

    res.status(200).json({ message: 'Expense rejected' });
  } catch (error) {
    console.error('REJECT ERROR:', error);
    res.status(500).json({ message: 'Reject failed' });
  }
};

/* ================= DELETE ================= */

export const deleteExpense = async (req, res) => {
  try {
    await deleteExpenseById(req.params.id);
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('DELETE ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};
