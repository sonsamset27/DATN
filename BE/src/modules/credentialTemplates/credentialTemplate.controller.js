import CredentialTemplateService from "./credentialTemplate.service.js";

const CredentialTemplateController = {
    createCredentialTemplate: async (req, res) => {
        try {
            const newTemplate = await CredentialTemplateService.createCredentialTemplate(req.body, req.user);
            return res.status(201).json({
                message: "Template created successfully",
                data: newTemplate
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to create credential template",
                error: error.message
            });
        }
    },
    getAllCredentialTemplates: async (req, res) => {
        try {
            const templates = await CredentialTemplateService.getAllCredentialTemplates();
            return res.status(200).json({
                message: "Credential templates fetched successfully",
                data: templates
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to fetch credential templates",
                error: error.message
            });
        }
    },
    getCredentialTemplateById: async (req, res) => {
        try {
            const template = await CredentialTemplateService.getCredentialTemplateById(req.params.id);
            return res.status(200).json({
                message: "Credential template fetched successfully",
                data: template
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to fetch credential template",
                error: error.message
            });
        }
    },
    getCredentialTemplateByIssuerId: async (req, res) => {
        try {
            const templates = await CredentialTemplateService.getCredentialTemplateByIssuerId(req.params.issuerId);
            return res.status(200).json({
                message: "Credential templates fetched successfully",
                data: templates
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to fetch credential templates",
                error: error.message
            });
        }
    },
    updateCredentialTemplate: async (req, res) => {
        try {
            const updatedTemplate = await CredentialTemplateService.updateCredentialTemplate(req.params.id, req.body);
            return res.status(200).json({
                message: "Credential template updated successfully",
                data: updatedTemplate
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to update credential template",
                error: error.message
            });
        }
    },
    deleteCredentialTemplate: async (req, res) => {
        try {
            const deletedTemplate = await CredentialTemplateService.deleteCredentialTemplate(req.params.id);
            return res.status(200).json({
                message: "Credential template deleted successfully",
                data: deletedTemplate
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to delete credential template",
                error: error.message
            });
        }
    }
}

export default CredentialTemplateController;