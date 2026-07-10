import mongoose from "mongoose";

const DidSchema = new mongoose.Schema({
    did: {
        type: String,
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    publicKey: {
        type: String,
        required: true
    },
    keyAlgorithm: {
        type: String,
        enum: ["ECC", "DILITHIUM"],
        default: "ECC"
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

const DidModel = mongoose.model("Did", DidSchema);

export default DidModel;