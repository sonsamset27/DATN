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

  // KHÔNG dùng useEffect auto-trigger nữa.
  // Lý do:
  // 1. Browser/MetaMask block popup không từ user gesture trực tiếp → sign bị fail.
  // 2. Khi reload: wagmi restore ví connected nhưng isAuthenticated=false
  //    → auto-trigger gọi sign ngay lập tức mà user không mong muốn.
  // 3. Khi logout: logout() chỉ clear store, wagmi vẫn connected
  //    → condition isConnected && !isAuthenticated = true → auto-trigger lại.
  // Giải pháp: sign chỉ được gọi khi user CHỦ ĐỘNG click nút.

  const handleSiweLogin = async () => {
    if (!address || !isConnected) {
      toast.error('Vui lòng kết nối ví trước.');
      return;
    }
    try {
      setIsSigning(true);
      
      // 1. Lấy challenge từ BE
      toast.loading('Đang lấy challenge từ server...', { id: 'siwe' });
      const challengeRes = await authApi.getChallenge(address);
      const { nonce } = challengeRes;
      
      if (!nonce) {
        throw new Error('Không nhận được nonce từ server. Vui lòng thử lại.');
      }

      // 2. Mở MetaMask để ký — đây là bước user tương tác trực tiếp
      //    nên popup sẽ hiển thị bình thường
      toast.loading('Vui lòng xác nhận chữ ký trên ví MetaMask...', { id: 'siwe' });
      const signature = await signMessageAsync({ message: nonce });
      
      // 3. Gửi chữ ký lên server
      toast.loading('Đang xác thực với server...', { id: 'siwe' });
      const loginRes = await authApi.loginWithSignature(address, signature);
      
      // 4. Lưu vào store
      login(loginRes.user, loginRes.accessToken);
      
      toast.success('Đăng nhập thành công!', { id: 'siwe' });
    } catch (error) {
      console.error('Login failed:', error);
      // Nếu user tự reject signing thì không disconnect, chỉ thông báo
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
