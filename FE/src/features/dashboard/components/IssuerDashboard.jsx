import { useQuery } from '@tanstack/react-query';
import { credentialsApi } from '../../credentials/services/credentials.api';
import { templatesApi } from '../../templates/services/templates.api';
import { Award, FileBadge, Building2, TrendingUp, Fingerprint } from 'lucide-react';
import StatCard from './StatCard';
import QuickCard from './QuickCard';

export default function IssuerDashboard({ user }) {
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
