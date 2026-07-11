import { Router } from "express";
import CredentialTemplateController from "./credentialTemplate.controller.js";
import AuthMiddleware from "../../shared/middlewares/auth.middleware.js";
import AuthLimitMiddleware from "../../shared/middlewares/authLimit.middleware.js";
import CredentialTemplateValidator from "./credentialTemplate.validator.js";

const CredentialTemplateRoute = Router();

// CredentialTemplateRoute.post("/", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER"), CredentialTemplateValidator.createCredentialTemplate, CredentialTemplateController.createCredentialTemplate);
// CredentialTemplateRoute.get("/", AuthLimitMiddleware.readLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN"), CredentialTemplateController.getAllCredentialTemplates);
// CredentialTemplateRoute.get("/:id", AuthLimitMiddleware.readLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER"), CredentialTemplateController.getCredentialTemplateById);
// CredentialTemplateRoute.get("/issuer/:issuerId", AuthLimitMiddleware.readLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER"), CredentialTemplateController.getCredentialTemplateByIssuerId);
// CredentialTemplateRoute.put("/:id", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER"), CredentialTemplateValidator.updateCredentialTemplate, CredentialTemplateController.updateCredentialTemplate);
// CredentialTemplateRoute.delete("/:id", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, AuthMiddleware.Authorization("ADMIN", "ISSUER"), CredentialTemplateController.deleteCredentialTemplate);
CredentialTemplateRoute.post("/create", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, CredentialTemplateValidator.createCredentialTemplate, CredentialTemplateController.createCredentialTemplate);
CredentialTemplateRoute.get("/", AuthLimitMiddleware.readLimiter, AuthMiddleware.Authentication, CredentialTemplateController.getAllCredentialTemplates);
CredentialTemplateRoute.get("/:id", AuthLimitMiddleware.readLimiter, AuthMiddleware.Authentication, CredentialTemplateController.getCredentialTemplateById);
CredentialTemplateRoute.get("/issuer/:issuerId", AuthLimitMiddleware.readLimiter, AuthMiddleware.Authentication, CredentialTemplateController.getCredentialTemplateByIssuerId);
CredentialTemplateRoute.put("/update/:id", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, CredentialTemplateValidator.updateCredentialTemplate, CredentialTemplateController.updateCredentialTemplate);
CredentialTemplateRoute.delete("/delete/:id", AuthLimitMiddleware.uploadLimiter, AuthMiddleware.Authentication, CredentialTemplateController.deleteCredentialTemplate);
export default CredentialTemplateRoute;