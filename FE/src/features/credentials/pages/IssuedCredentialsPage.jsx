import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { credentialsApi } from '../services/credentials.api';
import { Link } from 'react-router-dom';
import {
  Plus, Search, Loader2, ChevronRight, Award, RotateCcw, X
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import CopyBtn from '../components/CopyBtn';
import DetailSidebar from '../components/DetailSidebar';
import ReissueModal from '../components/ReissueModal';



// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function IssuedCredentialsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [holderDid, setHolderDid] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCred, setSelectedCred] = useState(null);
  const [showReissue, setShowReissue] = useState(false);

  const { data: credsRes, isLoading } = useQuery({
    queryKey: ['issued-credentials', page, holderDid, statusFilter],
    queryFn: () => credentialsApi.getIssuedCredentials({
      page,
      limit: 10,
      holderDid: holderDid || undefined,
      status: statusFilter || undefined,
    }),
  });

  const credentials = credsRes?.data || [];
  const total = credsRes?.total || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    setHolderDid(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="text-primary" /> Chứng chỉ đã cấp
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Tổng cộng <span className="font-semibold text-foreground">{total}</span> chứng chỉ đã phát hành
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowReissue(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium text-sm shadow-sm"
          >
            <RotateCcw size={16} /> Cấp lại chứng chỉ
          </button>
          <Link
            to="/issue-credential"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium text-sm shadow-sm"
          >
            <Plus size={16} /> Cấp mới
          </Link>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm theo Holder DID..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shrink-0">
              Tìm
            </button>
            {holderDid && (
              <button
                type="button"
                onClick={() => { setSearchInput(''); setHolderDid(''); setPage(1); }}
                className="px-3 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            )}
          </form>

          <div className="flex gap-1.5 flex-wrap">
            {['', 'ACTIVE', 'REVOKED', 'EXPIRED'].map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${statusFilter === s
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary'
                  }`}
              >
                {s === '' ? 'Tất cả' : s === 'ACTIVE' ? 'Hiệu lực' : s === 'REVOKED' ? 'Thu hồi' : 'Hết hạn'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-px">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-5 py-4">Credential ID</th>
                <th className="px-5 py-4">Tên chứng chỉ</th>
                <th className="px-5 py-4">Holder DID</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4">Ngày cấp</th>
                <th className="px-5 py-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <Loader2 size={24} className="animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : credentials.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <Award className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-400 text-sm">Không có chứng chỉ nào</p>
                  </td>
                </tr>
              ) : credentials.map((cred) => (
                <tr
                  key={cred.credentialId}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedCred(cred)}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-primary font-medium">{cred.credentialId}</span>
                      <CopyBtn text={cred.credentialId} />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {cred.templateName || 'Không rõ'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]" title={cred.holderDid}>
                        {cred.holderDid}
                      </span>
                      <CopyBtn text={cred.holderDid} />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={cred.status} />
                  </td>
                  <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                    {new Date(cred.issuedAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedCred(cred); }}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                    >
                      Xem <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Tổng: <span className="font-semibold text-foreground">{total}</span> chứng chỉ
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs font-medium"
            >
              ← Trước
            </button>
            <span className="px-3 py-1.5 text-xs text-gray-500">Trang {page}</span>
            <button
              disabled={credentials.length < 10}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs font-medium"
            >
              Sau →
            </button>
          </div>
        </div>
      </div>

      {/* Detail Sidebar */}
      {selectedCred && <DetailSidebar cred={selectedCred} onClose={() => setSelectedCred(null)} />}

      {/* Reissue Modal */}
      {showReissue && <ReissueModal onClose={() => setShowReissue(false)} />}
    </div>
  );
}
