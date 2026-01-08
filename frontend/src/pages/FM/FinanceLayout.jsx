// src/pages/FM/FinanceLayout.jsx
import { NavLink, Outlet } from "react-router-dom";

const FinanceLayout = () => {
  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      {/* TOP FINANCE NAVBAR */}
      <div className="border-b border-[#e5e9f2] bg-[#f7f9fc]">
        <div className="px-6 h-[64px] flex items-center justify-between">

          {/* Logo */}
          <h1 className="text-xl font-semibold text-[#00a8a8]">
            KosquFinance
          </h1>


          {/* Navigation */}
          <nav className="flex items-center gap-8 text-[15px]">
            <NavLink
              to="/fm/dashboard"
              className={({ isActive }) =>
                isActive
                  ? "text-[#00a8a8] font-semibold"
                  : "text-[#1f2937] hover:text-[#00a8a8]"
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/fm/expenses"
              className={({ isActive }) =>
                isActive
                  ? "text-[#00a8a8] font-semibold"
                  : "text-[#1f2937] hover:text-[#00a8a8]"
              }
            >
              Expense Management
            </NavLink>

            <NavLink
              to="/fm/invoices"
              className={({ isActive }) =>
                isActive
                  ? "text-[#00a8a8] font-semibold"
                  : "text-[#1f2937] hover:text-[#00a8a8]"
              }
            >
              Invoice Management
            </NavLink>

            <NavLink
              to="/fm/payments"
              className={({ isActive }) =>
                isActive
                  ? "text-[#00a8a8] font-semibold"
                  : "text-[#1f2937] hover:text-[#00a8a8]"
              }
            >
              Payments
            </NavLink>

            <NavLink
              to="/fm/budget"
              className={({ isActive }) =>
                isActive
                  ? "text-[#00a8a8] font-semibold"
                  : "text-[#1f2937] hover:text-[#00a8a8]"
              }
            >
              Budget
            </NavLink>

            <NavLink
              to="/fm/reports"
              className={({ isActive }) =>
                isActive
                  ? "text-[#00a8a8] font-semibold"
                  : "text-[#1f2937] hover:text-[#00a8a8]"
              }
            >
              Reports
            </NavLink>
          </nav>
        </div>
      </div>

      {/* CHILD PAGE */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Outlet />
      </div>
    </div>

  );
};

export default FinanceLayout;
