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
        return await Credential.findOneAndUpdate({ credentialId: credentialId }, { status: status }, { returnDocument: "after" });
    }
}

export default CredentialRepository;