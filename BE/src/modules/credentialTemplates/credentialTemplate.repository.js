import CredentialTemplate from "./credentialTemplate.model.js";

const CredentialTemplateRepository = {
    createCredentialTemplate: async (templateData) => {
        return await CredentialTemplate.create(templateData);
    },
    getAllCredentialTemplates: async () => {
        return await CredentialTemplate.find();
    },
    getCredentialTemplateById: async (id) => {
        return await CredentialTemplate.findById(id);
    },
    getCredentialTemplateByIssuerId: async (issuerId) => {
        return await CredentialTemplate.find({ issuerId });
    },
    updateCredentialTemplate: async (id, templateData) => {
        return await CredentialTemplate.findOneAndUpdate({ _id: id }, templateData, { returnDocument: "after" });
    },
    deleteCredentialTemplate: async (id) => {
        return await CredentialTemplate.findByIdAndDelete(id);
    }
}

export default CredentialTemplateRepository;
