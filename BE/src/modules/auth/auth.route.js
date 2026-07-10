import { Router } from "express";
import AuthController from "./auth.controller.js";
import AuthValidator from "./auth.validator.js";
import AuthLimitMiddleware from "../../shared/middlewares/authLimit.middleware.js";

const AuthRouter = Router();

AuthRouter.post("/challenge", AuthLimitMiddleware.authLimiter, AuthValidator.generateChallenge, AuthController.generateChallenge);
AuthRouter.post("/login", AuthLimitMiddleware.authLimiter, AuthValidator.verifySignature, AuthController.verifySignature);

export default AuthRouter;