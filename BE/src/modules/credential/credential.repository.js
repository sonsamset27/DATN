import Credential from "./credential.model.js";

const CredentialRepository = {
    issueCredential: async (credential) => {
        return await Credential.create(credential);
    },

    getCredentialByCredentialId: async (credentialId) => {
        return await Credential.findOne({ credentialId: credentialId });
    },

    getCredentialsByHolderDid: async (holderDid) => {
        return await Credential.find({ holderDid: holderDid });
    },

    getCredentialsByIssuerDid: async (issuerDid) => {
        return await Credential.find({ issuerDid: issuerDid });
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
     * Fix Bug 2 (N+1): thay vì gọi từng template một, gọi 1 lần duy nhất.
     * Trả về Map<templateId.toString(), templateDoc> để tra cứu O(1).
     */
    getCredentialsByTemplateIds: async (templateIds) => {
        return await Credential.find({ credentialTemplateId: { $in: templateIds } });
    },
};

export default CredentialRepository;