import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosConfig";
import { useAuth } from "@/context/AuthContext";

const ExpenseList = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axiosInstance.get("/fm/expenses");
      setExpenses(res.data || []);
    } catch (err) {
      console.error("Fetch expense error", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  /* ================= ROLE ================= */

  const roleMap = {
    1: "admin",
    2: "project manager",
    3: "emp",
    4: "hr",
  };

  const role =
    typeof user.role === "number" ? roleMap[user.role] : user.role;

  const canModify =
    role === "admin" || role === "hr" || role === "project manager";

  /* ================= ACTION HANDLERS ================= */

  const approveExpense = async (id) => {
    try {
      await axiosInstance.post(`/fm/expenses/${id}/approve`, {
        approved_by: user.empID,
      });
      fetchExpenses();
    } catch {
      alert("Failed to approve expense");
    }
  };

  const rejectExpense = async (id) => {
    const reason = prompt("Enter rejection reason");
    if (!reason) return;

    try {
      await axiosInstance.post(`/fm/expenses/${id}/reject`, {
        approved_by: user.empID,
        remarks: reason,
      });
      fetchExpenses();
    } catch {
      alert("Failed to reject expense");
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?"))
      return;

    try {
      await axiosInstance.delete(`/fm/expenses/${id}`);
      fetchExpenses();
    } catch {
      alert("Failed to delete expense");
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };


  const getApproverLabel = (role) => {
    switch (role) {
      case 1:
        return "Admin";
      case 4:
        return "HR";
      case 2:
        return "Project Manager";
      default:
        return "";
    }
  };


  /* ================= UI ================= */

  return (
    <div className="bg-white rounded-xl shadow border border-slate-200 overflow-visible">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-left">Title</th>
            <th className="px-4 py-3 text-left">Amount</th>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Reason</th>
            {canModify && (
              <th className="px-4 py-3 text-left">Action</th>
            )}

          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" className="py-10 text-center text-slate-500">
                Loading expenses...
              </td>
            </tr>
          ) : expenses.length === 0 ? (
            <tr>
              <td colSpan="7" className="py-10 text-center text-slate-500">
                No expenses found
              </td>
            </tr>
          ) : (
            expenses.map((exp) => (
              <tr key={exp.expense_id} className="border-t">
                <td className="px-4 py-3">{exp.expense_type}</td>
                <td className="px-4 py-3">{exp.expense_title}</td>
                <td className="px-4 py-3 font-medium">₹{exp.amount}</td>
                <td className="px-4 py-3">
                  {formatDate(exp.expense_date)}
                </td>

                <td className="px-4 py-3">
                  {exp.approval_status === "APPROVED" && exp.approved_by_role
                    ? `Approved by ${getApproverLabel(exp.approved_by_role)}`
                    : exp.approval_status}
                </td>


                {/* Reason column */}
                <td className="px-4 py-3">
                  {exp.approval_status === "REJECTED"
                    ? exp.remarks
                    : ""}
                </td>

                {/* Action column – ONLY if canModify */}
                {canModify && (
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === exp.expense_id
                            ? null
                            : exp.expense_id
                        )
                      }
                      className="text-blue-600 text-xs font-semibold"
                    >
                      Actions ▾
                    </button>

                    {openMenuId === exp.expense_id && (
                      <div className="absolute right-4 mt-2 w-32 bg-white border rounded shadow z-10">
                        <button
                          onClick={() => approveExpense(exp.expense_id)}
                          className="block w-full px-3 py-2 text-left text-green-600 hover:bg-slate-100 text-xs"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => rejectExpense(exp.expense_id)}
                          className="block w-full px-3 py-2 text-left text-orange-600 hover:bg-slate-100 text-xs"
                        >
                          Reject
                        </button>

                        {role === "admin" && (
                          <button
                            onClick={() => deleteExpense(exp.expense_id)}
                            className="block w-full px-3 py-2 text-left text-red-600 hover:bg-slate-100 text-xs"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                )}
              </tr>

            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseList;

