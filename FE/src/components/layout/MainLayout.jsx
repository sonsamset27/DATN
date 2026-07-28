import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/auth.store';
import ThemeToggle from '../shared/ThemeToggle';
import { LogOut, Home, User, ShieldCheck, Users, Fingerprint, FileBadge, Award, Activity } from 'lucide-react';
import { useDisconnect } from 'wagmi';

export default function MainLayout() {
  const { isAuthenticated, logout, user } = useAuthStore();
  const { disconnect } = useDisconnect();

  const handleLogout = () => {
    logout();       // clear auth store + localStorage
    disconnect();   // disconnect wagmi ví để tránh auto-sign khi quay lại /login
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-background transition-colors duration-300">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#151522] transition-colors">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold text-primary">DCN</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">{user?.role}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          {user?.role === 'ADMIN' && (
            <>
              <Link to="/users" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
                <Users size={20} />
                <span>Users</span>
              </Link>
              <Link to="/audit-logs" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
                <Activity size={20} />
                <span>Audit Logs</span>
              </Link>
            </>
          )}
          <Link to="/my-did" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
            <Fingerprint size={20} />
            <span>My DID</span>
          </Link>
          {user?.role === 'HOLDER' && (
            <Link to="/my-credentials" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
              <ShieldCheck size={20} />
              <span>Chứng chỉ của tôi</span>
            </Link>
          )}
          {(user?.role === 'ADMIN' || user?.role === 'ISSUER') && (
            <>
              <Link to="/templates" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
                <FileBadge size={20} />
                <span>Templates</span>
              </Link>
              <Link to="/issued-credentials" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
                <Award size={20} />
                <span>Chứng chỉ đã cấp</span>
              </Link>
            </>
          )}
          <Link to="/verify" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
            <ShieldCheck size={20} />
            <span>Verify</span>
          </Link>
          <Link to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
            <User size={20} />
            <span>Profile</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-danger hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#151522] transition-colors">
          <div className="flex items-center md:hidden">
            <h1 className="text-lg font-bold text-primary">DCN</h1>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm">
              {user?.userName?.[0] || 'U'}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 text-foreground">
          <Outlet />
        </main>
      </div>
      
      {/* Mobile Bottom Nav (thêm sau) */}
    </div>
  );
}
