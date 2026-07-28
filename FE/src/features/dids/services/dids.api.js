import axiosInstance from '../../../lib/axios';

export const didsApi = {
  prepareCreateDid: async () => {
    return await axiosInstance.post('/dids/prepare');
  },

  registerDid: async (txHash) => {
    return await axiosInstance.post('/dids/register', { txHash });
  },

  getMyDid: async () => {
    return await axiosInstance.get('/dids/me');
  }
};
