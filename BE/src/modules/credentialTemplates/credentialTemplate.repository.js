import CredentialTemplate from "./credentialTemplate.model.js";

const CredentialTemplateRepository = {
    createCredentialTemplate: async (templateData) => {
        return await CredentialTemplate.create(templateData);
    },
    getAllCredentialTemplates: async (filter = {}, page = 1, limit = 20) => {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            CredentialTemplate.find(filter).skip(skip).limit(limit).lean(),
            CredentialTemplate.countDocuments(filter)
        ]);
        return { data, total, page, limit };
    },
    getCredentialTemplateById: async (id) => {
        return await CredentialTemplate.findById(id);
    },
    getCredentialTemplateByIssuerId: async (issuerId, filter = {}, page = 1, limit = 20) => {
        const query = { issuerId, ...filter };
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            CredentialTemplate.find(query).skip(skip).limit(limit).lean(),
            CredentialTemplate.countDocuments(query)
        ]);
        return { data, total, page, limit };
    },
    updateCredentialTemplate: async (id, templateData) => {
        return await CredentialTemplate.findOneAndUpdate({ _id: id }, templateData, { returnDocument: "after" });
    },
    deleteCredentialTemplate: async (id) => {
        return await CredentialTemplate.findByIdAndDelete(id);
    }
}

export default CredentialTemplateRepository;
