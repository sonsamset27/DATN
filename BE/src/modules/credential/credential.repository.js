import Credential from "./credential.model.js";

const CredentialRepository = {
    issueCredential: async (credential) => {
        return await Credential.create(credential);
    },

    getCredentialByCredentialId: async (credentialId) => {
        return await Credential.findOne({ credentialId: credentialId });
    },

    getCredentialsByHolderDid: async (holderDid, filter = {}, page = 1, limit = 20) => {
        const query = { holderDid, ...filter };
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            Credential.find(query).skip(skip).limit(limit).lean(),
            Credential.countDocuments(query)
        ]);
        return { data, total, page, limit };
    },

    getCredentialsByIssuerDid: async (issuerDid, filter = {}, page = 1, limit = 20) => {
        const query = { issuerDid, ...filter };
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            Credential.find(query).skip(skip).limit(limit).lean(),
            Credential.countDocuments(query)
        ]);
        return { data, total, page, limit };
    },
    updateCredentialStatus: async (credentialId, status) => {
        return await Credential.findOneAndUpdate(
            { credentialId: credentialId },
            { status: status },
            { returnDocument: "after" }
        );
    },

    updateCredential: async (credentialId, updateData) => {
        return await Credential.findOneAndUpdate(
            { credentialId: credentialId },
            { $set: updateData },
            { returnDocument: "after" }
        );
    },

    /**
     * Batch query nhiều templates theo danh sách templateIds.
     * Fix (N+1): thay vì gọi từng template một, gọi 1 lần duy nhất.
     * Trả về Map<templateId.toString(), templateDoc> để tra cứu O(1).
     */
    getCredentialsByTemplateIds: async (templateIds) => {
        return await Credential.find({ credentialTemplateId: { $in: templateIds } });
    },
};

export default CredentialRepository;