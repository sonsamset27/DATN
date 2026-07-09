import { verifyAccessToken } from "../services/jwt.service.js";
import UserRepository from "../../modules/users/user.repository.js";

const AuthMiddleware = {
    Authentication: async (req, res, next) => {
        try {
            const authHeader = req.headers?.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({
                    message: "Unauthorized"
                });
            }
            const token = authHeader.split(" ")[1];
            const payload = verifyAccessToken(token);
            const user = await UserRepository.findUserById(payload.id);

            if (!user) {
                return res.status(404).json({
                    message: "Not found"
                });
            }

            if (user.status !== "ACTIVE") {
                return res.status(403).json({
                    message: "Forbidden"
                });
            }
            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
    },
    Authorization: (...allowedRoles) => {
        return (req, res, next) => {
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    message: "Forbidden"
                });
            }

            next();
        };
    }
}

export default AuthMiddleware