import mongoose from "mongoose";

/**
 * AuditLog – ghi lại mọi hành động quan trọng trong hệ thống.
 * Dùng để truy vết (audit trail) theo chuẩn SSI / bảo mật.
 */
const AuditLogSchema = new mongoose.Schema(
    {
        actorDid: {
            type: String,
            required: true,
            index: true,
        },
        action: {
            type: String,
            required: true,
            enum: [
                "ISSUE",           // Cấp chứng chỉ mới
                "REVOKE",          // Thu hồi chứng chỉ
                "VERIFY",          // Xác minh chứng chỉ
                "REISSUE",         // Cấp lại chứng chỉ sang ví mới
                "REGISTER_DID",    // Đăng ký DID
                "TEMPLATE_CREATE", // Tạo mẫu chứng chỉ
                "TEMPLATE_UPDATE", // Cập nhật mẫu chứng chỉ
                "TEMPLATE_DELETE", // Xóa mẫu chứng chỉ
                "USER_PROMOTE",    // Nâng quyền thành Issuer
                "USER_DEMOTE",     // Hạ quyền / vô hiệu Issuer
            ],
        },
        targetId: {
            type: String,
            required: true,
            index: true,
        },
        targetType: {
            type: String,
            required: true,
            enum: ["CREDENTIAL", "DID", "TEMPLATE", "USER"],
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        timestamp: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        versionKey: false,
        timestamps: false,
    }
);

// Index compound để query nhanh theo actor + thời gian
AuditLogSchema.index({ actorDid: 1, timestamp: -1 });
AuditLogSchema.index({ targetId: 1, timestamp: -1 });

const AuditLog = mongoose.model("AuditLog", AuditLogSchema);

export default AuditLog;
