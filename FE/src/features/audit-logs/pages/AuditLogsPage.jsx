import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogsApi } from '../services/audit-logs.api';
import { Activity, ShieldAlert, Key, UserPlus, Fingerprint } from 'lucide-react';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  
  const { data: logsRes, isLoading } = useQuery({
    queryKey: ['audit-logs', page],
    queryFn: () => auditLogsApi.getLogs({ page, limit: 15 })
  });

  const logs = logsRes?.data || [];
  const total = logsRes?.total || 0;

  const getActionIcon = (action) => {
    if (action.includes('ISSUE') || action.includes('REVOKE')) return <FileKey className="text-secondary" size={18} />;
    if (action.includes('REGISTER_DID')) return <Fingerprint className="text-primary" size={18} />;
    if (action.includes('PROMOTE') || action.includes('DEMOTE')) return <UserPlus className="text-warning" size={18} />;
    if (action.includes('LOGIN')) return <Key className="text-success" size={18} />;
    return <Activity className="text-gray-500" size={18} />;
  };

  const getActionColor = (action) => {
    if (action.includes('ISSUE')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (action.includes('REVOKE')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (action.includes('LOGIN')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    if (action.includes('REGISTER_DID')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="text-primary" /> Nhật ký hệ thống (Audit Logs)
        </h1>
        <p className="text-gray-500 mt-1">Lịch sử mọi hành động thay đổi trạng thái trong hệ thống.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">Đang tải lịch sử...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">Chưa có bản ghi nào.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {logs.map((log) => (
              <div key={log._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex gap-4">
                <div className="mt-1">{getActionIcon(log.action)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Actor: <span className="font-mono font-normal text-xs">{log.actorWallet || log.actorId}</span>
                  </p>
                  <p className="text-xs text-gray-500 font-mono break-all bg-gray-50 dark:bg-gray-900 p-2 rounded mt-2">
                    {JSON.stringify(log.details)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
          <span>Tổng số: {total} bản ghi</span>
          <div className="flex gap-2">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
            >
              Trước
            </button>
            <button 
              disabled={logs.length < 15} 
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
