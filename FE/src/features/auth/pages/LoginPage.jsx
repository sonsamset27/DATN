import { useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useLoginFlow } from '../hooks/useAuth';
import { useAuthStore } from '../store/auth.store';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2, PenLine } from 'lucide-react';

export default function LoginPage() {
  const { isSigning, isConnected, handleSiweLogin } = useLoginFlow();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8">
      <div className="p-4 rounded-full bg-primary/15">
        <ShieldCheck className="w-16 h-16 text-primary" />
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          Kết nối ví để tiếp tục
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
          Bạn cần ký một thông điệp bằng ví Web3 của mình để xác thực danh tính một cách an toàn.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
        {isSigning ? (
          /* Đang ký */
          <div className="flex items-center gap-2 font-medium text-primary">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Đang chờ ký xác nhận trên ví...</span>
          </div>

        ) : !isConnected ? (
          /* Chưa connect → hiển thị RainbowKit button */
          <ConnectButton
            label="Kết nối Ví (Login)"
            showBalance={false}
            chainStatus="icon"
          />

        ) : (
          /* Ví đã connect → cho user chủ động ký */
          <div className="flex flex-col items-center gap-4 w-full">
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Ví đã kết nối. Hãy ký xác nhận để đăng nhập.
            </p>

            {/* NÚT KÝ — bg-primary hoạt động nhờ @theme trong index.css */}
            <button
              onClick={handleSiweLogin}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all"
            >
              <PenLine className="w-4 h-4" />
              Ký xác nhận đăng nhập
            </button>

            {/* Cho phép đổi ví */}
            <div className="mt-1">
              <ConnectButton showBalance={false} chainStatus="icon" />
            </div>
          </div>
        )}
      </div>

      <div className="pt-6">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-500 hover:text-primary transition-colors hover:underline"
        >
          &larr; Trở về trang khách
        </button>
      </div>
    </div>
  );
}
