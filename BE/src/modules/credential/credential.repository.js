const CredentialRepository = {
    issueCredential: async (credential) => {
        return await Credential.create(credential);
    }
}

export default CredentialRepository;