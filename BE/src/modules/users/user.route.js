import { Router } from "express";
import UserController from "./user.controller.js";
import AuthMiddleware from "../../shared/middlewares/auth.middleware.js";
import UserValidator from "./user.validator.js";
import AuthLimitMiddleware from "../../shared/middlewares/authLimit.middleware.js";

const UserRoute = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Quản lý tài khoản người dùng
 */

/**
 * @swagger
 * /v1/users:
 *   get:
 *     summary: Lấy danh sách tất cả người dùng
 *     description: Chỉ ADMIN được phép. Trả về toàn bộ danh sách user trong hệ thống.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách users
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
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
UserRoute.get("/", AuthLimitMiddleware.readLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN"), UserController.findAllUsers);

/**
 * @swagger
 * /v1/users/me:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại
 *     description: Trả về thông tin tài khoản của người dùng đang đăng nhập.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
UserRoute.get("/me", AuthLimitMiddleware.readLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER", "HOLDER"), UserController.getMe);

/**
 * @swagger
 * /v1/users/me/name:
 *   patch:
 *     summary: Cập nhật tên hiển thị
 *     description: Người dùng cập nhật tên hiển thị của bản thân.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *             properties:
 *               userName:
 *                 type: string
 *                 example: Nguyễn Văn A
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
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
UserRoute.patch("/me/name", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER", "HOLDER"), UserValidator.updateUserName, UserController.updateUserName);

/**
 * @swagger
 * /v1/users/{id}:
 *   get:
 *     summary: Lấy thông tin người dùng theo ID
 *     description: Chỉ ADMIN được phép.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId của user
 *     responses:
 *       200:
 *         description: Thông tin người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
UserRoute.get("/:id", AuthLimitMiddleware.readLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN"), UserController.findUserById);

/**
 * @swagger
 * /v1/users/{id}/role:
 *   patch:
 *     summary: Cập nhật vai trò người dùng
 *     description: Chỉ ADMIN. Cập nhật role (ADMIN, ISSUER, HOLDER).
 *     tags: [Users]
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
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, ISSUER, HOLDER]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
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
UserRoute.patch("/:id/role", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN"), UserValidator.updateUserRole, UserController.updateUserRole);

/**
 * @swagger
 * /v1/users/{id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái tài khoản
 *     description: Chỉ ADMIN. Bật/tắt tài khoản người dùng (ACTIVE / DISABLE).
 *     tags: [Users]
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
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, DISABLE]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
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
UserRoute.patch("/:id/status", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN"), UserValidator.updateUserStatus, UserController.updateUserStatus);

/**
 * @swagger
 * /v1/users/{id}/promote-issuer:
 *   patch:
 *     summary: Nâng quyền người dùng thành Issuer
 *     description: Chỉ ADMIN. Đăng ký relayer trên blockchain và cập nhật role ISSUER + thông tin tổ chức.
 *     tags: [Users]
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
 *             type: object
 *             required:
 *               - organizationName
 *               - organizationCode
 *             properties:
 *               organizationName:
 *                 type: string
 *                 example: Trường Đại học ABC
 *               organizationCode:
 *                 type: string
 *                 example: TDHABC
 *     responses:
 *       200:
 *         description: Nâng quyền thành công
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Người dùng đã là Issuer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               errorCode: USER_002
 *               message: User is already an issuer
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
UserRoute.patch("/:id/promote-issuer", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN"), UserValidator.promoteToIssuer, UserController.promoteToIssuer);

/**
 * @swagger
 * /v1/users/{id}/demote-issuer:
 *   patch:
 *     summary: Hạ quyền / vô hiệu hóa Issuer
 *     description: Chỉ ADMIN. Xóa relayer trên blockchain và đặt tài khoản về DISABLE.
 *     tags: [Users]
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
 *         description: Hạ quyền thành công
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
UserRoute.patch("/:id/demote-issuer", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN"), UserController.demoteOrRevokeIssuer);

export default UserRoute;
