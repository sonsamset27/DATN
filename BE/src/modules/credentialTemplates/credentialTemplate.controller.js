import CredentialTemplateService from "./credentialTemplate.service.js";
import AppError from "../../shared/errors/AppError.js";
import HttpStatus from "../../shared/errors/httpStatus.js";

const CredentialTemplateController = {
    createCredentialTemplate: async (req, res) => {
        try {
            const newTemplate = await CredentialTemplateService.createCredentialTemplate(req.body, req.user);
            return res.status(HttpStatus.CREATED).json({
                message: "Template created successfully",
                data: newTemplate,
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
                message: "Failed to create credential template",
            });
        }
    },

    getAllCredentialTemplates: async (req, res) => {
        try {
            const templates = await CredentialTemplateService.getAllCredentialTemplates();
            return res.status(HttpStatus.OK).json({
                message: "Credential templates fetched successfully",
                data: templates,
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
                message: "Failed to fetch credential templates",
            });
        }
    },

    getCredentialTemplateById: async (req, res) => {
        try {
            const template = await CredentialTemplateService.getCredentialTemplateById(req.params.id);
            return res.status(HttpStatus.OK).json({
                message: "Credential template fetched successfully",
                data: template,
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
                message: "Failed to fetch credential template",
            });
        }
    },

    getCredentialTemplateByIssuerId: async (req, res) => {
        try {
            const templates = await CredentialTemplateService.getCredentialTemplateByIssuerId(req.params.issuerId);
            return res.status(HttpStatus.OK).json({
                message: "Credential templates fetched successfully",
                data: templates,
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
                message: "Failed to fetch credential templates",
            });
        }
    },

    updateCredentialTemplate: async (req, res) => {
        try {
            const updatedTemplate = await CredentialTemplateService.updateCredentialTemplate(req.params.id, req.body, req.user);
            return res.status(HttpStatus.OK).json({
                message: "Credential template updated successfully",
                data: updatedTemplate,
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
                message: "Failed to update credential template",
            });
        }
    },

    deleteCredentialTemplate: async (req, res) => {
        try {
            await CredentialTemplateService.deleteCredentialTemplate(req.params.id, req.user);
            return res.status(HttpStatus.OK).json({
                message: "Credential template deleted successfully",
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
                message: "Failed to delete credential template",
            });
        }
    },
};

export default CredentialTemplateController;