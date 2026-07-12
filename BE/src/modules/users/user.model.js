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
        default: ""
    },
    organizationName: {
        type: String,
        default: ""
    },
    organizationCode: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})
const User = mongoose.model("User", UserSchema)
export default User