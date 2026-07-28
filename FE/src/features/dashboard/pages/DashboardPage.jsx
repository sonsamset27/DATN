import { useEffect, useState } from 'react';
import { useAuthStore } from '../../auth/store/auth.store';
import { authApi } from '../../auth/services/auth.api';
import toast from 'react-hot-toast';
import { User, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, updateUser } = useAuthStore();
  const [showNameModal, setShowNameModal] = useState(false);
  const [inputName, setInputName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Nếu user chưa có tên, bắt buộc nhập
    if (user && !user.userName) {
      setShowNameModal(true);
    }
  }, [user]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!inputName.trim()) return toast.error('Vui lòng nhập tên hợp lệ');
    try {
      setLoading(true);
      const res = await authApi.updateUserName(inputName.trim());
      updateUser({ userName: res.data.userName });
      toast.success('Cập nhật tên thành công!');
      setShowNameModal(false);
    } catch (err) {
      // toast tự hiển thị từ interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tổng quan Dashboard</h1>
      <p>Xin chào, <span className="font-semibold text-primary">{user?.userName || 'Người dùng mới'}</span>!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 font-medium">Vai trò của bạn</h3>
          <p className="text-xl font-bold mt-2 flex items-center gap-2">
            <User className="text-primary" /> {user?.role}
          </p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 font-medium">Trạng thái tài khoản</h3>
          <p className="text-xl font-bold mt-2 flex items-center gap-2">
            <CheckCircle2 className="text-success" /> {user?.status}
          </p>
        </div>
      </div>

      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-md shadow-xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-2">Cập nhật thông tin</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Bạn đang đăng nhập lần đầu tiên. Vui lòng cập nhật họ và tên hiển thị trong hệ thống.
            </p>
            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Họ và Tên</label>
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="VD: Nguyễn Văn A"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
              >
                {loading ? 'Đang cập nhật...' : 'Xác nhận'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
