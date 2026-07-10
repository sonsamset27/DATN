import { isValidWalletAddress, normalizeWalletAddress } from "../../shared/utils/wallet.util.js";

const AuthValidator = {
    generateChallenge: (req, res, next) => {
        const { walletAddress } = req.body;

        if (!walletAddress) {
            return res.status(400).json({
                message: "Wallet address is required"
            });
        }

        if (!isValidWalletAddress(walletAddress)) {
            return res.status(400).json({
                message: "Invalid wallet address"
            });
        }
        req.body.walletAddress = normalizeWalletAddress(walletAddress);
        next();
    },
    verifySignature: (req, res, next) => {
        const { walletAddress, signature } = req.body;
        if (!walletAddress) {
            return res.status(400).json({
                message: "Wallet address is required"
            });
        }
        if (!isValidWalletAddress(walletAddress)) {
            return res.status(400).json({
                message: "Invalid wallet address"
            });
        }
        if (!signature) {
            return res.status(400).json({
                message: "Signature is required"
            });
        }
        req.body.walletAddress = normalizeWalletAddress(walletAddress);
        next();
    }
};

export default AuthValidator;