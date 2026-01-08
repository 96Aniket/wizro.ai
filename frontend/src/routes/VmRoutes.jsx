import ProtectedRoute from '@/context/ProtectedRoute';
import VmLayout from '@/pages/VM/VmLayout';
import VmDashboardPage from '@/pages/VM/VmDashboardPage';

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
  ],
};
