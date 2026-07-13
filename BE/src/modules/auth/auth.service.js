import generateNonce from "../../shared/utils/generateNonce.js";
import ChallengeRepository from "./challenge.repository.js";
import { verifyMessage } from "ethers";
import { compareWalletAddress } from "../../shared/utils/wallet.util.js";
import { generateAccessToken } from "../../shared/services/jwt.service.js";
import UserService from "../users/user.service.js";

const AuthService = {
    generateChallenge: async (walletAddress) => {
        try {
            await ChallengeRepository.deleteChallengeByWallet(walletAddress);
            const nonce = generateNonce();
            const newChallenge = await ChallengeRepository.createChallenge(walletAddress, nonce);
            const message = {
                action: "SIGN_IN",
                wallet: walletAddress,
                message: "Welcome to Digital Credential Network! To authenticate and secure your account, please sign this message.",
                nonce: nonce,
                expiriedAt: newChallenge.expiresAt
            };
            return message;
        } catch (error) {
            throw error;
        }
    },
    verifySignature: async (walletAddress, signature) => {
        try {
            const challenge = await ChallengeRepository.findChallengeByWallet(walletAddress);
            if (!challenge) {
                throw new Error("Challenge not found");
            }
            const signer = await verifyMessage(challenge.nonce, signature);
            if (!signer) {
                throw new Error("Invalid signature");
            }
            if (!compareWalletAddress(signer, walletAddress)) {
                throw new Error("Wallet address does not match");
            }
            let user;

            try {
                user = await UserService.findByWalletAddress(walletAddress);
            } catch (err) {
                user = null;
            }
            if (!user) {
                user = await UserService.createUser(walletAddress);
            }
            const token = generateAccessToken({
                id: user._id,
                walletAddress,
                role: user.role,
                status: user.status
            });
            await ChallengeRepository.deleteChallengeByWallet(walletAddress);
            return {
                accessToken: token, user: {
                    id: user._id,
                    walletAddress,
                    role: user.role,
                    status: user.status
                }
            };
        } catch (error) {
            throw error;
        }
    }
}

export default AuthService;
