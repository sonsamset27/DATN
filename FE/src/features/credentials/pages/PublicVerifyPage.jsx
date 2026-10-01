import { useAuthStore } from '../../auth/store/auth.store';
import MainLayout from '../../../components/layout/MainLayout';
import VerifyCredentialPage from './VerifyCredentialPage';
import ThemeToggle from '../../../components/shared/ThemeToggle';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import logo from '../../../assets/images/logo_datn.png';

export default function PublicVerifyPage() {
  const { isAuthenticated } = useAuthStore();
  const token = localStorage.getItem('accessToken');

  // If user is logged in, show within standard MainLayout with sidebar
  if (isAuthenticated && token) {
    return (
      <MainLayout>
        <VerifyCredentialPage />
      </MainLayout>
    );
  }

  // If user is guest, employer, or in incognito tab, show clean public layout
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">
      {/* Public Header */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#151522] shrink-0 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="logo" className="w-10 h-10" />
          <span className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">
            Digital Credentials
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-white sm:hidden">
            DCN
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            to="/login"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-sm text-sm"
          >
            <LogIn size={18} />
            Đăng nhập
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <VerifyCredentialPage />
        </div>
      </main>
    </div>
  );
}
