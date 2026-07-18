import { Router } from "express";
import CredentialTemplateController from "./credentialTemplate.controller.js";
import AuthMiddleware from "../../shared/middlewares/auth.middleware.js";
import AuthLimitMiddleware from "../../shared/middlewares/authLimit.middleware.js";
import CredentialTemplateValidator from "./credentialTemplate.validator.js";

const CredentialTemplateRoute = Router();

/**
 * @swagger
 * tags:
 *   name: CredentialTemplates
 *   description: Quản lý mẫu chứng chỉ (Credential Templates)
 */

/**
 * @swagger
 * /v1/credential-templates:
 *   post:
 *     summary: Tạo mẫu chứng chỉ mới
 *     description: ADMIN hoặc ISSUER tạo mẫu chứng chỉ định nghĩa các trường dữ liệu.
 *     tags: [CredentialTemplates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCredentialTemplateInput'
 *     responses:
 *       201:
 *         description: Mẫu tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/CredentialTemplate'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
CredentialTemplateRoute.post("/", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER"), CredentialTemplateValidator.createCredentialTemplate, CredentialTemplateController.createCredentialTemplate);

/**
 * @swagger
 * /v1/credential-templates:
 *   get:
 *     summary: Lấy tất cả mẫu chứng chỉ
 *     description: Chỉ ADMIN. Trả về toàn bộ danh sách templates trong hệ thống.
 *     tags: [CredentialTemplates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách templates
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
 *                     $ref: '#/components/schemas/CredentialTemplate'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
CredentialTemplateRoute.get("/", AuthLimitMiddleware.readLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN"), CredentialTemplateController.getAllCredentialTemplates);

/**
 * @swagger
 * /v1/credential-templates/issuer/{issuerId}:
 *   get:
 *     summary: Lấy templates theo Issuer
 *     description: ADMIN hoặc ISSUER lấy danh sách template của một issuer cụ thể.
 *     tags: [CredentialTemplates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: issuerId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId của issuer (user)
 *     responses:
 *       200:
 *         description: Danh sách templates của issuer
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
 *                     $ref: '#/components/schemas/CredentialTemplate'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
CredentialTemplateRoute.get("/issuer/:issuerId", AuthLimitMiddleware.readLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER"), CredentialTemplateController.getCredentialTemplateByIssuerId);

/**
 * @swagger
 * /v1/credential-templates/{id}:
 *   get:
 *     summary: Lấy chi tiết một mẫu chứng chỉ
 *     description: ADMIN hoặc ISSUER. Lấy chi tiết template theo ID.
 *     tags: [CredentialTemplates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId của template
 *     responses:
 *       200:
 *         description: Chi tiết template
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/CredentialTemplate'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Template không tìm thấy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               errorCode: TEMPLATE_001
 *               message: Credential template not found
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
CredentialTemplateRoute.get("/:id", AuthLimitMiddleware.readLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER"), CredentialTemplateController.getCredentialTemplateById);

/**
 * @swagger
 * /v1/credential-templates/{id}:
 *   put:
 *     summary: Cập nhật mẫu chứng chỉ
 *     description: ADMIN hoặc ISSUER. Cập nhật tên, mô tả hoặc fields của template.
 *     tags: [CredentialTemplates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCredentialTemplateInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/CredentialTemplate'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
CredentialTemplateRoute.put("/:id", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER"), CredentialTemplateValidator.updateCredentialTemplate, CredentialTemplateController.updateCredentialTemplate);

/**
 * @swagger
 * /v1/credential-templates/{id}:
 *   delete:
 *     summary: Xóa mẫu chứng chỉ
 *     description: ADMIN hoặc ISSUER. Xóa template theo ID.
 *     tags: [CredentialTemplates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
CredentialTemplateRoute.delete("/:id", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER"), CredentialTemplateController.deleteCredentialTemplate);

export default CredentialTemplateRoute;