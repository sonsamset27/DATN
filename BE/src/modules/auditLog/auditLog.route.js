import { Router } from "express";
import AuditLogController from "./auditLog.controller.js";
import AuthMiddleware from "../../shared/middlewares/auth.middleware.js";

const AuditLogRoute = Router();

/**
 * @swagger
 * tags:
 *   name: AuditLog
 *   description: Lịch sử hành động hệ thống (Audit Trail)
 */

/**
 * @swagger
 * /v1/audit-logs:
 *   get:
 *     summary: Lấy danh sách audit logs
 *     description: Truy xuất toàn bộ audit logs có filter và phân trang. Chỉ ADMIN.
 *     tags: [AuditLog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: actorDid
 *         schema:
 *           type: string
 *         description: Lọc theo DID người thực hiện
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [ISSUE, REVOKE, VERIFY, REISSUE, REGISTER_DID, TEMPLATE_CREATE, TEMPLATE_UPDATE, TEMPLATE_DELETE, USER_PROMOTE, USER_DEMOTE]
 *         description: Lọc theo loại hành động
 *       - in: query
 *         name: targetType
 *         schema:
 *           type: string
 *           enum: [CREDENTIAL, DID, TEMPLATE, USER]
 *         description: Lọc theo loại đối tượng
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số bản ghi mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLog'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
AuditLogRoute.get(
    "/",
    AuthMiddleware.Authentication,
    AuthMiddleware.Authorization("ADMIN", "ISSUER"),
    AuditLogController.getLogs
);

/**
 * @swagger
 * /v1/audit-logs/target/{targetId}:
 *   get:
 *     summary: Lấy logs theo target
 *     description: Truy xuất lịch sử hành động của một đối tượng cụ thể (credential, template, DID…). ADMIN và ISSUER.
 *     tags: [AuditLog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đối tượng (credentialId, templateId, did…)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Danh sách logs theo target
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLog'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
AuditLogRoute.get(
    "/target/:targetId",
    AuthMiddleware.Authentication,
    AuthMiddleware.Authorization("ADMIN", "ISSUER"),
    AuditLogController.getLogsByTarget
);

export default AuditLogRoute;
