import Challenge from "./challenge.model.js";

const ChallengeRepository = {
    createChallenge: async (walletAddress, nonce) => {
        try {
            const challenge = new Challenge({ walletAddress, nonce })
            await challenge.save()
            return challenge
        } catch (error) {
            throw error;
        }
    },
    findChallengeByWallet: async (walletAddress) => {
        try {
            const challenge = await Challenge.findOne({ walletAddress })
            return challenge
        } catch (error) {
            throw error;
        }
    },
    deleteChallengeByWallet: async (walletAddress) => {
        try {
            await Challenge.deleteOne({ walletAddress })
        } catch (error) {
            throw error;
        }
    }
}

export default ChallengeRepository