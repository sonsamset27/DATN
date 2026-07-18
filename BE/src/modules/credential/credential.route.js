import { Router } from "express";
import CredentialController from "./credential.controller.js";
import AuthMiddleware from "../../shared/middlewares/auth.middleware.js";
import CredentialValidator from "./credential.validator.js";

const CredentialRoute = Router();

/**
 * @swagger
 * tags:
 *   name: Credentials
 *   description: Quản lý chứng chỉ số (Verifiable Credentials)
 */

/**
 * @swagger
 * /v1/credentials/issue:
 *   post:
 *     summary: Cấp chứng chỉ mới cho holder
 *     description: |
 *       ADMIN hoặc ISSUER cấp chứng chỉ cho holder theo template.
 *       Flow: validate template fields → pin IPFS → ghi blockchain → lưu DB.
 *       Nếu lưu DB thất bại, tự động rollback giao dịch blockchain.
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IssueCredentialInput'
 *           example:
 *             holderAddress: "0xAbC1234567890defABCdef1234567890ABCdef12"
 *             credentialTemplateId: "64f1a2b3c4d5e6f7a8b9c0d1"
 *             credentialSubject:
 *               studentName: Nguyễn Văn A
 *               studentId: "20200001"
 *               major: Công nghệ thông tin
 *             expirateAt: "2030-12-31T00:00:00.000Z"
 *     responses:
 *       201:
 *         description: Cấp chứng chỉ thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Credential'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Template hoặc DID không tìm thấy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               templateNotFound:
 *                 value:
 *                   errorCode: TEMPLATE_001
 *                   message: Credential template not found
 *               didNotFound:
 *                 value:
 *                   errorCode: DID_001
 *                   message: DID not found for this address
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
CredentialRoute.post("/issue", AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER"), CredentialValidator.issueCredential, CredentialController.issueCredential);

/**
 * @swagger
 * /v1/credentials/verify:
 *   post:
 *     summary: Xác minh tính hợp lệ của chứng chỉ
 *     description: So sánh hash IPFS với blockchain hash để phát hiện giả mạo. Bất kỳ user nào cũng có thể dùng.
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - credentialId
 *             properties:
 *               credentialId:
 *                 type: string
 *                 example: "TDHABC-2024-001"
 *     responses:
 *       200:
 *         description: Kết quả xác minh
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
 *                     status:
 *                       type: string
 *                       example: VERIFIED
 *                     metadata:
 *                       type: object
 *                     subjectData:
 *                       type: object
 *                     blockchainProof:
 *                       type: object
 *                       properties:
 *                         credentialHash:
 *                           type: string
 *                         txHash:
 *                           type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Credential không tìm thấy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               errorCode: CREDENTIAL_001
 *               message: Credential not found in database
 *       422:
 *         description: Hash không khớp – chứng chỉ có thể bị giả mạo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               errorCode: CREDENTIAL_002
 *               message: Credential hash does not match – possible tampering detected
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
CredentialRoute.post("/verify", AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER", "HOLDER"), CredentialValidator.verifyCredential, CredentialController.verifyCredential);

/**
 * @swagger
 * /v1/credentials/owner:
 *   get:
 *     summary: Lấy danh sách chứng chỉ của holder hiện tại
 *     description: Trả về tất cả chứng chỉ mà người dùng đang đăng nhập là holder. Tối ưu N+1 với batch load templates.
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách chứng chỉ
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
 *                     $ref: '#/components/schemas/CredentialSummary'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Holder chưa có DID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               errorCode: DID_001
 *               message: Holder DID not found
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
CredentialRoute.get("/owner", AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER", "HOLDER"), CredentialController.getOwnCredentials);

/**
 * @swagger
 * /v1/credentials/issued:
 *   get:
 *     summary: Lấy danh sách chứng chỉ đã cấp bởi issuer hiện tại
 *     description: ADMIN hoặc ISSUER. Trả về danh sách chứng chỉ mà người dùng đang đăng nhập đã cấp. Tối ưu N+1 với batch load templates.
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách chứng chỉ đã cấp
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
 *                     total:
 *                       type: integer
 *                     list:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CredentialIssuerView'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Issuer chưa có DID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               errorCode: DID_001
 *               message: Issuer DID not found
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
CredentialRoute.get("/issued", AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER"), CredentialController.getCredentialIssueByIssuer);

/**
 * @swagger
 * /v1/credentials/reissue-all:
 *   post:
 *     summary: Cấp lại toàn bộ chứng chỉ từ ví cũ sang ví mới
 *     description: |
 *       ISSUER cấp lại (migrate) toàn bộ chứng chỉ do tổ chức mình phát hành
 *       từ ví cũ sang ví mới của holder (ví dụ khi holder mất private key).
 *       Flow: thu hồi từng credential cũ → cấp lại với holderDid mới.
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldWalletAddress
 *               - newWalletAddress
 *             properties:
 *               oldWalletAddress:
 *                 type: string
 *                 example: "0xOldAddress..."
 *               newWalletAddress:
 *                 type: string
 *                 example: "0xNewAddress..."
 *     responses:
 *       200:
 *         description: Kết quả cấp lại
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
 *                     success:
 *                       type: boolean
 *                     message:
 *                       type: string
 *                     data:
 *                       type: array
 *                     errors:
 *                       type: array
 *                       description: Các credential thất bại (nếu có)
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
CredentialRoute.post("/reissue-all", AuthMiddleware.Authentication, AuthMiddleware.Authorization("ISSUER"), CredentialValidator.reissueAllCredentials, CredentialController.reissueAllCredentials);

/**
 * @swagger
 * /v1/credentials/{credentialId}:
 *   get:
 *     summary: Lấy chi tiết chứng chỉ kèm xác minh hash
 *     description: Lấy thông tin đầy đủ của chứng chỉ, đồng thời so khớp hash IPFS vs blockchain để xác định tính toàn vẹn.
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: credentialId
 *         required: true
 *         schema:
 *           type: string
 *         description: Credential ID (ví dụ TDHABC-2024-001)
 *     responses:
 *       200:
 *         description: Chi tiết chứng chỉ
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
 *                     status:
 *                       type: string
 *                       enum: [ACTIVE, REVOKED, EXPIRED, INVALID_HASH]
 *                     isValid:
 *                       type: boolean
 *                     metadata:
 *                       type: object
 *                     subjectData:
 *                       type: object
 *                     proof:
 *                       type: object
 *                       properties:
 *                         cid:
 *                           type: string
 *                         computedHash:
 *                           type: string
 *                         blockchainHash:
 *                           type: string
 *                         txHash:
 *                           type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Credential không tìm thấy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               errorCode: CREDENTIAL_001
 *               message: Credential not found in database
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
CredentialRoute.get("/:credentialId", AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER", "HOLDER"), CredentialController.getCredentialById);

export default CredentialRoute;