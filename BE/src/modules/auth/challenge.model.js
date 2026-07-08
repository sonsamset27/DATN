import mongoose from "mongoose";
const ChallengeSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
        unique: true
    },
    nonce: {
        type: String,
        required: true,
    },
    used: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 5 * 60 * 1000),
        expires: 0
    }
})
const Challenge = mongoose.model("Challenge", ChallengeSchema)

export default Challenge