import AuditLog from "./auditLog.model.js";

const AuditLogRepository = {
    createLog: async (data) => {
        return await AuditLog.create(data);
    },

    /**
     * Lấy danh sách logs có phân trang, sắp xếp mới nhất trước.
     * @param {Object} filter  - Bộ lọc mongoose (actorDid, action, targetType…)
     * @param {number} page    - Trang hiện tại (bắt đầu từ 1)
     * @param {number} limit   - Số bản ghi mỗi trang
     */
    getLogs: async (filter = {}, page = 1, limit = 20) => {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            AuditLog.find(filter)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            AuditLog.countDocuments(filter),
        ]);
        return { data, total, page, limit };
    },

    /**
     * Lấy tất cả logs theo actorDid (DID người thực hiện).
     */
    getLogsByActor: async (actorDid, page = 1, limit = 20) => {
        return await AuditLogRepository.getLogs({ actorDid }, page, limit);
    },

    /**
     * Lấy tất cả logs theo targetId (credentialId, templateId, did, userId…).
     */
    getLogsByTarget: async (targetId, page = 1, limit = 20) => {
        return await AuditLogRepository.getLogs({ targetId }, page, limit);
    },
};

export default AuditLogRepository;
