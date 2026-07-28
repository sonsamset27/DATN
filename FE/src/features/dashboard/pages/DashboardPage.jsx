import { useEffect, useState } from 'react';
import { useAuthStore } from '../../auth/store/auth.store';
import { authApi } from '../../auth/services/auth.api';
import toast from 'react-hot-toast';
import { User, CheckCircle2, Wallet, Fingerprint, Award, Activity, PenLine, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, updateUser } = useAuthStore();
  const [showNameModal, setShowNameModal] = useState(false);
  const [inputName, setInputName] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingName, setCheckingName] = useState(true);

  useEffect(() => {
    // Luôn fetch fresh data từ DB để check userName thực sự trong database
    // Tránh trường hợp store có userName nhưng DB chưa cập nhật (hoặc ngược lại)
    const checkUserName = async () => {
      try {
        setCheckingName(true);
        const meRes = await authApi.getMe();
        const freshUser = meRes.data;
        // Sync store với DB
        updateUser(freshUser);
        // Chỉ hiện modal nếu DB thực sự chưa có tên
        if (!freshUser.userName) {
          setShowNameModal(true);
        }
      } catch (err) {
        // Nếu fetch thất bại, fallback về store
        if (!user?.userName) setShowNameModal(true);
      } finally {
        setCheckingName(false);
      }
    };
    checkUserName();
  }, []); // Chỉ chạy 1 lần khi mount

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!inputName.trim()) return toast.error('Vui lòng nhập tên hợp lệ');
    try {
      setLoading(true);
      const res = await authApi.updateUserName(inputName.trim());
      // res.data là user object đã update từ DB
      updateUser({ userName: res.data.userName });
      toast.success('Cập nhật tên thành công!');
      setShowNameModal(false);
    } catch (err) {
      // toast tự hiển thị từ interceptor
    } finally {
      setLoading(false);
    }
  };

  const roleColors = {
    ADMIN: 'from-rose-500 to-pink-600',
    ISSUER: 'from-violet-500 to-purple-600',
    HOLDER: 'from-blue-500 to-cyan-600',
  };
  const roleGradient = roleColors[user?.role] || 'from-gray-500 to-gray-600';

  const walletShort = user?.walletAddress
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : '—';

  const avatarSeed = user?.walletAddress || user?.userName || 'default';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header greeting */}
      <div className="flex items-center gap-4">
        <img
          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`}
          alt="avatar"
          className="w-14 h-14 rounded-2xl border-2 border-primary/30 shadow-md bg-white"
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
            <p className="text-sm text-primary font-medium mt-1 flex items-center gap-1.5">
              Tổ chức: {user.organizationName} {user.organizationCode && `(${user.organizationCode})`}
            </p>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Vai trò */}
        <div className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${roleGradient} text-white shadow-lg`}>
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/10" />
          <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-2">Vai trò</p>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <p className="text-2xl font-bold">{user?.role}</p>
          </div>
        </div>

        {/* Trạng thái */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/10" />
          <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-2">Trạng thái</p>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <p className="text-2xl font-bold">{user?.status}</p>
          </div>
        </div>

        {/* Wallet */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/10" />
          <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-2">Ví Blockchain</p>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 shrink-0" />
            <p className="text-base font-bold font-mono truncate">{walletShort}</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Truy cập nhanh</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'My DID', icon: Fingerprint, href: '/my-did', color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' },
            { label: 'Chứng chỉ', icon: Award, href: '/my-credentials', color: 'text-violet-500 bg-violet-50 dark:bg-violet-900/20' },
            { label: 'Verify', icon: CheckCircle2, href: '/verify', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Đổi tên', icon: PenLine, action: () => setShowNameModal(true), color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' },
          ].map((item) => (
            item.href ? (
              <a key={item.label} href={item.href}
                className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                <div className={`p-3 rounded-xl ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </a>
            ) : (
              <button key={item.label} onClick={item.action}
                className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer w-full">
                <div className={`p-3 rounded-xl ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </button>
            )
          ))}
        </div>
      </div>

      {/* Modal đặt tên */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 mx-4 animate-scaleIn">
            <div className="flex justify-center mb-5">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <PenLine className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center mb-1">Đặt tên hiển thị</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6">
              Bạn đang đăng nhập lần đầu. Hãy đặt tên hiển thị trong hệ thống.
            </p>
            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Họ và Tên</label>
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                  placeholder="VD: Nguyễn Văn A"
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</> : 'Xác nhận'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
