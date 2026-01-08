import ProtectedRoute from '@/context/ProtectedRoute';
import VmLayout from '@/pages/VM/VmLayout';
import VmDashboardPage from '@/pages/VM/VmDashboardPage';
import VmCreatePage from '@/pages/VM/VmCreatePage';
import VmInvoicePage from '@/pages/VM/VmInvoicePage';
import VmListPage from '@/pages/VM/VmListPage';
import VmPaymentPage from '@/pages/VM/VmPaymentPage';
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
      path: 'create',
      element: (
        <ProtectedRoute>
          <VmCreatePage/>
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
      path: 'list',
      element: (
        <ProtectedRoute>
          <VmListPage/>
        </ProtectedRoute>
      ),
    },
    {
      path: 'payment',
      element: (
        <ProtectedRoute>
          <VmPaymentPage/>
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
