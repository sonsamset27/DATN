import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/auth.store';
import ThemeToggle from '../shared/ThemeToggle';
import { LogOut, Home, User, ShieldCheck, Users, Fingerprint, FileBadge, Award, Activity } from 'lucide-react';
import { useDisconnect } from 'wagmi';

export default function MainLayout() {
  const { isAuthenticated, logout, user } = useAuthStore();
  const { disconnect } = useDisconnect();
  const location = useLocation();

  const handleLogout = () => {
    logout();       // clear auth store + localStorage
    disconnect();   // disconnect wagmi ví để tránh auto-sign khi quay lại /login
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const avatarSeed = user?.walletAddress || user?.userName || 'default';

  const navLinkClass = (path) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
      location.pathname === path
        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
    }`;

  return (
    <div className="min-h-screen flex bg-[var(--background)] transition-colors duration-300">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#151522] transition-colors">
        {/* Logo — một dòng, không wrap */}
        <div className="h-16 flex items-center px-5 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div>
            <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--primary)' }}>DCN</span>
            <span className="ml-2 text-xs text-gray-400 whitespace-nowrap">Digital Credentials</span>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="px-3 py-3 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3">
            <img
              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`}
              alt="avatar"
              className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 shrink-0 bg-white"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                {user?.userName || 'Chưa đặt tên'}
              </p>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                user?.role === 'ADMIN' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                user?.role === 'ISSUER' ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' :
                'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <Link to="/dashboard" className={navLinkClass('/dashboard')}>
            <Home size={18} />
            <span>Dashboard</span>
          </Link>

          {user?.role === 'ADMIN' && (
            <>
              <Link to="/users" className={navLinkClass('/users')}>
                <Users size={18} />
                <span>Người dùng</span>
              </Link>
              <Link to="/audit-logs" className={navLinkClass('/audit-logs')}>
                <Activity size={18} />
                <span>Audit Logs</span>
              </Link>
            </>
          )}

          <Link to="/my-did" className={navLinkClass('/my-did')}>
            <Fingerprint size={18} />
            <span>My DID</span>
          </Link>

          {user?.role === 'HOLDER' && (
            <Link to="/my-credentials" className={navLinkClass('/my-credentials')}>
              <ShieldCheck size={18} />
              <span>Chứng chỉ của tôi</span>
            </Link>
          )}

          {(user?.role === 'ADMIN' || user?.role === 'ISSUER') && (
            <>
              <Link to="/templates" className={navLinkClass('/templates')}>
                <FileBadge size={18} />
                <span>Templates</span>
              </Link>
              <Link to="/issued-credentials" className={navLinkClass('/issued-credentials')}>
                <Award size={18} />
                <span>Chứng chỉ đã cấp</span>
              </Link>
            </>
          )}

          <Link to="/verify" className={navLinkClass('/verify')}>
            <ShieldCheck size={18} />
            <span>Verify</span>
          </Link>

          <Link to="/profile" className={navLinkClass('/profile')}>
            <User size={18} />
            <span>Profile</span>
          </Link>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#151522] transition-colors">
          <div className="flex items-center md:hidden">
            <h1 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>DCN</h1>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {/* Header avatar + name */}
            <div className="flex items-center gap-2">
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`}
                alt="avatar"
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 bg-white"
              />
              <span className="hidden sm:block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                {user?.userName || 'Người dùng'}
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8" style={{ color: 'var(--foreground)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
