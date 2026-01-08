import { Plus, Search } from 'lucide-react';
import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';

import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ui/ThemeToggle';

const VmLayout = () => {
  const { getVmNavigationItems } = useAuth();

  return (
    <div className="h-screen flex flex-col bg-[var(--color-background)] overflow-hidden">
      {/* Navigation Bar */}
      <nav className="border-b border-[var(--color-border)] px-6 py-3 bg-[var(--color-muted)]">
        <div className="flex items-center justify-between">
          {/* Left side: logo + navigation */}
          <div className="flex items-center space-x-8">
            <Link
              to="/main"
              className="text-xl font-semibold text-[var(--color-chart-2)]"
            >
              KosquTrack
            </Link>

            <div className="flex items-center space-x-6 text-sm">
              {getVmNavigationItems().map((link) => (
                <NavLink
                  key={link.id}
                  to={link.href}
                  className={({ isActive }) =>
                    `${
                      isActive
                        ? 'text-[var(--color-chart-2)] font-semibold'
                        : 'text-[var(--color-foreground)] hover:text-[var(--color-chart-4)]'
                    } cursor-pointer`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right side: search, theme, create, user */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] w-4 h-4" />
              <Input
                placeholder="VMs, instances, tasks..."
                className="pl-10 w-80 bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:border-[var(--color-chart-2)] focus:ring-1 focus:ring-[var(--color-chart-2)]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted-foreground)]">
                Ctrl+K
              </span>
            </div>

            <ThemeToggle />

            {/* Create VM */}
            {/* <Link
              to="/vm/create"
              className="flex items-center gap-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            >
              <Plus className="w-4 h-4" />
              <span>Create VM</span>
            </Link> */}

            {/* User avatar */}
            <div className="w-8 h-8 bg-[var(--color-chart-4)] rounded-full flex items-center justify-center font-medium text-sm text-white">
              S
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto bg-[var(--color-background)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VmLayout;
