import { Router } from "express";
import DidController from "./did.controller.js";
import AuthMiddleware from "../../shared/middlewares/auth.middleware.js";
import AuthLimitMiddleware from "../../shared/middlewares/authLimit.middleware.js";

const DidRoute = Router();

DidRoute.post("/prepare", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, DidController.prepareCreateDid);

export default DidRoute;