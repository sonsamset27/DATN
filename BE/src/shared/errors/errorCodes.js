/**
 * Bảng mã lỗi nghiệp vụ theo domain.
 * Dùng trong AppError để giúp FE/reviewer nhận biết lỗi chính xác
 * mà không phụ thuộc vào message string.
 *
 * Format: <DOMAIN>_<3_DIGIT_CODE>
 *   AUTH_     : Lỗi xác thực / phân quyền
 *   USER_     : Lỗi liên quan người dùng
 *   DID_      : Lỗi liên quan định danh phi tập trung
 *   CREDENTIAL_ : Lỗi liên quan chứng chỉ
 *   TEMPLATE_ : Lỗi liên quan mẫu chứng chỉ
 *   AUDIT_    : Lỗi liên quan audit log
 *   SYS_      : Lỗi hệ thống / nội bộ
 */
const ErrorCodes = Object.freeze({
    // ─── AUTH ────────────────────────────────────────────────────────
    AUTH_001: "AUTH_001", // Challenge không tồn tại
    AUTH_002: "AUTH_002", // Chữ ký không hợp lệ
    AUTH_003: "AUTH_003", // Địa chỉ ví không khớp với signer
    AUTH_004: "AUTH_004", // Token không hợp lệ hoặc hết hạn
    AUTH_005: "AUTH_005", // Tài khoản bị vô hiệu hóa (DISABLE)
    AUTH_006: "AUTH_006", // Không có quyền truy cập (Forbidden)

    // ─── USER ────────────────────────────────────────────────────────
    USER_001: "USER_001", // Người dùng không tìm thấy
    USER_002: "USER_002", // Người dùng đã là Issuer
    USER_003: "USER_003", // Role không hợp lệ
    USER_004: "USER_004", // Trạng thái không hợp lệ

    // ─── DID ─────────────────────────────────────────────────────────
    DID_001: "DID_001",   // DID không tìm thấy trong DB
    DID_002: "DID_002",   // DID đã tồn tại
    DID_003: "DID_003",   // Owner không khớp
    DID_004: "DID_004",   // DID không tìm thấy trên blockchain

    // ─── CREDENTIAL ──────────────────────────────────────────────────
    CREDENTIAL_001: "CREDENTIAL_001", // Credential không tìm thấy
    CREDENTIAL_002: "CREDENTIAL_002", // Hash không khớp (tampered)
    CREDENTIAL_003: "CREDENTIAL_003", // Credential đã bị thu hồi
    CREDENTIAL_004: "CREDENTIAL_004", // Credential đã hết hạn
    CREDENTIAL_005: "CREDENTIAL_005", // Không có chứng chỉ nào để xử lý
    CREDENTIAL_006: "CREDENTIAL_006", // Lỗi khi đọc IPFS
    CREDENTIAL_007: "CREDENTIAL_007", // Lỗi khi ghi blockchain
    CREDENTIAL_008: "CREDENTIAL_008", // Lỗi rollback (cleanup thất bại)

    // ─── TEMPLATE ────────────────────────────────────────────────────
    TEMPLATE_001: "TEMPLATE_001", // Template không tìm thấy
    TEMPLATE_002: "TEMPLATE_002", // Fields không hợp lệ
    TEMPLATE_003: "TEMPLATE_003", // Template đang được sử dụng

    // ─── AUDIT LOG ───────────────────────────────────────────────────
    AUDIT_001: "AUDIT_001", // Không tìm thấy log

    // ─── SYSTEM ──────────────────────────────────────────────────────
    SYS_001: "SYS_001",   // Lỗi hệ thống không xác định
    SYS_002: "SYS_002",   // Dữ liệu không hợp lệ (validation chung)
    SYS_003: "SYS_003",   // Quá nhiều yêu cầu

});

export default ErrorCodes;
