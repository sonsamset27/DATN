import { Router } from "express";
import UserController from "./user.controller.js";
import AuthMiddleware from "../../shared/middlewares/auth.middleware.js";
import UserValidator from "./user.validator.js";
import AuthLimitMiddleware from "../../shared/middlewares/authLimit.middleware.js";

const UserRoute = Router();

UserRoute.get("/", AuthLimitMiddleware.readLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN"), UserController.findAllUsers);
UserRoute.get("/me", AuthLimitMiddleware.readLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER", "HOLDER"), UserController.getMe);
UserRoute.patch("/me/name", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER", "HOLDER"), UserValidator.updateUserName, UserController.updateUserName);
UserRoute.get("/:id", AuthLimitMiddleware.readLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN"), UserController.findUserById);
UserRoute.patch("/:id/role", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN"), UserValidator.updateUserRole, UserController.updateUserRole);
UserRoute.patch("/:id/status", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN"), UserValidator.updateUserStatus, UserController.updateUserStatus);
UserRoute.patch("/:id/promote-issuer", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN"), UserValidator.promoteToIssuer, UserController.promoteToIssuer);

export default UserRoute;
