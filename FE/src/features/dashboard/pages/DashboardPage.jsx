import { useEffect, useState } from 'react';
import { useAuthStore } from '../../auth/store/auth.store';
import { authApi } from '../../auth/services/auth.api';
import toast from 'react-hot-toast';
import { Wallet, PenLine, Loader2, Building2, X } from 'lucide-react';
import AdminDashboard from '../components/AdminDashboard';
import IssuerDashboard from '../components/IssuerDashboard';
import HolderDashboard from '../components/HolderDashboard';

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, updateUser } = useAuthStore();
  const [showNameModal, setShowNameModal] = useState(false);
  const [inputName, setInputName] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingName, setCheckingName] = useState(true);

  useEffect(() => {
    const checkUserName = async () => {
      try {
        setCheckingName(true);
        const meRes = await authApi.getMe();
        const freshUser = meRes.data;
        updateUser(freshUser);
        if (!freshUser.userName) setShowNameModal(true);
      } catch {
        if (!user?.userName) setShowNameModal(true);
      } finally {
        setCheckingName(false);
      }
    };
    checkUserName();
  }, []);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!inputName.trim()) return toast.error('Vui lòng nhập tên hợp lệ');
    try {
      setLoading(true);
      const res = await authApi.updateUserName(inputName.trim());
      updateUser({ userName: res.data.userName });
      toast.success('Cập nhật tên thành công!');
      setShowNameModal(false);
    } catch {
      // toast from interceptor
    } finally {
      setLoading(false);
    }
  };

  const roleGradients = {
    ADMIN: 'from-rose-500 to-pink-600',
    ISSUER: 'from-violet-500 to-purple-600',
    HOLDER: 'from-blue-500 to-cyan-600',
  };

  const avatarSeed = user?.walletAddress || user?.userName || 'default';
  const walletShort = user?.walletAddress
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : '—';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`}
            alt="avatar"
            className="w-14 h-14 rounded-2xl border-2 border-primary/30 shadow-md bg-white shrink-0"
          />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Xin chào,</p>
            <h1 className="text-2xl font-bold text-foreground">
              {checkingName ? (
                <span className="inline-flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" /> Đang tải...
                </span>
              ) : (
                user?.userName || <span className="text-gray-400 italic">Chưa đặt tên</span>
              )}
            </h1>
            {user?.role === 'ISSUER' && user?.organizationName && (
              <p className="text-sm text-primary font-medium mt-0.5">
                <Building2 className="inline w-3.5 h-3.5 mr-1" />
                {user.organizationName} {user.organizationCode && `(${user.organizationCode})`}
              </p>
            )}
            {user?.role === 'ADMIN' && (
              <p className="text-sm text-rose-500 font-medium mt-0.5">
                Quản trị viên hệ thống
              </p>
            )}
          </div>
        </div>

        {/* Info badges */}
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${roleGradients[user?.role] || 'from-gray-500 to-gray-600'}`}>
            {user?.role}
          </span>
          <span className="px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-mono">
            <Wallet className="inline w-3 h-3 mr-1" />{walletShort}
          </span>
          <button
            onClick={() => setShowNameModal(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer flex items-center gap-1"
          >
            <PenLine className="w-3 h-3" /> Đổi tên
          </button>
        </div>
      </div>

      {/* ─── Role-specific content ─── */}
      {user?.role === 'ADMIN' && <AdminDashboard />}
      {user?.role === 'ISSUER' && <IssuerDashboard user={user} />}
      {user?.role === 'HOLDER' && <HolderDashboard />}

      {/* ─── Modal đặt tên ─── */}
      {showNameModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15, 15, 26, 0.6)', backdropFilter: 'blur(12px)' }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setShowNameModal(false); }}
        >
          <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
            {/* Gradient header */}
            <div className="bg-gradient-to-br from-primary via-indigo-500 to-purple-600 px-6 pt-8 pb-10 text-white text-center relative">
              <button
                onClick={() => setShowNameModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-14 h-14 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
                <PenLine className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold">Đặt tên hiển thị</h2>
              <p className="text-white/70 text-sm mt-1">Tên sẽ xuất hiện trong hệ thống</p>
            </div>

            {/* Body — dark-mode safe */}
            <div className="px-6 py-6 -mt-4 bg-white dark:bg-gray-800 rounded-t-3xl">
              <form onSubmit={handleUpdateName} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Họ và Tên</label>
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-foreground focus:border-primary focus:bg-white dark:focus:bg-gray-600 outline-none transition-all text-sm font-medium"
                    placeholder="VD: Nguyễn Văn A"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNameModal(false)}
                    className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !inputName.trim()}
                    className="flex-1 py-2.5 bg-gradient-to-r from-primary to-indigo-500 text-white rounded-xl font-semibold disabled:opacity-50 hover:opacity-90 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Lưu...</> : 'Xác nhận'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
