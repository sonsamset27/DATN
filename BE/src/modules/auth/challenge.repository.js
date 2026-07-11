import Challenge from "./challenge.model.js";

const ChallengeRepository = {
    createChallenge: async (walletAddress, nonce) => {
        return await Challenge.create({ walletAddress, nonce });
    },
    findChallengeByWallet: async (walletAddress) => {
        return await Challenge.findOne({ walletAddress });
    },
    deleteChallengeByWallet: async (walletAddress) => {
        return await Challenge.deleteOne({ walletAddress });
    }
}

export default ChallengeRepository