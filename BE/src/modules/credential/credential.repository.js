import Credential from "./credential.model.js";
const CredentialRepository = {
    issueCredential: async (credential) => {
        return await Credential.create(credential);
    },
    getCredentialByCredentialId: async (credentialId) => {
        return await Credential.findOne({ credentialId: credentialId });
    },
    getCredentialsByHolderAddress: async (holderAddress) => {
        return await Credential.find({ holderAddress: holderAddress });
    }
}

export default CredentialRepository;