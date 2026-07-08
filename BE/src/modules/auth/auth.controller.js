import AuthService from "./auth.service.js"
const AuthController = {
    generateChallenge: async (req, res) => {
        try {
            const { walletAddress } = req.body;
            const message = await AuthService.generateChallenge(walletAddress);
            res.status(200).json(message);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    verifySignature: async (req, res) => {
        try {
            const { walletAddress, signature } = req.body;
            const result = await AuthService.verifySignature(walletAddress, signature);
            res.status(200).json({
                message: "Verify signature successfully",
                accessToken: result.accessToken,
                user: result.user
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default AuthController;
