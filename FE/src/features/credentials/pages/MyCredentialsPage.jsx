import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { credentialsApi } from '../services/credentials.api';
import { Loader2, Award } from 'lucide-react';
import CredentialCard from '../components/CredentialCard';
import DetailModal from '../components/DetailModal';



// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MyCredentialsPage() {
  const [selectedCred, setSelectedCred] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: credsRes, isLoading } = useQuery({
    queryKey: ['my-credentials', statusFilter],
    queryFn: () => credentialsApi.getOwnCredentials({ limit: 50, status: statusFilter || undefined }),
  });

  const credentials = credsRes?.data || [];
  const total = credsRes?.total || 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Award className="text-primary shrink-0" /> Chứng chỉ của tôi
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Tổng cộng <span className="font-semibold text-foreground">{total}</span> chứng chỉ đã được cấp
          </p>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {['', 'ACTIVE', 'REVOKED', 'EXPIRED'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                statusFilter === s
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary'
              }`}
            >
              {s === '' ? 'Tất cả' : s === 'ACTIVE' ? 'Hiệu lực' : s === 'REVOKED' ? 'Thu hồi' : 'Hết hạn'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : credentials.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <Award className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-lg font-medium text-gray-500">
            {statusFilter ? `Không có chứng chỉ ${statusFilter}` : 'Bạn chưa có chứng chỉ nào'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {credentials.map((cred, i) => (
            <CredentialCard key={cred.credentialId} cred={cred} index={i} onClick={setSelectedCred} />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedCred && (
        <DetailModal cred={selectedCred} onClose={() => setSelectedCred(null)} />
      )}
    </div>
  );
}
