import generateNonce from "../../shared/utils/generateNonce.js";
import ChallengeRepository from "./challenge.repository.js";


const AuthService = {
    generateChallenge: async (walletAddress) => {
        try {
            await ChallengeRepository.deleteChallengeByWallet(walletAddress);
            const nonce = generateNonce();
            await ChallengeRepository.createChallenge(walletAddress, nonce);
            const message = {
                action: "SIGN_IN",
                wallet: walletAddress,
                message: "Welcome to DVP Digital Credential Network! To authenticate and secure your account, please sign this message.",
                nonce: nonce,
            };
            return message;
        } catch (error) {
            throw error;
        }
    }
}

export default AuthService;
