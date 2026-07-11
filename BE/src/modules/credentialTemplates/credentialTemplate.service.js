import CredentialTemplateRepository from "./credentialTemplate.repository.js";

const CredentialTemplateService = {
    createCredentialTemplate: async (templateData, user) => {
        try {
            const newTemplate = {
                issuerId: user._id,
                name: templateData.name,
                description: templateData.description,
                fields: templateData.fields
            };
            const result = await CredentialTemplateRepository.createCredentialTemplate(newTemplate);
            return result;
        } catch (error) {
            throw error;
        }
    },
    getAllCredentialTemplates: async () => {
        try {
            const templates = await CredentialTemplateRepository.getAllCredentialTemplates();
            if (!templates) {
                throw new Error("No templates found");
            }
            return templates;
        } catch (error) {
            throw error;
        }
    },
    getCredentialTemplateById: async (id) => {
        try {
            const template = await CredentialTemplateRepository.getCredentialTemplateById(id);
            if (!template) {
                throw new Error("Template not found");
            }
            return template;
        } catch (error) {
            throw error;
        }
    },
    getCredentialTemplateByIssuerId: async (issuerId) => {
        try {
            const templates = await CredentialTemplateRepository.getCredentialTemplateByIssuerId(issuerId);
            if (!templates) {
                throw new Error("No templates found");
            }
            return templates;
        } catch (error) {
            throw error;
        }
    },
    updateCredentialTemplate: async (id, templateData) => {
        try {
            const updatedTemplate = await CredentialTemplateRepository.updateCredentialTemplate(id, templateData);
            if (!updatedTemplate) {
                throw new Error("Template not found");
            }
            return updatedTemplate;
        } catch (error) {
            throw error;
        }
    },
    deleteCredentialTemplate: async (id) => {
        try {
            const deletedTemplate = await CredentialTemplateRepository.deleteCredentialTemplate(id);
            if (!deletedTemplate) {
                throw new Error("Template not found");
            }
            return deletedTemplate;
        } catch (error) {
            throw error;
        }
    }
}

export default CredentialTemplateService;