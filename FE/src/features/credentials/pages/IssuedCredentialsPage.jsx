import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { credentialsApi } from '../services/credentials.api';
import { Link } from 'react-router-dom';
import { Award, Plus, FileKey } from 'lucide-react';

export default function IssuedCredentialsPage() {
  const [page, setPage] = useState(1);
  
  const { data: credsRes, isLoading } = useQuery({
    queryKey: ['issued-credentials', page],
    queryFn: () => credentialsApi.getIssuedCredentials({ page, limit: 10 })
  });

  const credentials = credsRes?.data || [];
  const total = credsRes?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="text-primary" /> Chứng chỉ đã cấp
          </h1>
          <p className="text-gray-500 mt-1">Quản lý và theo dõi các chứng chỉ mà tổ chức của bạn đã phát hành.</p>
        </div>
        <Link 
          to="/issue-credential"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={20} /> Cấp chứng chỉ mới
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Credential ID</th>
                <th className="px-6 py-4 font-semibold">Loại Mẫu (Template)</th>
                <th className="px-6 py-4 font-semibold">Người nhận (DID / Tên)</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold">Ngày cấp</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-8">Đang tải...</td></tr>
              ) : credentials.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8">Chưa cấp chứng chỉ nào</td></tr>
              ) : (
                credentials.map((cred) => (
                  <tr key={cred._id} className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-primary">{cred.credentialId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{cred.templateId?.title || 'Không rõ'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{cred.holderId?.userName || 'Không rõ'}</div>
                      <div className="text-xs truncate w-32 md:w-48 text-gray-400" title={cred.holderDid}>{cred.holderDid}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        cred.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {cred.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(cred.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm">
          <span>Tổng số: {total} chứng chỉ</span>
          <div className="flex gap-2">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
            >
              Trước
            </button>
            <button 
              disabled={credentials.length < 10} 
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
