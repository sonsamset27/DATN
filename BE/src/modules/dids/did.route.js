import { Router } from "express";
import DidController from "./did.controller.js";
import AuthMiddleware from "../../shared/middlewares/auth.middleware.js";
import AuthLimitMiddleware from "../../shared/middlewares/authLimit.middleware.js";

const DidRoute = Router();

DidRoute.post("/prepare", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, DidController.prepareCreateDid);
DidRoute.post("/register", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, DidController.registerDid);
DidRoute.get("/me", AuthLimitMiddleware.readLimiter, AuthMiddleware.Authentication, DidController.getDidByUserId);
DidRoute.post("/address", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER"), DidController.getDidByAddress);

export default DidRoute;