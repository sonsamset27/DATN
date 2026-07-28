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

  // Chi tiết chứng chỉ
  getCredentialById: async (id) => {
    return await axiosInstance.get(`/credentials/${id}`);
  },

  // Phát hành chứng chỉ (Thực tế BE gộp prepare & pin IPFS & lưu DB vào 1 API này. Nhưng theo flow chuẩn SSI, nếu BE trả về hash trước rồi FE ký, thì gọi /issue. Tuy nhiên theo docs thì BE đang lo toàn bộ từ IPFS tới gọi blockchain nếu gọi qua relayer, HOẶC BE lưu DB sau khi FE gọi SC. Theo mô tả của API /issue: "validate template -> pin IPFS -> ghi blockchain -> lưu DB". Tức là BE làm HẾT!)
  // Wait, nếu BE làm hết thì FE không cần dùng wagmi writeContract ở bước này, chỉ gọi API.
  issueCredential: async (data) => {
    // data: { holderAddress, credentialTemplateId, credentialSubject, expirateAt }
    return await axiosInstance.post('/credentials/issue', data);
  },

  // Xác minh chứng chỉ
  verifyCredential: async (credentialId) => {
    return await axiosInstance.post('/credentials/verify', { credentialId });
  }
};
