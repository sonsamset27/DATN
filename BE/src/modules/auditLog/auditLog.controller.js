import AuditLogService from "./auditLog.service.js";
import AppError from "../../shared/errors/AppError.js";
import HttpStatus from "../../shared/errors/httpStatus.js";

const AuditLogController = {
    /**
     * GET /api/v1/audit-logs
     * Lấy danh sách audit logs với filter và phân trang.
     * Chỉ ADMIN được phép truy cập.
     */
    getLogs: async (req, res) => {
        try {
            const { actorDid, action, targetType, page, limit } = req.query;
            const result = await AuditLogService.getLogs({
                actorDid,
                action,
                targetType,
                page,
                limit,
            });
            return res.status(HttpStatus.OK).json({
                message: "Audit logs fetched successfully",
                data: result.data,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: Math.ceil(result.total / result.limit),
                },
            });
        } catch (error) {
            if (!error instanceof AppError) {
                console.log("Error at getLogs: " + error);
            }
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorCode: "SYS_001",
                message: "Failed to fetch audit logs",
            });
        }
    },

    /**
     * GET /api/v1/audit-logs/target/:targetId
     * Lấy logs theo targetId (credentialId, templateId, …).
     * ADMIN và ISSUER được phép.
     */
    getLogsByTarget: async (req, res) => {
        try {
            const { targetId } = req.params;
            const { page, limit } = req.query;
            const result = await AuditLogService.getLogsByTarget(targetId, page, limit);
            return res.status(HttpStatus.OK).json({
                message: "Audit logs fetched successfully",
                data: result.data,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: Math.ceil(result.total / result.limit),
                },
            });
        } catch (error) {
            if (!error instanceof AppError) {
                console.log("Error at getLogsByTarget: " + error);
            }
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorCode: "SYS_001",
                message: "Failed to fetch audit logs by target",
            });
        }
    },
};

export default AuditLogController;
