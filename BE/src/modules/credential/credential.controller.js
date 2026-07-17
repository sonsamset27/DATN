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
    verifyCredential: async (req, res) => {
        try {
            const verifiedCredential = await CredentialService.verifyCredential(req.body.credentialId);
            return res.status(200).json({
                message: "Credential verified successfully",
                data: verifiedCredential
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to verify credential",
                error: error.message
            });
        }
    },
    getOwnCredentials: async (req, res) => {
        try {
            const credentials = await CredentialService.getOwnCredentials(req.user);
            return res.status(200).json({
                message: "Credentials fetched successfully",
                data: credentials
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to fetch credentials",
                error: error.message
            });
        }
    },
    getCredentialIssueByIssuer: async (req, res) => {
        try {
            const credentials = await CredentialService.getCredentialIssueByIssuer(req.user);
            return res.status(200).json({
                message: "Credentials fetched successfully",
                data: credentials
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to fetch credentials",
                error: error.message
            });
        }
    },
    getCredentialById: async (req, res) => {
        try {
            const credential = await CredentialService.getCredentialById(req.params.credentialId);
            return res.status(200).json({
                message: "Credential fetched successfully",
                data: credential
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to fetch credential",
                error: error.message
            });
        }
    },
    reissueAllCredentials: async (req, res) => {
        try {
            const { oldWalletAddress, newWalletAddress } = req.body;
            const result = await CredentialService.reissueAllCredentials(oldWalletAddress, newWalletAddress);
            return res.status(200).json({
                message: "All credentials re-issued successfully",
                data: result
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to re-issue all credentials",
                error: error.message
            });
        }
    }
}

export default CredentialController;