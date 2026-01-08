import { useRoutes } from 'react-router-dom';

import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import MainPage from '@/pages/MainPage';
import NotFoundPage from '@/pages/NotFoundPage';
import RegisterPage from '@/pages/RegisterPage';

import AmRoutes from './AmRoutes';
import HrRoutes from './HrRoutes';
import PmRoutes from './PmRoutes';
import TmRoutes from './TmRoutes';
import UmRoutes from './UmRoutes';
import FMRoutes from './FMRoutes';
import VmRoutes from './VmRoutes';





const routes = [
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/main', element: <MainPage /> },

  HrRoutes,
  PmRoutes,
  TmRoutes,
  AmRoutes,
  UmRoutes,
  ...FMRoutes,
  VmRoutes,

  { path: '*', element: <NotFoundPage /> },
];

function AppRoutes() {
  return useRoutes(routes);
}

export default AppRoutes;
