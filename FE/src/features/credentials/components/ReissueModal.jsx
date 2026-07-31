import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { credentialsApi } from '../services/credentials.api';
import toast from 'react-hot-toast';
import { X, RotateCcw, Wallet, ChevronRight, Loader2 } from 'lucide-react';

export default function ReissueModal({ onClose }) {
  const [oldWallet, setOldWallet] = useState('');
  const [newWallet, setNewWallet] = useState('');
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => credentialsApi.reissueAll({ oldWalletAddress: oldWallet.trim(), newWalletAddress: newWallet.trim() }),
    onSuccess: (res) => {
      const result = res?.data;
      toast.success(result?.message || 'Cấp lại thành công!');
      queryClient.invalidateQueries({ queryKey: ['issued-credentials'] });
      onClose();
    },
    onError: () => { },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!oldWallet.trim() || !newWallet.trim()) return toast.error('Vui lòng nhập đủ địa chỉ ví');
    if (oldWallet.trim() === newWallet.trim()) return toast.error('Ví cũ và ví mới không được trùng nhau');
    mutate();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.5)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <X size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <RotateCcw size={22} />
            </div>
            <div>
              <h2 className="font-bold text-lg">Cấp lại chứng chỉ</h2>
              <p className="text-white/70 text-sm">Chuyển toàn bộ chứng chỉ sang ví mới</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              <Wallet size={14} /> Địa chỉ ví cũ
            </label>
            <input
              type="text"
              value={oldWallet}
              onChange={(e) => setOldWallet(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm font-mono focus:border-amber-500 focus:outline-none focus:bg-white dark:focus:bg-gray-700 transition-all"
              placeholder="0x..."
            />
          </div>

          <div className="flex justify-center">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <ChevronRight size={18} className="text-amber-600 dark:text-amber-400 rotate-90" />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              <Wallet size={14} /> Địa chỉ ví mới
            </label>
            <input
              type="text"
              value={newWallet}
              onChange={(e) => setNewWallet(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm font-mono focus:border-amber-500 focus:outline-none focus:bg-white dark:focus:bg-gray-700 transition-all"
              placeholder="0x..."
            />
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400">
            ⚠️ Thao tác này sẽ thu hồi toàn bộ chứng chỉ do tổ chức của bạn cấp từ ví cũ và tạo mới cho ví mới. Không thể hoàn tác.
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {isPending ? <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</> : 'Xác nhận cấp lại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
