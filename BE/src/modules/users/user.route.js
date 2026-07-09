import { Router } from "express";
import UserController from "./user.controller.js";
import AuthMiddleware from "../../shared/middlewares/auth.middleware.js";

const UserRoute = Router();

UserRoute.get("/", AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN"), UserController.findAllUsers);
UserRoute.patch("/:id/name", AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER", "HOLDER"), UserController.updateUserName);

export default UserRoute;
