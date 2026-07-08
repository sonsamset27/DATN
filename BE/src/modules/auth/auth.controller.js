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
    }
}

export default AuthController;
