import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogsApi } from '../services/audit-logs.api';
import { Search, X, ChevronLeft, ChevronRight, Activity, Loader2 } from 'lucide-react';
import LogItem from '../components/LogItem';


// ─── Action Filter Tabs ─────────────────────────────────────────────────────────
const FILTER_TABS = [
  { value: '',                 label: 'Tất cả' },
  { value: 'ISSUE',           label: 'Cấp chứng chỉ' },
  { value: 'REVOKE',          label: 'Thu hồi' },
  { value: 'VERIFY',          label: 'Xác minh' },
  { value: 'REGISTER_DID',   label: 'DID' },
  { value: 'TEMPLATE_CREATE', label: 'Tạo mẫu' },
  { value: 'TEMPLATE_UPDATE', label: 'Cập nhật mẫu' },
  { value: 'TEMPLATE_DELETE', label: 'Xóa mẫu' },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [actorDid, setActorDid] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const { data: logsRes, isLoading } = useQuery({
    queryKey: ['audit-logs', page, actorDid, actionFilter],
    queryFn: () => auditLogsApi.getLogs({
      page,
      limit: 15,
      actorDid: actorDid || undefined,
      action: actionFilter || undefined,
    }),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setActorDid(searchInput.trim());
    setPage(1);
  };

  const handleClear = () => {
    setSearchInput('');
    setActorDid('');
    setPage(1);
  };

  const handleFilterTab = (val) => {
    setActionFilter(val);
    setPage(1);
  };

  const logs = logsRes?.data || [];
  const total = logsRes?.total || 0;
  const totalPages = Math.ceil(total / 15) || 1;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="text-primary" /> Nhật ký hệ thống
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Lịch sử mọi hành động thay đổi trạng thái trong hệ thống.
          {total > 0 && <span className="ml-2 font-semibold text-foreground">{total} bản ghi</span>}
        </p>
      </div>

      {/* Search + Filter */}
      <div className="space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm theo Actor DID..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm transition-all"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors text-sm font-medium">
            Tìm
          </button>
          {actorDid && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </form>

        {/* Action Filter Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => handleFilterTab(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                actionFilter === tab.value
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm text-gray-400">Đang tải nhật ký...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <Activity size={44} className="mx-auto text-gray-200 dark:text-gray-600 mb-3" />
            <p className="text-gray-400 text-sm">
              {actorDid || actionFilter ? 'Không tìm thấy bản ghi nào phù hợp.' : 'Chưa có bản ghi nào.'}
            </p>
            {(actorDid || actionFilter) && (
              <button
                onClick={() => { handleClear(); setActionFilter(''); }}
                className="mt-3 text-xs text-primary hover:underline"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="pl-0">
            {logs.map((log, idx) => (
              <LogItem key={log._id} log={log} isLast={idx === logs.length - 1} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && total > 0 && (
        <div className="flex items-center justify-between text-sm pt-2">
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            Trang <span className="font-semibold text-foreground">{page}</span> / {totalPages} &nbsp;·&nbsp; Tổng {total} bản ghi
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium"
            >
              <ChevronLeft size={14} /> Trước
            </button>
            <button
              disabled={page >= totalPages || logs.length < 15}
              onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium"
            >
              Sau <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
