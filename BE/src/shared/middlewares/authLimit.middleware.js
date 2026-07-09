import rateLimit from "express-rate-limit";

const AuthLimitMiddleware = {
    authLimiter: rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            message: "Too many requests from this IP, please try again after 15 minutes"
        }
    }),
    readLimiter: rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            message: "Too many requests from this IP, please try again after 15 minutes"
        }
    }),
    uploadLimiter: rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 20,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            message: "Too many requests from this IP, please try again after 15 minutes"
        }
    })
}

export default AuthLimitMiddleware