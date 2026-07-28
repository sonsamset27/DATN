import axiosInstance from '../../../lib/axios';

export const auditLogsApi = {
  getLogs: async (params = {}) => {
    return await axiosInstance.get('/audit-logs', { params });
  }
};
