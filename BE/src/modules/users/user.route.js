import { Router } from "express";
import UserController from "./user.controller.js";
import AuthMiddleware from "../../shared/middlewares/auth.middleware.js";
import UserValidator from "./user.validator.js";

const UserRoute = Router();

UserRoute.get("/", AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN"), UserController.findAllUsers);
UserRoute.get("/me", AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER", "HOLDER"), UserController.getMe);
UserRoute.patch("/me/name", AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER", "HOLDER"), UserValidator.updateUserName, UserController.updateUserName);
UserRoute.get("/:id", AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN"), UserController.findUserById);
UserRoute.patch("/:id/role", AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN"), UserValidator.updateUserRole, UserController.updateUserRole);
UserRoute.patch("/:id/status", AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN"), UserValidator.updateUserStatus, UserController.updateUserStatus);


export default UserRoute;
