import axiosInstance from '../../../lib/axios';

export const templatesApi = {
  // ADMIN only — lấy tất cả templates trong hệ thống
  getAllTemplates: async (params = {}) => {
    return await axiosInstance.get('/credential-templates', { params });
  },

  // ISSUER — lấy templates mà issuer đó đã tạo
  getIssuerTemplates: async (issuerId, params = {}) => {
    return await axiosInstance.get(`/credential-templates/issuer/${issuerId}`, { params });
  },

  // Lấy chi tiết 1 template theo ID
  getTemplateById: async (id) => {
    return await axiosInstance.get(`/credential-templates/${id}`);
  },

  // Tạo template mới (name, description, fields)
  createTemplate: async (data) => {
    return await axiosInstance.post('/credential-templates', data);
  },

  // Cập nhật template
  updateTemplate: async (id, data) => {
    return await axiosInstance.put(`/credential-templates/${id}`, data);
  },

  // Xoá template
  deleteTemplate: async (id) => {
    return await axiosInstance.delete(`/credential-templates/${id}`);
  }
};
