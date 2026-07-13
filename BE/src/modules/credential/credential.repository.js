import Credential from "./credential.model.js";
const CredentialRepository = {
    issueCredential: async (credential) => {
        return await Credential.create(credential);
    }
}

export default CredentialRepository;