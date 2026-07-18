import { Router } from "express";
import AuthController from "./auth.controller.js";
import AuthValidator from "./auth.validator.js";
import AuthLimitMiddleware from "../../shared/middlewares/authLimit.middleware.js";

const AuthRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Xác thực bằng chữ ký ví Ethereum (Sign-In with Ethereum)
 */

/**
 * @swagger
 * /v1/auth/challenge:
 *   post:
 *     summary: Tạo challenge (nonce) để ký
 *     description: Tạo một nonce ngẫu nhiên cho địa chỉ ví. Client ký nonce này bằng private key, sau đó gửi chữ ký lên `/login`.
 *     tags: [Auth]
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
 *                 description: Địa chỉ ví Ethereum (checksummed hoặc lowercase)
 *     responses:
 *       200:
 *         description: Trả về challenge message chứa nonce để ký
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 action:
 *                   type: string
 *                   example: SIGN_IN
 *                 wallet:
 *                   type: string
 *                   example: "0xabc..."
 *                 message:
 *                   type: string
 *                 nonce:
 *                   type: string
 *                   example: "a1b2c3d4e5"
 *                 expiriedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
AuthRouter.post("/challenge", AuthLimitMiddleware.authLimiter, AuthValidator.generateChallenge, AuthController.generateChallenge);

/**
 * @swagger
 * /v1/auth/login:
 *   post:
 *     summary: Đăng nhập bằng chữ ký ví (SIWE)
 *     description: Xác minh chữ ký Ethereum và trả về JWT access token. Tự động tạo tài khoản nếu ví chưa đăng ký.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *               - signature
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 example: "0xAbC1234567890defABCdef1234567890ABCdef12"
 *               signature:
 *                 type: string
 *                 example: "0x..."
 *                 description: Chữ ký Ethereum (ethers.js signMessage) của nonce
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/UserBasic'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Chữ ký không hợp lệ hoặc địa chỉ ví không khớp
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidSignature:
 *                 value:
 *                   errorCode: AUTH_002
 *                   message: Invalid signature
 *               walletMismatch:
 *                 value:
 *                   errorCode: AUTH_003
 *                   message: Wallet address does not match the signature signer
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
AuthRouter.post("/login", AuthLimitMiddleware.authLimiter, AuthValidator.verifySignature, AuthController.verifySignature);

export default AuthRouter;