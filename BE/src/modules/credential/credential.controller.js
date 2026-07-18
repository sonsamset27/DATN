import CredentialService from "./credential.service.js";
import AppError from "../../shared/errors/AppError.js";
import HttpStatus from "../../shared/errors/httpStatus.js";

const CredentialController = {
    issueCredential: async (req, res) => {
        try {
            const newCredential = await CredentialService.issueCredential(req.body, req.user);
            return res.status(HttpStatus.CREATED).json({
                message: "Credential issued successfully",
                data: newCredential,
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorCode: "SYS_001",
                message: "Failed to issue credential",
                error: error.message,
            });
        }
    },

    verifyCredential: async (req, res) => {
        try {
            const verifiedCredential = await CredentialService.verifyCredential(req.body.credentialId);
            return res.status(HttpStatus.OK).json({
                message: "Credential verified successfully",
                data: verifiedCredential,
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorCode: "SYS_001",
                message: "Failed to verify credential",
                error: error.message,
            });
        }
    },

    getOwnCredentials: async (req, res) => {
        try {
            const credentials = await CredentialService.getOwnCredentials(req.user);
            return res.status(HttpStatus.OK).json({
                message: "Credentials fetched successfully",
                data: credentials,
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorCode: "SYS_001",
                message: "Failed to fetch credentials",
                error: error.message,
            });
        }
    },

    getCredentialIssueByIssuer: async (req, res) => {
        try {
            const credentials = await CredentialService.getCredentialIssueByIssuer(req.user);
            return res.status(HttpStatus.OK).json({
                message: "Credentials fetched successfully",
                data: credentials,
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorCode: "SYS_001",
                message: "Failed to fetch credentials",
                error: error.message,
            });
        }
    },

    getCredentialById: async (req, res) => {
        try {
            const credential = await CredentialService.getCredentialById(req.params.credentialId);
            return res.status(HttpStatus.OK).json({
                message: "Credential fetched successfully",
                data: credential,
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorCode: "SYS_001",
                message: "Failed to fetch credential",
                error: error.message,
            });
        }
    },

    reissueAllCredentials: async (req, res) => {
        try {
            const { oldWalletAddress, newWalletAddress } = req.body;
            const result = await CredentialService.reissueAllCredentials(
                oldWalletAddress,
                newWalletAddress,
                req.user
            );
            return res.status(HttpStatus.OK).json({
                message: "Credentials re-issued successfully",
                data: result,
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorCode: "SYS_001",
                message: "Failed to re-issue credentials",
                error: error.message,
            });
        }
    },
};

export default CredentialController;