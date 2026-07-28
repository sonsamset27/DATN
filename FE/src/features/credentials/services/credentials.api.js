import axiosInstance from '../../../lib/axios';

export const credentialsApi = {
  // Lấy chứng chỉ của Holder
  getOwnCredentials: async (params = {}) => {
    return await axiosInstance.get('/credentials/owner', { params });
  },

  // Lấy chứng chỉ do Issuer cấp
  getIssuedCredentials: async (params = {}) => {
    return await axiosInstance.get('/credentials/issued', { params });
  },

  // Lấy thống kê số lượng chứng chỉ (Dành cho Admin)
  getStats: async () => {
    return await axiosInstance.get('/credentials/stats');
  },

  // Chi tiết chứng chỉ (gọi IPFS + blockchain verify)
  getCredentialById: async (id) => {
    return await axiosInstance.get(`/credentials/${id}`);
  },

  // Phát hành chứng chỉ mới
  issueCredential: async (data) => {
    return await axiosInstance.post('/credentials/issue', data);
  },

  // Xác minh chứng chỉ
  verifyCredential: async (credentialId) => {
    return await axiosInstance.post('/credentials/verify', { credentialId });
  },

  // Cấp lại toàn bộ chứng chỉ từ ví cũ sang ví mới
  reissueAll: async (data) => {
    // data: { oldWalletAddress, newWalletAddress }
    return await axiosInstance.post('/credentials/reissue-all', data);
  },
};
