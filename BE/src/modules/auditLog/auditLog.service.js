import AuditLogRepository from "./auditLog.repository.js";
import AppError from "../../shared/errors/AppError.js";
import ErrorCodes from "../../shared/errors/errorCodes.js";

const AuditLogService = {
    /**
     * Ghi một bản ghi audit log.
     * Được gọi từ các service sau mỗi hành động thành công.
     * Không throw để tránh làm hỏng luồng chính nếu log fail.
     *
     * @param {string} actorDid    - DID người thực hiện hành động
     * @param {string} action      - Hành động (ISSUE, REVOKE, …)
     * @param {string} targetId    - ID của đối tượng bị tác động
     * @param {string} targetType  - Loại đối tượng (CREDENTIAL, DID, …)
     * @param {Object} [metadata]  - Thông tin bổ sung (tùy chọn)
     */
    log: async (actorDid, action, targetId, targetType, metadata = {}) => {
        try {
            await AuditLogRepository.createLog({
                actorDid,
                action,
                targetId,
                targetType,
                metadata,
            });
        } catch (err) {
            // Log lỗi ra console nhưng KHÔNG rethrow
            // → audit log thất bại không được làm hỏng business flow
            console.error("[AuditLog] Failed to write log:", err.message);
        }
    },

    /**
     * Lấy danh sách logs có lọc và phân trang.
     * @param {Object} query - { actorDid?, action?, targetType?, page?, limit? }
     */
    getLogs: async (query = {}) => {
        const { actorDid, action, targetType, page = 1, limit = 20 } = query;
        const filter = {};
        if (actorDid) filter.actorDid = actorDid;
        if (action) filter.action = action;
        if (targetType) filter.targetType = targetType;

        return await AuditLogRepository.getLogs(filter, Number(page), Number(limit));
    },

    /**
     * Lấy logs theo targetId (dùng cho trang chi tiết credential/template).
     */
    getLogsByTarget: async (targetId, page = 1, limit = 20) => {
        if (!targetId) {
            throw AppError.badRequest(ErrorCodes.AUDIT_001, "Target ID is required");
        }
        return await AuditLogRepository.getLogsByTarget(targetId, Number(page), Number(limit));
    },
};

export default AuditLogService;
