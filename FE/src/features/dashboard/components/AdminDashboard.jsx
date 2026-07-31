import { useQuery } from '@tanstack/react-query';
import { credentialsApi } from '../../credentials/services/credentials.api';
import { templatesApi } from '../../templates/services/templates.api';
import { usersApi } from '../../users/services/users.api';
import { CheckCircle2, Award, Activity, FileBadge, Users, ShieldCheck, Hash, TrendingUp, Fingerprint } from 'lucide-react';
import StatCard from './StatCard';
import QuickCard from './QuickCard';

export default function AdminDashboard() {
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
