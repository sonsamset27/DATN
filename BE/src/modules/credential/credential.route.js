import { Router } from "express";
import CredentialController from "./credential.controller.js";
import AuthMiddleware from "../../shared/middlewares/auth.middleware.js";
import CredentialValidator from "./credential.validator.js";


const CredentialRoute = Router();

CredentialRoute.post("/issue", AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER"), CredentialValidator.issueCredential, CredentialController.issueCredential);
CredentialRoute.post("/verify", AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER", "HOLDER"), CredentialValidator.verifyCredential, CredentialController.verifyCredential);
CredentialRoute.get("/owner", AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER", "HOLDER"), CredentialController.getOwnCredentials);
export default CredentialRoute;