import { Router } from "express";
import CredentialController from "./credential.controller.js";
import AuthMiddleware from "../../shared/middlewares/auth.middleware.js";


const CredentialRoute = Router();

CredentialRoute.post("/issue", AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER"), CredentialController.issueCredential);

export default CredentialRoute;