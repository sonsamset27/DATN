import rateLimit from "express-rate-limit";
import ErrorCodes from "../errors/errorCodes.js";
import HttpStatus from "../errors/httpStatus.js";
import AppError from "../errors/AppError.js";

const AuthLimitMiddleware = {
    authLimiter: rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res, next) => {
            const error = new AppError(
                HttpStatus.TOO_MANY_REQUESTS,
                ErrorCodes.SYS_003,
                "Too many requests from this IP, please try again after 15 minutes"
            );
            return next(error);
        }
    }),
    readLimiter: rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res, next) => {
            const error = new AppError(
                HttpStatus.TOO_MANY_REQUESTS,
                ErrorCodes.SYS_003,
                "Too many requests from this IP, please try again after 15 minutes"
            );
            return next(error);
        }
    }),
    uploadLimiter: rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 20,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res, next) => {
            const error = new AppError(
                HttpStatus.TOO_MANY_REQUESTS,
                ErrorCodes.SYS_003,
                "Too many requests from this IP, please try again after 15 minutes"
            );
            return next(error);
        }
    })
}

export default AuthLimitMiddleware