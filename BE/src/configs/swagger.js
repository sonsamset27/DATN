import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "DVP Digital Credential API",
            version: "1.0.0",
            description: `
## Digital Credential Network – Backend API

Hệ thống quản lý chứng chỉ số phi tập trung dựa trên SSI (Self-Sovereign Identity).

### Quy trình xác thực
1. Gọi \`POST /v1/auth/challenge\` để lấy nonce
2. Ký nonce bằng private key ví Ethereum
3. Gọi \`POST /v1/auth/login\` với signature → nhận JWT
4. Dùng JWT trong header \`Authorization: Bearer <token>\`

### Bảng mã lỗi (Error Codes)
| Mã lỗi | Ý nghĩa |
|--------|---------|
| AUTH_001 | Challenge không tồn tại hoặc hết hạn |
| AUTH_002 | Chữ ký không hợp lệ |
| AUTH_003 | Địa chỉ ví không khớp signer |
| AUTH_004 | Token không hợp lệ hoặc hết hạn |
| AUTH_005 | Tài khoản bị vô hiệu hóa |
| AUTH_006 | Không có quyền truy cập |
| USER_001 | Người dùng không tìm thấy |
| USER_002 | Người dùng đã là Issuer |
| DID_001 | DID không tìm thấy trong DB |
| DID_002 | DID đã tồn tại |
| DID_003 | Owner không khớp |
| DID_004 | DID không tìm thấy trên blockchain |
| CREDENTIAL_001 | Credential không tìm thấy |
| CREDENTIAL_002 | Hash không khớp (bị giả mạo) |
| CREDENTIAL_005 | Không có credential để xử lý |
| CREDENTIAL_006 | Lỗi đọc IPFS |
| CREDENTIAL_007 | Lỗi ghi blockchain (đã rollback) |
| TEMPLATE_001 | Template không tìm thấy |
| SYS_001 | Lỗi hệ thống không xác định |
            `,
        },

        servers: [
            {
                url: "http://localhost:3000/api",
                description: "Development server",
            },
        ],

        tags: [
            { name: "Auth", description: "Xác thực bằng chữ ký ví Ethereum" },
            { name: "Users", description: "Quản lý người dùng" },
            { name: "DIDs", description: "Định danh phi tập trung" },
            { name: "CredentialTemplates", description: "Mẫu chứng chỉ" },
            { name: "Credentials", description: "Chứng chỉ số" },
            { name: "AuditLog", description: "Lịch sử hành động hệ thống" },
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Nhập JWT token nhận được từ /v1/auth/login",
                },
            },

            schemas: {
                // ─── Error ───────────────────────────────────────────
                ErrorResponse: {
                    type: "object",
                    properties: {
                        errorCode: {
                            type: "string",
                            example: "CREDENTIAL_001",
                            description: "Mã lỗi nghiệp vụ chuẩn",
                        },
                        message: {
                            type: "string",
                            example: "Credential not found in database",
                        },
                    },
                },

                // ─── Pagination ──────────────────────────────────────
                Pagination: {
                    type: "object",
                    properties: {
                        total: { type: "integer", example: 100 },
                        page: { type: "integer", example: 1 },
                        limit: { type: "integer", example: 20 },
                        totalPages: { type: "integer", example: 5 },
                    },
                },

                // ─── User ────────────────────────────────────────────
                UserBasic: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        walletAddress: { type: "string" },
                        role: { type: "string", enum: ["ADMIN", "ISSUER", "HOLDER"] },
                        status: { type: "string", enum: ["ACTIVE", "DISABLE"] },
                    },
                },
                User: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        walletAddress: { type: "string" },
                        role: { type: "string", enum: ["ADMIN", "ISSUER", "HOLDER"] },
                        status: { type: "string", enum: ["ACTIVE", "DISABLE"] },
                        userName: { type: "string" },
                        organizationName: { type: "string" },
                        organizationCode: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },

                // ─── DID ─────────────────────────────────────────────
                Did: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        did: { type: "string", example: "did:ethr:testnet:0xabc..." },
                        ownerId: { type: "string" },
                        publicKey: { type: "string" },
                        keyAlgorithm: { type: "string", enum: ["ECC", "DILITHIUM"] },
                        createAt: { type: "string", format: "date-time" },
                    },
                },

                // ─── CredentialTemplate ──────────────────────────────
                TemplateField: {
                    type: "object",
                    required: ["name", "label"],
                    properties: {
                        name: { type: "string", example: "studentName" },
                        label: { type: "string", example: "Họ và tên" },
                        type: {
                            type: "string",
                            enum: ["string", "number", "date", "boolean", "select"],
                            default: "string",
                        },
                        options: {
                            type: "array",
                            items: { type: "string" },
                            description: "Chỉ dùng khi type = select",
                        },
                        required: { type: "boolean", default: false },
                    },
                },
                CredentialTemplate: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        issuerId: { type: "string" },
                        name: { type: "string", example: "Bằng tốt nghiệp đại học" },
                        description: { type: "string" },
                        fields: {
                            type: "array",
                            items: { $ref: "#/components/schemas/TemplateField" },
                        },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                CreateCredentialTemplateInput: {
                    type: "object",
                    required: ["name", "description", "fields"],
                    properties: {
                        name: { type: "string", example: "Bằng tốt nghiệp" },
                        description: { type: "string", example: "Chứng chỉ tốt nghiệp đại học" },
                        fields: {
                            type: "array",
                            items: { $ref: "#/components/schemas/TemplateField" },
                        },
                    },
                },
                UpdateCredentialTemplateInput: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        fields: {
                            type: "array",
                            items: { $ref: "#/components/schemas/TemplateField" },
                        },
                    },
                },

                // ─── Credential ──────────────────────────────────────
                IssueCredentialInput: {
                    type: "object",
                    required: ["holderAddress", "credentialTemplateId", "credentialSubject"],
                    properties: {
                        holderAddress: {
                            type: "string",
                            example: "0xAbC1234567890defABCdef1234567890ABCdef12",
                        },
                        credentialTemplateId: {
                            type: "string",
                            example: "64f1a2b3c4d5e6f7a8b9c0d1",
                        },
                        credentialSubject: {
                            type: "object",
                            additionalProperties: true,
                            example: { studentName: "Nguyễn Văn A", studentId: "20200001" },
                        },
                        expirateAt: {
                            type: "string",
                            format: "date-time",
                            example: "2030-12-31T00:00:00.000Z",
                            description: "Thời điểm hết hạn (tùy chọn)",
                        },
                    },
                },
                Credential: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        credentialId: { type: "string", example: "TDHABC-2024-001" },
                        issuerDid: { type: "string" },
                        holderDid: { type: "string" },
                        credentialTemplateId: { type: "string" },
                        status: {
                            type: "string",
                            enum: ["ACTIVE", "REVOKED", "EXPIRED"],
                        },
                        cid: { type: "string", description: "IPFS CID" },
                        credentialHash: { type: "string" },
                        txHash: { type: "string" },
                        issuedAt: { type: "string", format: "date-time" },
                        expiresAt: { type: "string", format: "date-time", nullable: true },
                        revokedAt: { type: "string", format: "date-time", nullable: true },
                    },
                },
                CredentialSummary: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        credentialId: { type: "string" },
                        templateId: { type: "string" },
                        issuerDid: { type: "string" },
                        issuedAt: { type: "string", format: "date-time" },
                        expiresAt: { type: "string" },
                        txHash: { type: "string" },
                        cid: { type: "string" },
                        status: { type: "string", enum: ["ACTIVE", "REVOKED", "EXPIRED"] },
                        title: { type: "string" },
                        description: { type: "string" },
                    },
                },
                CredentialIssuerView: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        credentialId: { type: "string" },
                        templateId: { type: "string" },
                        templateName: { type: "string" },
                        holderDid: { type: "string" },
                        issuedAt: { type: "string", format: "date-time" },
                        expiresAt: { type: "string" },
                        txHash: { type: "string" },
                        cid: { type: "string" },
                        status: { type: "string", enum: ["ACTIVE", "REVOKED", "EXPIRED"] },
                    },
                },

                // ─── AuditLog ────────────────────────────────────────
                AuditLog: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        actorDid: { type: "string" },
                        action: {
                            type: "string",
                            enum: [
                                "ISSUE", "REVOKE", "VERIFY", "REISSUE",
                                "REGISTER_DID", "TEMPLATE_CREATE", "TEMPLATE_UPDATE",
                                "TEMPLATE_DELETE", "USER_PROMOTE", "USER_DEMOTE",
                            ],
                        },
                        targetId: { type: "string" },
                        targetType: {
                            type: "string",
                            enum: ["CREDENTIAL", "DID", "TEMPLATE", "USER"],
                        },
                        metadata: { type: "object" },
                        timestamp: { type: "string", format: "date-time" },
                    },
                },
            },

            // ─── Shared Response References ──────────────────────────
            responses: {
                BadRequest: {
                    description: "Dữ liệu đầu vào không hợp lệ",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ErrorResponse" },
                            example: { errorCode: "SYS_002", message: "Validation error" },
                        },
                    },
                },
                Unauthorized: {
                    description: "Chưa xác thực hoặc token không hợp lệ",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ErrorResponse" },
                            example: { errorCode: "AUTH_004", message: "Token is invalid or expired" },
                        },
                    },
                },
                Forbidden: {
                    description: "Không có quyền truy cập",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ErrorResponse" },
                            example: { errorCode: "AUTH_006", message: "You do not have permission to perform this action" },
                        },
                    },
                },
                NotFound: {
                    description: "Tài nguyên không tìm thấy",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ErrorResponse" },
                            example: { errorCode: "USER_001", message: "User not found" },
                        },
                    },
                },
                TooManyRequests: {
                    description: "Quá nhiều yêu cầu – rate limit",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ErrorResponse" },
                            example: { errorCode: "SYS_001", message: "Too many requests, please try again later" },
                        },
                    },
                },
                InternalError: {
                    description: "Lỗi hệ thống nội bộ",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ErrorResponse" },
                            example: { errorCode: "SYS_001", message: "Internal server error" },
                        },
                    },
                },
            },
        },

        security: [{ bearerAuth: [] }],
    },

    apis: [
        "./src/modules/**/*.route.js",
    ],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };