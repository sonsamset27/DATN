import axiosInstance from '../../../lib/axios';

export const usersApi = {
  getAllUsers: async (params = {}) => {
    return await axiosInstance.get('/users', { params });
  },

  updateUserRole: async (id, role) => {
    return await axiosInstance.patch(`/users/${id}/role`, { role });
  },

  updateUserStatus: async (id, status) => {
    return await axiosInstance.patch(`/users/${id}/status`, { status });
  },

  promoteToIssuer: async (id, data) => {
    // data: { organizationName, organizationCode }
    return await axiosInstance.patch(`/users/${id}/promote-issuer`, data);
  },

  demoteIssuer: async (id) => {
    return await axiosInstance.patch(`/users/${id}/demote-issuer`);
  }
};
