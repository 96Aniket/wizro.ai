import ProtectedRoute from '@/context/ProtectedRoute';
import VmLayout from '@/pages/VM/VmLayout';
import VmDashboardPage from '@/pages/VM/VmDashboardPage';
import VmInvoicePage from '@/pages/VM/VmInvoicePage';
import VmViewPage from '@/pages/VM/VmViewPage';

export default {
  path: '/vm',
  element: <VmLayout/>,

  children: [
    {
      path: 'dashboard',
      element: (
        <ProtectedRoute>
          <VmDashboardPage/>
        </ProtectedRoute>
      ),
    },
    {
      path: 'invoice',
      element: (
        <ProtectedRoute>
          <VmInvoicePage/>
        </ProtectedRoute>
      ),
    },
    {
      path: 'view',
      element: (
        <ProtectedRoute>
          <VmViewPage/>
        </ProtectedRoute>
      ),
    },
  ],
};
