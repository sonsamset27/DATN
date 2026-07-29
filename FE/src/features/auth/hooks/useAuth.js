import { useState } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { authApi } from '../services/auth.api';
import { useAuthStore } from '../store/auth.store';
import toast from 'react-hot-toast';

export const useLoginFlow = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { login, isAuthenticated } = useAuthStore();

  const [isSigning, setIsSigning] = useState(false);

  const handleSiweLogin = async () => {
    if (!address || !isConnected) {
      toast.error('Vui lòng kết nối ví trước.');
      return;
    }
    try {
      setIsSigning(true);

      // 1. Lấy challenge
      toast.loading('Đang lấy challenge từ server...', { id: 'siwe' });
      const challengeRes = await authApi.getChallenge(address);
      const { nonce } = challengeRes;
      if (!nonce) throw new Error('Không nhận được nonce từ server. Vui lòng thử lại.');

      // 2. Ký — popup MetaMask từ user gesture nên sẽ hiển thị bình thường
      toast.loading('Vui lòng xác nhận chữ ký trên ví...', { id: 'siwe' });
      const signature = await signMessageAsync({ message: nonce });

      // 3. Gửi chữ ký lên server để lấy token
      toast.loading('Đang xác thực với server...', { id: 'siwe' });
      const loginRes = await authApi.loginWithSignature(address, signature);

      // 4. Lưu token tạm để getMe có thể gọi được (axios interceptor đọc từ localStorage)
      localStorage.setItem('accessToken', loginRes.accessToken);

      // 5. Fetch fresh user data từ DB để có userName mới nhất (tránh dùng snapshot trong JWT)
      const meRes = await authApi.getMe();
      const freshUser = meRes.data;

      // 6. Lưu vào store với fresh data
      login(freshUser, loginRes.accessToken);

      toast.success('Đăng nhập thành công!', { id: 'siwe' });
    } catch (error) {
      console.error('Login failed:', error);
      localStorage.removeItem('accessToken');
      if (error?.name === 'UserRejectedRequestError' || error?.code === 4001) {
        toast.error('Bạn đã từ chối ký xác nhận. Hãy thử lại.', { id: 'siwe' });
      } else {
        const msg = error?.message || error?.error || 'Đăng nhập thất bại. Vui lòng thử lại.';
        toast.error(msg, { id: 'siwe' });
        disconnect();
      }
    } finally {
      setIsSigning(false);
    }
  };

  return { isSigning, isConnected, address, handleSiweLogin, isAuthenticated };
};
