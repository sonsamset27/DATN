import axiosInstance from '../../../lib/axios';

export const authApi = {
  getChallenge: async (walletAddress) => {
    return await axiosInstance.post('/auth/challenge', { walletAddress });
  },

  loginWithSignature: async (walletAddress, signature) => {
    return await axiosInstance.post('/auth/login', { walletAddress, signature });
  },
  
  updateUserName: async (userName) => {
    return await axiosInstance.patch('/users/me/name', { userName });
  },

  // Lấy fresh user data từ DB (dùng sau login hoặc khi cần sync)
  getMe: async () => {
    return await axiosInstance.get('/users/me');
  },
};
