import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import axiosInstance, { setAccessToken } from '@/lib/axiosConfig';
import { href } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ================= PERMISSION HELPER =================
const normalizePermission = (p) =>
  p.trim().toUpperCase().replace(/\s+/g, '_');

const hasPermission = (permissionName) => {
  if (!user || !Array.isArray(user.permissions)) return false;

  return user.permissions.some(
    (p) => normalizePermission(p) === permissionName
  );
};


  // ================= AUTO LOGIN (REFRESH TOKEN) =================
  const tryAutoLogin = async () => {
    try {
      const res = await axiosInstance.post('/user/refresh');

      setAccessToken(res.data.accessToken);

      setUser({
        email: res.data.email,
        empID: res.data.empID,
        fullName: res.data.fullName,
        role: res.data.role,
        permissions: res.data.permissions || [],
      });

      // console.log('USER PERMISSIONS 👉', res.data.permissions);

      setIsAuthenticated(true);
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    tryAutoLogin();
  }, []);

  // ================= LOGIN =================
const login = async (data) => {
  setLoading(true);
  try {
    const res = await axiosInstance.post('/user/login', data, {
      withCredentials: true,
    });

    setAccessToken(res.data.accessToken);

    const userObj = {
      email: res.data.email,
      empID: res.data.empID,
      fullName: res.data.fullName,
      role: res.data.role,
      permissions: res.data.permissions || [],
    };

    setUser(userObj);
    setIsAuthenticated(true);

    toast.success(`Welcome back, ${res.data.fullName}!`);

    // ✅ VERY IMPORTANT
    return { success: true };
  } catch (error) {
    toast.error(error.response?.data?.Mess || 'Invalid credentials');
    return { success: false };
  } finally {
    setLoading(false);
  }
};


  // ================= REGISTER =================
  const register = async (data) => {
    setLoading(true);
    try {
      await axiosInstance.post('/user/register', data, { withCredentials: true });
      toast.success(`Welcome, continue by logging in, ${data.fullName}!`);
      return 200;
    } catch (error) {
      toast.error(error.response?.data?.mess || 'Something went wrong!');
      return 400;
    } finally {
      setLoading(false);
    }
  };

  // ================= LOGOUT =================
  const logout = async () => {
    try {
      await axiosInstance.post('/user/logout', {}, { withCredentials: true });
    } catch {
      toast.error('Logout failed');
    }

    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };


  //================== page ======================
  // ✅ UM navigation – DB driven, NO hardcoded roles
const getUmNavigationItems = () => {
  if (!hasPermission('USER_MANAGEMENT')) return [];

  return [
    { id: 'dashboard', name: 'Dashboard', href: '/um/dashboard' },
    { id: 'users', name: 'Users', href: '/um/users' },
    { id: 'permission', name: 'Permission', href: '/um/permission' },
  ];
};

// ✅ AM navigation – DB driven, NO hardcoded roles
const getAmNavigationItems = () => {
  if (!hasPermission('ATTENDANCE_MANAGEMENT')) return [];

  return [
    { id: 'dashboard', name: 'Dashboard', href: '/am/dashboard' },
    { id: 'attendance', name: 'Attendance', href: '/am/attendance' },
    { id: 'myleave', name: 'My Leave', href: '/am/myleave' },
  ];
};

// ✅ HR navigation – DB driven, NO hardcoded roles
const getHrNavigationItems = () => {
  if (!hasPermission('HR_MANAGEMENT')) return [];

  return [
    { id: 'dashboard', name: 'Dashboard', href: '/hr/dashboard' },
    { id: 'employees', name: 'Employees', href: '/hr/employees' },
    { id: 'payroll', name: 'Payroll', href: '/hr/payroll' },
    { id: 'performance', name: 'Performance', href: '/hr/performance' },
  ];
};

// ✅ PM navigation – DB driven, NO hardcoded roles
const getPmNavigationItems = () => {
  if (!hasPermission('PROJECT_MANAGEMENT')) return [];

  return [
    { id: 'dashboard', name: 'Dashboard', href: '/pm/dashboard' },
    { id: 'projects', name: 'Projects', href: '/pm/projects' },
    { id: 'tasks', name: 'Tasks', href: '/pm/tasks' },
    { id: 'timesheet', name: 'Timesheet', href: '/pm/timesheet' },
  ];
};

// ✅ TM navigation – DB driven, NO hardcoded roles
const getTmNavigationItems = () => {
  if (!hasPermission('TICKET_MANAGEMENT')) return [];

  return [
    { id: 'dashboard', name: 'Dashboard', href: '/tm/dashboard' },
    { id: 'tickets', name: 'Tickets', href: '/tm/tickets' },
    { id: 'assignment', name: 'My Tickets', href: '/tm/assignment' },
    { id: 'create', name: 'Create Ticket', href: '/tm/create' },
  ];
};
// ✅ FM navigation – DB driven, NO hardcoded roles
const getFmNavigationItems = () => {
  if (!hasPermission('FINANCE_MANAGEMENT')) return [];

  return [
    { id: 'dashboard', name: 'Dashboard', href: '/fm/dashboard' },
    { id: 'expenses', name: 'Expenses', href: '/fm/expenses' },
    { id: 'add-expense', name: 'Add Expense', href: '/fm/expenses/add' },
    { id: 'approvals', name: 'Expense Approvals', href: '/fm/expenses/approvals' },
  ];
};
// ✅ VM navigation – DB driven, NO hardcoded roles
const getVmNavigationItems = () => {
  if (!hasPermission('VENDOR_MANAGEMENT')) return [];

  return [
    { id: 'dashboard', name: 'Dashboard', href: '/vm/dashboard' },
    { id: 'create', name: 'Create', href: '/vm/create' },
    { id: 'invoice', name: 'Invoice', href: '/vm/invoice' },
    { id: 'list', name: 'List', href: '/vm/list' },
    { id: 'payment', name: 'Payment', href: '/vm/payment' },
    { id: 'view', name: 'View', href: '/vm/view' },
  ];
};


  // ================= CONTEXT VALUE =================
  const value = {
    user,
    loading,
    isAuthenticated,

    // auth actions
    login,
    logout,
    register,

    // permission helper
    hasPermission,
    getUmNavigationItems,
    getAmNavigationItems,
    getHrNavigationItems,
    getPmNavigationItems,
    getTmNavigationItems,
    getFmNavigationItems,
    getVmNavigationItems,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
