import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';

import DashboardPage from '../features/dashboard/pages/DashboardPage';
import LoginPage from '../features/auth/pages/LoginPage';
import UsersListPage from '../features/users/pages/UsersListPage';
import MyDIDPage from '../features/dids/pages/MyDIDPage';
import TemplatesListPage from '../features/templates/pages/TemplatesListPage';
import MyCredentialsPage from '../features/credentials/pages/MyCredentialsPage';
import VerifyCredentialPage from '../features/credentials/pages/VerifyCredentialPage';
import IssuedCredentialsPage from '../features/credentials/pages/IssuedCredentialsPage';
import IssueCredentialPage from '../features/credentials/pages/IssueCredentialPage';
import AuditLogsPage from '../features/audit-logs/pages/AuditLogsPage';
import GuestDashboardPage from '../features/guest/pages/GuestDashboardPage';

// Placeholder Pages

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <GuestDashboardPage />
      },
      {
        element: <MainLayout />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'users', element: <UsersListPage /> },
          { path: 'my-did', element: <MyDIDPage /> },
          { path: 'templates', element: <TemplatesListPage /> },
          { path: 'my-credentials', element: <MyCredentialsPage /> },
          { path: 'issued-credentials', element: <IssuedCredentialsPage /> },
          { path: 'issue-credential', element: <IssueCredentialPage /> },
          { path: 'audit-logs', element: <AuditLogsPage /> },
          { path: 'verify', element: <VerifyCredentialPage /> },
          // Các route khác sẽ thêm sau (credentials, templates, users, dids)
        ]
      },
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> }
        ]
      }
    ]
  }
]);
