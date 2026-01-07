import { FolderKanban, Users, Clock, UserCog, Ticket, ArrowRight, Menu, X, Receipt, Briefcase } from 'lucide-react';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import { useAuth } from '@/context/AuthContext';

export default function MainPage() {
  // const [_hoveredModule, setHoveredModule] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const { user, loading } = useAuth();

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center text-xl font-medium">Loading...</div>;
  }

  // let roleId = null;

  // if (typeof user.role === 'string') {
  //   const roleMap = {
  //     admin: 1,
  //     pm: 2,
  //     employee: 3,
  //     hr: 4,
  //   };

  //   roleId = roleMap[user.role] || null;
  // } else {
  //   roleId = user.role;
  // }

  // MODULE LIST
  const normalizePermission = (permission) =>
  permission
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');

    

const allModules = [
  {
    id: 1,
    title: 'Project Management',
    description: 'Manage projects, tasks, timelines, and team collaboration',
    keyFeatures: ['Dashboard', 'Projects & Team', 'Task Management', 'Timesheet'],
    permission: 'PROJECT_MANAGEMENT',
    route: '/pm/dashboard',
    icon: FolderKanban,
    color: 'blue',
  },
  {
    id: 2,
    title: 'HR Management',
    description: 'Employee management, payroll, and recruitment',
    keyFeatures: ['Dashboard', 'Payroll Processing', 'Emp Management', 'Performance Review'],
    permission: 'HR_MANAGEMENT',
    route: '/hr/dashboard',
    icon: Users,
    color: 'purple',
  },
  {
    id: 3,
    title: 'Ticket Management',
    description: 'Support tickets, issue tracking, and customer queries',
    keyFeatures: ['Issue Tracking', 'SLA Monitoring', 'Priority Management', 'Customer Support'],
    permission: 'TICKET_MANAGEMENT',
    route: '/tm/dashboard',
    icon: Ticket,
    color: 'pink',
  },
  {
    id: 4,
    title: 'Attendance Management',
    description: 'Track employee attendance, shifts, and working hours',
    keyFeatures: ['Dashboard', 'Clock In/Out', 'Leave Tracking', 'Reports'],
    permission: 'ATTENDANCE_MANAGEMENT',
    route: '/am/dashboard',
    icon: Clock,
    color: 'green',
  },
  {
    id: 5,
    title: 'User Management',
    description: 'Manage users, roles, permissions, and access control settings',
    keyFeatures: ['User Accounts', 'Permissions', 'Role Management', 'Access Control'],
    permission: 'USER_MANAGEMENT',
    route: '/um/dashboard',
    icon: UserCog,
    color: 'orange',
  },
  {
    id: 6,
    title: 'Finance Management',
    description: 'Handle invoices, payments, expenses, and budgeting',
    keyFeatures: ['Dashboard','Exp-Management', 'InvoiceManagement', 'All Expenses', 'Payments','Budget','Reports'],
    permission: 'FINANCE_MANAGEMENT',
    route: '/fm/dashboard',
    icon: Receipt,
    color: 'amber',
  },
  {
    id: 7,
    title: 'Vendor Management',
    description: 'Manage vendors, contracts, performance, and purchase orders',
    keyFeatures: [
      'Dashboard',
      'Vendor Profiles',
      'Purchase Orders',
      'Vendor Payments',
      'Vendor Performance',
      'Contract Upload',
    ],
    permission: 'VENDOR_MANAGEMENT',
    route: '/vendor/dashboard',
    icon: Briefcase,
    color: 'teal',
  },
];


  //  ROLE-BASED MODULE ACCESS

  // const roleModulesMap = {
  //   1: ['project', 'hr', 'ticket', 'attendance', 'finance', 'vendor','user'], // Admin
  //   2: ['project', 'hr', 'ticket', 'attendance', 'finance', 'user'], // PM
  //   3: ['project', 'hr', 'ticket', 'attendance', 'finance', 'user'], // Employee
  //   4: ['hr', 'ticket', 'attendance', 'finance', 'vendor', 'user'], // HR
  // };

  // const modules = roleId ? allModules.filter((mod) => roleModulesMap[roleId]?.includes(mod.key)) : [];
