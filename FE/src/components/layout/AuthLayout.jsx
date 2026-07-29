import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/auth.store';

export default function AuthLayout() {
  const { isAuthenticated, logout } = useAuthStore();
  const token = localStorage.getItem('accessToken');

  if (isAuthenticated && token) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isAuthenticated && !token) {
    // Sync state if token was manually removed
    setTimeout(() => logout(), 0);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          Digital Credential Network
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
