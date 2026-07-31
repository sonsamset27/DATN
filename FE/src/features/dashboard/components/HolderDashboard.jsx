import { useQuery } from '@tanstack/react-query';
import { credentialsApi } from '../../credentials/services/credentials.api';
import { CheckCircle2, Award, ShieldCheck, Hash, Fingerprint } from 'lucide-react';
import StatCard from './StatCard';
import QuickCard from './QuickCard';

export default function HolderDashboard() {
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
