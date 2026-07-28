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
      <div className="p-4 bg-primary/10 rounded-full">
        <ShieldCheck className="w-16 h-16 text-primary" />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Kết nối ví để tiếp tục
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
          Bạn cần ký một thông điệp bằng ví Web3 của mình để xác thực danh tính một cách an toàn.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
        {isSigning ? (
          /* Đang chờ ký */
          <div className="flex items-center gap-2 text-primary font-medium">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Đang chờ ký xác nhận trên ví...</span>
          </div>
        ) : !isConnected ? (
          /* Chưa connect ví → hiển thị ConnectButton của RainbowKit */
          <ConnectButton 
            label="Kết nối Ví (Login)" 
            showBalance={false}
            chainStatus="icon"
          />
        ) : (
          /* Ví đã connect nhưng chưa sign → cho user chủ động ký */
          <div className="flex flex-col items-center gap-3 w-full">
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
              ✅ Ví đã kết nối. Hãy ký xác nhận để đăng nhập.
            </p>
            <button
              onClick={handleSiweLogin}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors shadow-md"
            >
              <PenLine className="w-4 h-4" />
              Ký xác nhận đăng nhập
            </button>
            {/* Vẫn cho phép đổi ví */}
            <div className="mt-1">
              <ConnectButton 
                showBalance={false}
                chainStatus="icon"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
