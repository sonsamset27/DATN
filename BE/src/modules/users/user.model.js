import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        unique: true,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ["ADMIN", "ISSUER", "HOLDER"],
        default: "HOLDER"
    },
    status: {
        type: String,
        required: true,
        enum: ["ACTIVE", "DISABLE"],
        default: "ACTIVE"
    },
    userName: {
        type: String,
    },
    organizationName: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model("User", UserSchema)