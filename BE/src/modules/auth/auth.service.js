import generateNonce from "../../shared/utils/generateNonce.js";
import ChallengeRepository from "./challenge.repository.js";
import { verifyMessage } from "ethers";
import { compareWalletAddress } from "../../shared/utils/wallet.util.js";
import { generateAccessToken } from "../../shared/services/jwt.service.js";
import UserService from "../users/user.service.js";
import AppError from "../../shared/errors/AppError.js";
import ErrorCodes from "../../shared/errors/errorCodes.js";

const AuthService = {
    generateChallenge: async (walletAddress) => {
        await ChallengeRepository.deleteChallengeByWallet(walletAddress);
        const nonce = generateNonce();
        const newChallenge = await ChallengeRepository.createChallenge(walletAddress, nonce);
        return {
            action: "SIGN_IN",
            wallet: walletAddress,
            message: "Welcome to Digital Credential Network! To authenticate and secure your account, please sign this message.",
            nonce,
            expiriedAt: newChallenge.expiresAt,
        };
    },

    verifySignature: async (walletAddress, signature) => {
        const challenge = await ChallengeRepository.findChallengeByWallet(walletAddress);
        if (!challenge) {
            throw AppError.unauthorized(ErrorCodes.AUTH_001, "Challenge not found or expired. Please request a new challenge.");
        }

        let signer;
        try {
            signer = await verifyMessage(challenge.nonce, signature);
        } catch {
            throw AppError.unauthorized(ErrorCodes.AUTH_002, "Invalid signature format");
        }

        if (!signer) {
            throw AppError.unauthorized(ErrorCodes.AUTH_002, "Invalid signature");
        }

        if (!compareWalletAddress(signer, walletAddress)) {
            throw AppError.unauthorized(ErrorCodes.AUTH_003, "Wallet address does not match the signature signer");
        }

        let user;
        try {
            user = await UserService.findByWalletAddress(walletAddress);
        } catch {
            user = null;
        }

        if (!user) {
            user = await UserService.createUser(walletAddress);
        }

        const token = generateAccessToken({
            id: user._id,
            walletAddress,
            role: user.role,
            status: user.status,
        });

        await ChallengeRepository.deleteChallengeByWallet(walletAddress);

        return {
            accessToken: token,
            user: {
                id: user._id,
                walletAddress,
                role: user.role,
                status: user.status,
            },
        };
    },
};

export default AuthService;
