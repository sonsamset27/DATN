import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../services/users.api';
import toast from 'react-hot-toast';
import { ShieldAlert, ShieldCheck, MoreVertical, X } from 'lucide-react';

export default function UsersListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [promoteModal, setPromoteModal] = useState({ open: false, userId: null });
  const [orgForm, setOrgForm] = useState({ organizationName: '', organizationCode: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['users', page],
    queryFn: () => usersApi.getAllUsers({ page, limit: 10 }),
  });

  const promoteMutation = useMutation({
    mutationFn: (data) => usersApi.promoteToIssuer(promoteModal.userId, data),
    onSuccess: () => {
      toast.success('Nâng quyền thành Issuer thành công!');
      setPromoteModal({ open: false, userId: null });
      setOrgForm({ organizationName: '', organizationCode: '' });
      queryClient.invalidateQueries(['users']);
    },
    onError: () => {
      // Error handled by interceptor
    }
  });

  const handlePromote = (e) => {
    e.preventDefault();
    if (!orgForm.organizationName || !orgForm.organizationCode) return toast.error('Vui lòng nhập đủ thông tin');
    promoteMutation.mutate(orgForm);
  };

  const usersList = data?.data || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Người dùng</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Ví / Tên</th>
                <th className="px-6 py-4 font-semibold">Vai trò</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="4" className="text-center py-8">Đang tải...</td></tr>
              ) : usersList.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-8">Không có người dùng nào</td></tr>
              ) : (
                usersList.map((u) => (
                  <tr key={u._id} className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{u.userName || 'Chưa cập nhật'}</div>
                      <div className="text-xs truncate w-32 md:w-48" title={u.walletAddress}>{u.walletAddress}</div>
                      {u.organizationName && <div className="text-xs text-primary mt-1">{u.organizationName} ({u.organizationCode})</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          u.role === 'ISSUER' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {u.status === 'ACTIVE' ? <ShieldCheck className="w-4 h-4 text-success" /> : <ShieldAlert className="w-4 h-4 text-danger" />}
                        <span>{u.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role === 'HOLDER' && (
                        <button
                          onClick={() => setPromoteModal({ open: true, userId: u._id })}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Promote to Issuer
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm">
          <span>Tổng số: {total} người dùng</span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
            >
              Trước
            </button>
            <button
              disabled={usersList.length < 10}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {promoteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-md shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Nâng quyền thành Issuer</h2>
              <button onClick={() => setPromoteModal({ open: false, userId: null })}><X size={20} /></button>
            </div>
            <form onSubmit={handlePromote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên tổ chức</label>
                <input
                  type="text"
                  value={orgForm.organizationName}
                  onChange={(e) => setOrgForm({ ...orgForm, organizationName: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary outline-none"
                  placeholder="VD: Trường Đại học Xây Dựng Hà Nội"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mã tổ chức</label>
                <input
                  type="text"
                  value={orgForm.organizationCode}
                  onChange={(e) => setOrgForm({ ...orgForm, organizationCode: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary outline-none uppercase"
                  placeholder="VD: HUCE"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={promoteMutation.isPending}
                className="w-full py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
              >
                {promoteMutation.isPending ? 'Đang xử lý (Ghi blockchain)...' : 'Xác nhận Nâng quyền'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
