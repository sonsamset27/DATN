import HttpStatus from "./httpStatus.js";
import ErrorCodes from "./errorCodes.js";

/**
 * AppError – lớp lỗi chuẩn của hệ thống.
 * Thay thế `new Error("string mô tả")` ở mọi nơi trong service/middleware.
 *
 * Mỗi lỗi gồm 3 thành phần:
 *   - statusCode : HTTP status trả về client (dùng HttpStatus enum)
 *   - errorCode  : Mã lỗi nghiệp vụ (dùng ErrorCodes enum, vd CREDENTIAL_001)
 *   - message    : Mô tả ngắn gọn bằng tiếng Anh (dùng trong log / response)
 *
 * Controller phân biệt lỗi AppError vs lỗi hệ thống:
 *   if (error instanceof AppError) → trả đúng statusCode + errorCode
 *   else                           → trả 500 + SYS_001
 */
class AppError extends Error {
    /**
     * @param {number} statusCode  - HTTP status code (dùng HttpStatus enum)
     * @param {string} errorCode   - Mã lỗi nghiệp vụ (dùng ErrorCodes enum)
     * @param {string} message     - Mô tả lỗi
     */
    constructor(statusCode, errorCode, message) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true; // phân biệt với lỗi hệ thống/programming error
    }

    // ─── Factory methods ─────────────────────────────────────────────

    static badRequest(errorCode, message) {
        return new AppError(HttpStatus.BAD_REQUEST, errorCode, message);
    }

    static unauthorized(errorCode, message) {
        return new AppError(HttpStatus.UNAUTHORIZED, errorCode, message);
    }

    static forbidden(errorCode, message) {
        return new AppError(HttpStatus.FORBIDDEN, errorCode, message);
    }

    static notFound(errorCode, message) {
        return new AppError(HttpStatus.NOT_FOUND, errorCode, message);
    }

    static conflict(errorCode, message) {
        return new AppError(HttpStatus.CONFLICT, errorCode, message);
    }

    static gone(errorCode, message) {
        return new AppError(HttpStatus.GONE, errorCode, message);
    }

    static unprocessable(errorCode, message) {
        return new AppError(HttpStatus.UNPROCESSABLE_ENTITY, errorCode, message);
    }

    static internal(errorCode, message) {
        return new AppError(HttpStatus.INTERNAL_SERVER_ERROR, errorCode, message);
    }
    static tooManyRequests(errorCode, message) {
        return new AppError(HttpStatus.TOO_MANY_REQUESTS, errorCode, message);
    }
}

export default AppError;
