import CredentialTemplateRepository from "./credentialTemplate.repository.js";
import AppError from "../../shared/errors/AppError.js";
import ErrorCodes from "../../shared/errors/errorCodes.js";
import DidService from "../dids/did.service.js";
import AuditLogService from "../auditLog/auditLog.service.js";

const CredentialTemplateService = {
    createCredentialTemplate: async (templateData, user) => {
        const issuerDid = await DidService.getDidByUserId(user);
        const newTemplate = await CredentialTemplateRepository.createCredentialTemplate({
            issuerId: user._id,
            name: templateData.name,
            description: templateData.description,
            fields: templateData.fields,
        });
        await AuditLogService.log(
            issuerDid.did,
            "TEMPLATE_CREATE",
            newTemplate.id,
            "TEMPLATE",
            { issuerDid: issuerDid.did, templateId: newTemplate.id, templateName: newTemplate.name }
        );
        return newTemplate;
    },

    getAllCredentialTemplates: async () => {
        const templates = await CredentialTemplateRepository.getAllCredentialTemplates();
        return templates || [];
    },

    getCredentialTemplateById: async (id) => {
        const template = await CredentialTemplateRepository.getCredentialTemplateById(id);
        if (!template) {
            throw AppError.notFound(ErrorCodes.TEMPLATE_001, "Credential template not found");
        }
        return template;
    },

    getCredentialTemplateByIssuerId: async (issuerId) => {
        const templates = await CredentialTemplateRepository.getCredentialTemplateByIssuerId(issuerId);
        return templates || [];
    },

    updateCredentialTemplate: async (id, templateData, user) => {
        const issuerDid = await DidService.getDidByUserId(user);
        const updatedTemplate = await CredentialTemplateRepository.updateCredentialTemplate(id, templateData);
        if (!updatedTemplate) {
            throw AppError.notFound(ErrorCodes.TEMPLATE_001, "Credential template not found");
        }
        await AuditLogService.log(
            issuerDid.did,
            "TEMPLATE_UPDATE",
            updatedTemplate.id,
            "TEMPLATE",
            { issuerDid: issuerDid.did, templateId: updatedTemplate.id, templateName: updatedTemplate.name }
        );
        return updatedTemplate;
    },

    deleteCredentialTemplate: async (id, user) => {
        const issuerDid = await DidService.getDidByUserId(user);
        const deletedTemplate = await CredentialTemplateRepository.deleteCredentialTemplate(id);
        if (!deletedTemplate) {
            throw AppError.notFound(ErrorCodes.TEMPLATE_001, "Credential template not found");
        }
        await AuditLogService.log(
            issuerDid.did,
            "TEMPLATE_DELETE",
            deletedTemplate.id,
            "TEMPLATE",
            { issuerDid: issuerDid.did, templateId: deletedTemplate.id, templateName: deletedTemplate.name }
        );
        return deletedTemplate;
    },
};

export default CredentialTemplateService;