const modules = allModules.filter((module) =>
  user.permissions?.some(
    (p) => normalizePermission(p) === module.permission
  )
);



  //  COLOR THEMES FOR MODULE CARDS

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bag: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        button: 'text-blue-600 border-blue-200 hover:bg-blue-50',
      },
      purple: {
        bag: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
        button: 'text-purple-600 border-purple-200 hover:bg-purple-50',
      },
      green: {
        bag: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-200',
        dot: 'bg-green-500',
        button: 'text-green-600 border-green-200 hover:bg-green-50',
      },
      orange: {
        bag: 'bg-orange-50',
        text: 'text-orange-600',
        border: 'border-orange-200',
        dot: 'bg-orange-500',
        button: 'text-orange-600 border-orange-200 hover:bg-orange-50',
      },
      pink: {
        bag: 'bg-pink-50',
        text: 'text-pink-600',
        border: 'border-pink-200',
        dot: 'bg-pink-500',
        button: 'text-pink-600 border-pink-200 hover:bg-pink-50',
      },
      amber: {
        bag: 'bg-amber-50',
        text: 'text-amber-600',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        button: 'text-amber-600 border-amber-200 hover:bg-amber-50',
      },
      teal: {
        bag: 'bg-teal-50',
        text: 'text-teal-600',
        border: 'border-teal-200',
        dot: 'bg-teal-500',
        button: 'text-teal-600 border-teal-200 hover:bg-teal-50',
      },
    };

    return colors[color];
  };

  const Sidebar = () => (
    <aside
      className={`fixed top-0 left-0 h-full bg-slate-900 text-white w-64 transform transition-transform duration-300 z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-bold">KosquTrack</h2>
        <button onClick={() => setSidebarOpen(false)}>
          <X className="w-5 h-5 text-slate-300 hover:text-white" />
        </button>
      </div>

      <nav className="mt-4 space-y-1">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const isActive = window.location.pathname === mod.route;

          return (
            <div
              key={mod.id}
              onClick={() => navigate(mod.route)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg mx-2 transition-all duration-200 ${
                isActive ? 'bg-slate-700' : 'hover:bg-slate-800'
              }`}
            >
              <Icon className="w-5 h-5 text-slate-200" />
              <span className="text-sm font-medium">{mod.title}</span>
            </div>
          );
        })}
      </nav>
    </aside>
  );

  const handleModuleClick = (module) => navigate(module.route);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <header className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-md hover:bg-slate-200" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="w-5 h-5 text-slate-800" />
              </button>

              <div>
                <h1 className="text-xl font-bold text-slate-900">KosquTrack</h1>
                <p className="text-xs text-slate-500">Business Management Platform</p>
              </div>
            </div>

            <div className="ml-3 pl-3 border-l border-slate-200 flex items-center">
              <div className="w-8 h-8 bg-[var(--color-chart-4)] rounded-full flex items-center justify-center font-medium text-sm text-white">
                {user?.fullName?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="max-w-7xl mx-auto lg:px-8 py-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-1">Welcome back, {user?.fullName}</h2>
            <p className="text-slate-600 text-lg">Select a module to access your workspace</p>
          </div>

          {/* PROFESSIONAL RESPONSIVE GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((module) => {
              const IconComponent = module.icon;
              const colors = getColorClasses(module.color);

              return (
                <Card
                  key={module.id}
                  className="cursor-pointer transition-all duration-300 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 rounded-xl h-[500px] flex flex-col"
                  onClick={() => handleModuleClick(module)}
                >
                  <CardHeader className="p-5 flex items-center justify-center">
                    <div className={`${colors.bag} p-5 rounded-xl border ${colors.border}`}>
                      <IconComponent className={`w-10 h-10 ${colors.text}`} />
                    </div>
                  </CardHeader>

                  <CardContent className="px-5 pb-6 flex flex-col flex-1">
                    <CardTitle className="text-xl text-slate-900 mb-1">{module.title}</CardTitle>

                    <CardDescription className="text-slate-600 text-sm mb-4">{module.description}</CardDescription>

                    <p className="text-slate-500 font-semibold text-xs mb-3">KEY FEATURES</p>

                    <div className="grid grid-cols-2 gap-y-1 gap-x-3 mb-5 flex-1">
                      {(module.keyFeatures || []).map((feature, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <span className={`w-2 h-2 mt-1 rounded-full ${colors.dot}`} />
                          <span className="text-slate-600 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      className={`w-full py-3 rounded-lg font-medium transition-all duration-300 border ${colors.button} flex items-center justify-center space-x-2`}
                    >
                      <span>Open Module</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
