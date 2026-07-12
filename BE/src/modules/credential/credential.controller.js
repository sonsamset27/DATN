import CredentialService from "./credential.service.js";

const CredentialController = {
    issueCredential: async (req, res) => {
        try {
            const newCredential = await CredentialService.issueCredential(req.body, req.user);
            return res.status(201).json({
                message: "Credential issued successfully",
                data: newCredential
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to issue credential",
                error: error.message
            });
        }
    },
}

export default CredentialController;