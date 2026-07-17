import { isValidWalletAddress, normalizeWalletAddress } from "../../shared/utils/wallet.util.js";
const CredentialValidator = {
    issueCredential(req, res, next) {
        const data = req.body;
        if (!data) {
            return res.status(400).json({ message: "Request body is required" });
        }
        const { holderAddress, credentialTemplateId, credentialSubject, expiresAt } = data;
        if (!holderAddress) {
            return res.status(400).json({ message: "Holder address is required" });
        }
        if (!isValidWalletAddress(holderAddress)) {
            return res.status(400).json({ message: "Invalid holder address" });
        }
        if (!credentialTemplateId || typeof credentialTemplateId !== "string") {
            return res.status(400).json({ message: "Credential template id is required" });
        }
        if (!credentialSubject || typeof credentialSubject !== "object" || Array.isArray(credentialSubject)) {
            return res.status(400).json({ message: "Credential subject is required" });
        }
        if (expiresAt) {
            if (Number.isNaN(Date.parse(expiresAt))) {
                return res.status(400).json({ message: "Invalid expiresAt" });
            }
            if (Date.parse(expiresAt) < Date.now()) {
                return res.status(400).json({ message: "ExpiresAt must be in the future" });
            }
        }
        req.body.holderAddress = normalizeWalletAddress(holderAddress);
        next();
    },
    validateCredentialSubject(fields, credentialSubject) {

        if (!Array.isArray(fields)) {
            throw new Error("Invalid template");
        }
        for (const field of fields) {
            const value = credentialSubject[field.name];
            if (field.required && (value === undefined || value === null || value === "")) {
                throw new Error(`${field.label} is required`);
            }
            if (value === undefined || value === null) {
                continue;
            }
            if (field.type === "string") {
                if (typeof value !== "string") {
                    throw new Error(`${field.label} must be string`);
                }
                continue;
            }
            if (field.type === "number") {
                if (typeof value !== "number") {
                    throw new Error(`${field.label} must be number`);
                }
                continue;
            }
            if (field.type === "boolean") {
                if (typeof value !== "boolean") {
                    throw new Error(`${field.label} must be boolean`);
                }
                continue;
            }
            if (field.type === "date") {
                if (Number.isNaN(Date.parse(value))) {
                    throw new Error(`${field.label} must be valid date`);
                }
                continue;
            }
            if (field.type === "select") {
                if (!field.options.includes(value)) {
                    throw new Error(`${field.label} is invalid`);
                }
                continue;
            }
        }

        for (const key of Object.keys(credentialSubject)) {
            const exists = fields.some(
                field => field.name === key
            );
            if (!exists) {
                throw new Error(
                    `Unexpected field '${key}'`
                );
            }
        }
        return true;
    },
    verifyCredential(req, res, next) {
        const data = req.body;
        if (!data) {
            return res.status(400).json({ message: "Request body is required" });
        }
        const { credentialId } = data;
        if (!credentialId) {
            return res.status(400).json({ message: "Credential id is required" });
        }
        if (typeof credentialId !== "string") {
            return res.status(400).json({ message: "Credential id must be string" });
        }
        next();
    },
    reissueAllCredentials(req, res, next) {
        const { oldWalletAddress, newWalletAddress } = req.body;
        if (!oldWalletAddress || !newWalletAddress) {
            return res.status(400).json({ message: "Request body is required" });
        }
        if (!isValidWalletAddress(oldWalletAddress) || !isValidWalletAddress(newWalletAddress)) {
            return res.status(400).json({ message: "Invalid wallet address" });
        }
        req.body.oldWalletAddress = normalizeWalletAddress(oldWalletAddress);
        req.body.newWalletAddress = normalizeWalletAddress(newWalletAddress);
        next();
    }
};

export default CredentialValidator;