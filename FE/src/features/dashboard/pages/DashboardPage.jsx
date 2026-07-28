import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../auth/store/auth.store';
import { authApi } from '../../auth/services/auth.api';
import { credentialsApi } from '../../credentials/services/credentials.api';
import { templatesApi } from '../../templates/services/templates.api';
import { usersApi } from '../../users/services/users.api';
import toast from 'react-hot-toast';
import {
  User, CheckCircle2, Wallet, Fingerprint, Award, Activity,
  PenLine, Loader2, FileBadge, Users, ShieldCheck, Building2,
  Hash, ArrowRight, TrendingUp, X
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ gradient, icon: Icon, label, value, sub, loading }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${gradient} text-white shadow-lg`}>
      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/10" />
      <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">{label}</p>
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 shrink-0" />
            <p className="text-2xl font-bold truncate">{value}</p>
          </div>
          {sub && <p className="text-white/60 text-xs mt-1">{sub}</p>}
        </>
      )}
    </div>
  );
}

// ─── Quick Action Card ────────────────────────────────────────────────────────
function QuickCard({ label, icon: Icon, color, href, action }) {
  const cls = "flex flex-col items-center gap-3 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer";
  const inner = (
    <>
      <div className={`p-3 rounded-xl ${color}`}><Icon className="w-5 h-5" /></div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </>
  );
  if (href) return <Link to={href} className={cls}>{inner}</Link>;
  return <button onClick={action} className={`${cls} w-full`}>{inner}</button>;
}

// ─── ADMIN Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard() {
  const { data: usersRes, isLoading: loadingUsers } = useQuery({
    queryKey: ['dash-users'],
    queryFn: () => usersApi.getAllUsers({ limit: 1 }),
  });
  const { data: templatesRes, isLoading: loadingTemplates } = useQuery({
    queryKey: ['dash-templates-admin'],
    queryFn: () => templatesApi.getAllTemplates({ limit: 1 }),
  });
  const { data: statsRes, isLoading: loadingStats } = useQuery({
    queryKey: ['dash-creds-stats'],
    queryFn: () => credentialsApi.getStats(),
  });

  const stats = statsRes?.data;

  const totalUsers = usersRes?.total ?? '—';
  const totalTemplates = templatesRes?.total ?? '—';
  const totalCreds = stats?.total ?? '—';
  const activeCreds = stats?.active ?? '—';
  const revokedCreds = stats?.revoked ?? '—';
  const expiredCreds = stats?.expired ?? '—';

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard gradient="from-rose-500 to-pink-600" icon={Users} label="Tổng người dùng" value={totalUsers} sub="Toàn hệ thống" loading={loadingUsers} />
        <StatCard gradient="from-violet-500 to-purple-600" icon={FileBadge} label="Tổng mẫu chứng chỉ" value={totalTemplates} sub="Từ tất cả Issuer" loading={loadingTemplates} />
        <StatCard gradient="from-emerald-500 to-teal-600" icon={ShieldCheck} label="Trạng thái hệ thống" value="Online" sub="Blockchain đang hoạt động" />
      </div>

      {/* Credential Stats */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Thống kê chứng chỉ hệ thống</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <StatCard gradient="from-blue-500 to-cyan-600" icon={Award} label="Tổng chứng chỉ" value={totalCreds} sub="Đã phát hành" loading={loadingStats} />
          <StatCard gradient="from-emerald-500 to-teal-600" icon={CheckCircle2} label="Đang hoạt động" value={activeCreds} sub="Còn hiệu lực" loading={loadingStats} />
          <StatCard gradient="from-amber-500 to-orange-600" icon={Hash} label="Hết hạn" value={expiredCreds} sub="Đã quá hạn" loading={loadingStats} />
          <StatCard gradient="from-red-500 to-rose-600" icon={TrendingUp} label="Đã thu hồi" value={revokedCreds} sub="Bị thu hồi" loading={loadingStats} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Truy cập nhanh</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickCard label="Người dùng" icon={Users} href="/users" color="text-rose-500 bg-rose-50 dark:bg-rose-900/20" />
          <QuickCard label="Templates" icon={FileBadge} href="/templates" color="text-violet-500 bg-violet-50 dark:bg-violet-900/20" />
          <QuickCard label="Audit Logs" icon={Activity} href="/audit-logs" color="text-amber-500 bg-amber-50 dark:bg-amber-900/20" />
          <QuickCard label="My DID" icon={Fingerprint} href="/my-did" color="text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" />
        </div>
      </div>
    </>
  );
}

// ─── ISSUER Dashboard ─────────────────────────────────────────────────────────
function IssuerDashboard({ user }) {
  const { data: templatesRes, isLoading: loadingTemplates } = useQuery({
    queryKey: ['dash-templates-issuer', user?._id],
    queryFn: () => templatesApi.getIssuerTemplates(user._id, { limit: 1 }),
    enabled: !!user?._id,
  });
  const { data: credsRes, isLoading: loadingCreds } = useQuery({
    queryKey: ['dash-issued-creds'],
    queryFn: () => credentialsApi.getIssuedCredentials({ limit: 1 }),
  });

  const totalTemplates = templatesRes?.total ?? '—';
  const totalIssued = credsRes?.total ?? '—';

  return (
    <>
      {/* Org info card — full width */}
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/10" />
        <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">Tổ chức của bạn</p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold leading-tight">{user?.organizationName || '—'}</p>
            {user?.organizationCode && (
              <p className="text-white/70 text-sm mt-0.5 font-mono">Mã: {user.organizationCode}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard gradient="from-blue-500 to-cyan-600" icon={FileBadge} label="Mẫu chứng chỉ đã tạo" value={totalTemplates} sub="Templates của bạn" loading={loadingTemplates} />
        <StatCard gradient="from-emerald-500 to-teal-600" icon={Award} label="Chứng chỉ đã cấp" value={totalIssued} sub="Cho các Holder" loading={loadingCreds} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Truy cập nhanh</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickCard label="Templates" icon={FileBadge} href="/templates" color="text-violet-500 bg-violet-50 dark:bg-violet-900/20" />
          <QuickCard label="Chứng chỉ đã cấp" icon={Award} href="/issued-credentials" color="text-blue-500 bg-blue-50 dark:bg-blue-900/20" />
          <QuickCard label="Cấp chứng chỉ" icon={TrendingUp} href="/issue-credential" color="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" />
          <QuickCard label="My DID" icon={Fingerprint} href="/my-did" color="text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" />
        </div>
      </div>
    </>
  );
}

// ─── HOLDER Dashboard ─────────────────────────────────────────────────────────
function HolderDashboard() {
  const { data: credsAllRes, isLoading: loadingAll } = useQuery({
    queryKey: ['dash-own-creds-total'],
    queryFn: () => credentialsApi.getOwnCredentials({ limit: 1 }),
  });
  const { data: credsActiveRes, isLoading: loadingActive } = useQuery({
    queryKey: ['dash-own-creds-active'],
    queryFn: () => credentialsApi.getOwnCredentials({ limit: 1, status: 'ACTIVE' }),
  });
  const { data: credsExpiredRes, isLoading: loadingExpired } = useQuery({
    queryKey: ['dash-own-creds-expired'],
    queryFn: () => credentialsApi.getOwnCredentials({ limit: 1, status: 'EXPIRED' }),
  });

  const totalCreds = credsAllRes?.total ?? '—';
  const activeCreds = credsActiveRes?.total ?? '—';
  const expiredCreds = credsExpiredRes?.total ?? '—';

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard gradient="from-blue-500 to-cyan-600" icon={Award} label="Chứng chỉ của tôi" value={totalCreds} sub="Tất cả chứng chỉ nhận được" loading={loadingAll} />
        <StatCard gradient="from-emerald-500 to-teal-600" icon={ShieldCheck} label="Đang hoạt động" value={activeCreds} sub="Chứng chỉ còn hiệu lực" loading={loadingActive} />
        <StatCard gradient="from-amber-500 to-orange-600" icon={Hash} label="Hết hạn" value={expiredCreds} sub="Chứng chỉ đã quá hạn" loading={loadingExpired} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Truy cập nhanh</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <QuickCard label="Chứng chỉ của tôi" icon={Award} href="/my-credentials" color="text-blue-500 bg-blue-50 dark:bg-blue-900/20" />
          <QuickCard label="My DID" icon={Fingerprint} href="/my-did" color="text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" />
          <QuickCard label="Xác minh" icon={CheckCircle2} href="/verify" color="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" />
        </div>
      </div>
    </>
  );
}

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
