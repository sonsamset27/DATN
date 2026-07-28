import CredentialTemplate from "./credentialTemplate.model.js";
import DidModel from "../dids/did.model.js";

const CredentialTemplateRepository = {
    createCredentialTemplate: async (templateData) => {
        return await CredentialTemplate.create(templateData);
    },
    
    getAllCredentialTemplates: async (filter = {}, page = 1, limit = 20) => {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            CredentialTemplate.find(filter)
                .populate({ path: 'issuerId', select: 'userName organizationName organizationCode walletAddress role' })
                .skip(skip)
                .limit(limit)
                .lean(),
            CredentialTemplate.countDocuments(filter)
        ]);

        if (data.length > 0) {
            const userIds = data.map(d => d.issuerId?._id).filter(id => id);
            const dids = await DidModel.find({ ownerId: { $in: userIds } }).lean();
            const didMap = {};
            dids.forEach(d => { didMap[d.ownerId.toString()] = d.did; });
            
            data.forEach(d => {
                if (d.issuerId) {
                    d.issuerId.did = didMap[d.issuerId._id.toString()];
                }
            });
        }

        return { data, total, page, limit };
    },

    getCredentialTemplateById: async (id) => {
        const template = await CredentialTemplate.findById(id)
            .populate({ path: 'issuerId', select: 'userName organizationName organizationCode walletAddress role' })
            .lean();
            
        if (template && template.issuerId) {
            const didDoc = await DidModel.findOne({ ownerId: template.issuerId._id }).lean();
            if (didDoc) {
                template.issuerId.did = didDoc.did;
            }
        }
        return template;
    },

    getCredentialTemplateByIssuerId: async (issuerId, filter = {}, page = 1, limit = 20) => {
        const query = { issuerId, ...filter };
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            CredentialTemplate.find(query)
                .populate({ path: 'issuerId', select: 'userName organizationName organizationCode walletAddress role' })
                .skip(skip)
                .limit(limit)
                .lean(),
            CredentialTemplate.countDocuments(query)
        ]);

        if (data.length > 0) {
            const didDoc = await DidModel.findOne({ ownerId: issuerId }).lean();
            if (didDoc) {
                data.forEach(d => {
                    if (d.issuerId) {
                        d.issuerId.did = didDoc.did;
                    }
                });
            }
        }

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
