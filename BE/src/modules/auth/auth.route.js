import { Router } from "express";
import AuthController from "./auth.controller.js";
import AuthValidator from "../../shared/validators/auth.validator.js";

const AuthRouter = Router();

AuthRouter.post("/challenge", AuthValidator.generateChallenge, AuthController.generateChallenge);
AuthRouter.post("/login", AuthValidator.verifySignature, AuthController.verifySignature);

export default AuthRouter;