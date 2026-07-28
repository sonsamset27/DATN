import axiosInstance from '../../../lib/axios';

export const templatesApi = {
  getAllTemplates: async (params = {}) => {
    return await axiosInstance.get('/credential-templates', { params });
  },

  getIssuerTemplates: async (issuerId) => {
    return await axiosInstance.get(`/credential-templates/issuer/${issuerId}`);
  },

  createTemplate: async (data) => {
    // data: { title, description, schema: [{ name, type, required }] }
    return await axiosInstance.post('/credential-templates', data);
  },

  updateTemplate: async (id, data) => {
    return await axiosInstance.put(`/credential-templates/${id}`, data);
  },

  deleteTemplate: async (id) => {
    return await axiosInstance.delete(`/credential-templates/${id}`);
  }
};
