import { verifyAccessToken } from "../services/jwt.service.js";
import UserService from "../../modules/users/user.service.js";
import AppError from "../errors/AppError.js";
import ErrorCodes from "../errors/errorCodes.js";
import HttpStatus from "../errors/httpStatus.js";

const AuthMiddleware = {
    Authentication: async (req, res, next) => {
        try {
            const authHeader = req.headers?.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    errorCode: ErrorCodes.AUTH_004,
                    message: "Authorization header is missing or invalid",
                });
            }

            const token = authHeader.split(" ")[1];
            let payload;
            try {
                payload = verifyAccessToken(token);
            } catch {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    errorCode: ErrorCodes.AUTH_004,
                    message: "Token is invalid or expired",
                });
            }

            const user = await UserService.findUserById(payload.id);

            if (user.status !== "ACTIVE") {
                return res.status(HttpStatus.FORBIDDEN).json({
                    errorCode: ErrorCodes.AUTH_005,
                    message: "Account is disabled",
                });
            }

            req.user = user;
            next();
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.UNAUTHORIZED).json({
                errorCode: ErrorCodes.AUTH_004,
                message: "Authentication failed",
            });
        }
    },

    Authorization: (...allowedRoles) => {
        return (req, res, next) => {
            if (!allowedRoles.includes(req.user?.role)) {
                return res.status(HttpStatus.FORBIDDEN).json({
                    errorCode: ErrorCodes.AUTH_006,
                    message: "You do not have permission to perform this action",
                });
            }
            next();
        };
    },
};

export default AuthMiddleware;