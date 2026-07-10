import { isValidWalletAddress, normalizeWalletAddress } from "../../shared/utils/wallet.util.js";
const DidValidator = {
    getDidByAddress: (req, res, next) => {
        try {
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
        } catch (error) {
            return res.status(500).json({
                message: "Internal server error"
            });
        }
    }
}

export default DidValidator;