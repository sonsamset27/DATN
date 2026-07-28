import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../services/users.api';
import toast from 'react-hot-toast';
import { ShieldAlert, ShieldCheck, X, Search, Users, ChevronLeft, ChevronRight, ArrowDownToLine, ArrowUpToLine, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UsersListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 10;

  const [promoteModal, setPromoteModal] = useState({ open: false, userId: null });
  const [orgForm, setOrgForm] = useState({ organizationName: '', organizationCode: '' });
  const [demoteConfirm, setDemoteConfirm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, searchTerm],
    queryFn: () => {
      const params = { page, limit, ...(searchTerm ? { search: searchTerm } : {}) };
      return usersApi.getAllUsers(params);
    },
  });

  const promoteMutation = useMutation({
    mutationFn: (data) => usersApi.promoteToIssuer(promoteModal.userId, data),
    onSuccess: () => {
      toast.success('Nâng quyền thành Issuer thành công!');
      setPromoteModal({ open: false, userId: null });
      setOrgForm({ organizationName: '', organizationCode: '' });
      queryClient.invalidateQueries(['users']);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Nâng quyền thất bại');
    }
  });

  const demoteMutation = useMutation({
    mutationFn: (userId) => usersApi.demoteIssuer(userId),
    onSuccess: () => {
      toast.success('Giáng cấp thành Holder thành công!');
      setDemoteConfirm(null);
      queryClient.invalidateQueries(['users']);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Giáng cấp thất bại');
    }
  });

  const handlePromote = (e) => {
    e.preventDefault();
    if (!orgForm.organizationName || !orgForm.organizationCode) return toast.error('Vui lòng nhập đủ thông tin');
    promoteMutation.mutate(orgForm);
  };

  const usersList = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-primary" /> Quản lý Người dùng
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Phân quyền và quản lý tài khoản trong hệ thống.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Tìm kiếm theo Tên, Ví hoặc DID..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Người dùng</th>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">DID / Ví</th>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Vai trò</th>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center py-16">
                    <Loader2 className="animate-spin text-primary w-8 h-8 mx-auto" />
                  </td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16 text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'Không tìm thấy người dùng nào phù hợp.' : 'Không có người dùng nào.'}
                  </td>
                </tr>
              ) : (
                usersList.map((u) => (
                  <tr key={u._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{u.userName || 'Chưa cập nhật'}</div>
                      {u.organizationName && (
                        <div className="text-xs text-primary font-medium mt-0.5">
                          {u.organizationName} {u.organizationCode ? `(${u.organizationCode})` : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded w-fit truncate max-w-[200px]" title={u.did || 'N/A'}>
                          DID: {u.did || 'Chưa tạo'}
                        </span>
                        <span className="text-xs font-mono text-gray-400 truncate max-w-[200px]" title={u.walletAddress}>
                          Ví: {u.walletAddress}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          u.role === 'ISSUER' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        {u.status === 'ACTIVE' ? (
                          <span className="flex items-center gap-1 text-success"><ShieldCheck className="w-4 h-4" /> Hoạt động</span>
                        ) : (
                          <span className="flex items-center gap-1 text-danger"><ShieldAlert className="w-4 h-4" /> Bị khoá</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role === 'HOLDER' && (
                        <button
                          onClick={() => setPromoteModal({ open: true, userId: u._id })}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        >
                          <ArrowUpToLine size={14} /> Promote
                        </button>
                      )}
                      {u.role === 'ISSUER' && (
                        <button
                          onClick={() => setDemoteConfirm(u._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        >
                          <ArrowDownToLine size={14} /> Demote
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
            <span className="text-xs text-gray-500">
              Hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, total)} trong tổng {total}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========== PROMOTE MODAL ========== */}
      <AnimatePresence>
        {promoteModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setPromoteModal({ open: false, userId: null })}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-md shadow-xl border border-gray-100 dark:border-gray-700"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ArrowUpToLine className="text-primary" /> Nâng quyền Issuer
                </h2>
                <button onClick={() => setPromoteModal({ open: false, userId: null })} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handlePromote} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên tổ chức <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={orgForm.organizationName}
                    onChange={(e) => setOrgForm({ ...orgForm, organizationName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                    placeholder="VD: Trường Đại học Xây Dựng Hà Nội"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mã tổ chức <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={orgForm.organizationCode}
                    onChange={(e) => setOrgForm({ ...orgForm, organizationCode: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all uppercase"
                    placeholder="VD: HUCE"
                    required
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={promoteMutation.isPending}
                    className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors disabled:opacity-70 cursor-pointer shadow-sm"
                  >
                    {promoteMutation.isPending ? 'Đang xử lý...' : 'Xác nhận Nâng quyền'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========== DEMOTE CONFIRM ========== */}
      <AnimatePresence>
        {demoteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setDemoteConfirm(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100 dark:border-gray-700 text-center space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto text-orange-500">
                <ArrowDownToLine size={24} />
              </div>
              <h3 className="font-bold text-lg">Xác nhận giáng cấp</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tài khoản này sẽ bị thu hồi quyền cấp phát chứng chỉ và trở về làm Holder thông thường.
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <button onClick={() => setDemoteConfirm(null)} className="px-5 py-2 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm cursor-pointer">
                  Huỷ
                </button>
                <button
                  onClick={() => demoteMutation.mutate(demoteConfirm)}
                  disabled={demoteMutation.isPending}
                  className="px-5 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-sm font-medium disabled:opacity-70 cursor-pointer shadow-sm"
                >
                  {demoteMutation.isPending ? 'Đang xử lý...' : 'Đồng ý'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
