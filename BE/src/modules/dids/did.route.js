import { Router } from "express";
import DidController from "./did.controller.js";
import AuthMiddleware from "../../shared/middlewares/auth.middleware.js";
import AuthLimitMiddleware from "../../shared/middlewares/authLimit.middleware.js";
import DidValidator from "./did.validator.js";

const DidRoute = Router();

/**
 * @swagger
 * tags:
 *   name: DIDs
 *   description: Quản lý định danh phi tập trung (Decentralized Identifiers)
 */

/**
 * @swagger
 * /v1/dids/prepare:
 *   post:
 *     summary: Chuẩn bị dữ liệu để đăng ký DID
 *     description: Trả về thông tin DID dự kiến (did string, publicKey, algorithm) để client tự ký và gửi lên blockchain. Sau đó gọi `/register` với txHash.
 *     tags: [DIDs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dữ liệu chuẩn bị thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     did:
 *                       type: string
 *                       example: "did:ethr:testnet:0xabc..."
 *                     publicKey:
 *                       type: string
 *                       example: "0xabc..."
 *                     algorithm:
 *                       type: string
 *                       example: ECC
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         description: Người dùng đã có DID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               errorCode: DID_002
 *               message: User already has a DID
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
DidRoute.post("/prepare", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, DidController.prepareCreateDid);

/**
 * @swagger
 * /v1/dids/register:
 *   post:
 *     summary: Đăng ký DID sau khi giao dịch blockchain thành công
 *     description: Xác minh txHash trên blockchain và lưu DID vào DB. Phải gọi `/prepare` trước.
 *     tags: [DIDs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - txHash
 *             properties:
 *               txHash:
 *                 type: string
 *                 example: "0xabcdef..."
 *                 description: Transaction hash của giao dịch đăng ký DID trên blockchain
 *     responses:
 *       201:
 *         description: DID đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Did'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         description: Người dùng đã có DID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               errorCode: DID_002
 *               message: User already has a DID
 *       422:
 *         description: Owner không khớp hoặc tx không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               errorCode: DID_003
 *               message: DID owner does not match the authenticated user
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
DidRoute.post("/register", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, DidController.registerDid);

/**
 * @swagger
 * /v1/dids/me:
 *   get:
 *     summary: Lấy DID của người dùng hiện tại
 *     description: Trả về thông tin DID của người dùng đang đăng nhập, xác minh đồng thời trên blockchain.
 *     tags: [DIDs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: DID tìm thấy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Did'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Người dùng chưa có DID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               errorCode: DID_001
 *               message: DID not found for this user
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
DidRoute.get("/me", AuthLimitMiddleware.readLimiter, AuthMiddleware.Authentication, DidController.getDidByUserId);

/**
 * @swagger
 * /v1/dids/address:
 *   post:
 *     summary: Lấy DID theo địa chỉ ví
 *     description: Tìm DID theo wallet address. Chỉ ADMIN và ISSUER. Thường dùng khi issuer cần kiểm tra DID của holder trước khi cấp chứng chỉ.
 *     tags: [DIDs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 example: "0xAbC1234567890defABCdef1234567890ABCdef12"
 *     responses:
 *       200:
 *         description: DID tìm thấy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Did'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Địa chỉ ví chưa có DID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               errorCode: DID_001
 *               message: DID not found for this address
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
DidRoute.post("/address", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER"), DidValidator.getDidByAddress, DidController.getDidByAddress);

export default DidRoute;