import axiosInstance from '../../../lib/axios';

export const didsApi = {
  prepareCreateDid: async () => {
    return await axiosInstance.post('/dids/prepare');
  },

  registerDid: async (txHash) => {
    return await axiosInstance.post('/dids/register', { txHash });
  },

  getMyDid: async () => {
    // hideErrorToast: true để tránh toast lỗi "DID not found" khi user mới chưa có DID (trạng thái bình thường)
    return await axiosInstance.get('/dids/me', { hideErrorToast: true });
  }
};
