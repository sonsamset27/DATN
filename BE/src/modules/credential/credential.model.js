import mongoose from "mongoose";

const CredentialSchema = new mongoose.Schema({
    credentialId: {
        type: String,
        required: true
    },
    issuerDid: {
        type: String,
        required: true
    },
    holderDid: {
        type: String,
        required: true
    },
    credentialTemplateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CredentialTemplate",
        required: true
    },
    status: {
        type: String,
        enum: ["ACTIVE", "REVOKED", "EXPIRED"],
        default: "ACTIVE"
    },
    cid: {
        type: String,
        required: true
    },
    credentialHash: {
        type: String,
        required: true
    },
    signatureAlgorithm: {
        type: String,
        enum: ["ECC", "Dilithium3"],
        default: "ECC"
    },
    txHash: {
        type: String,
        required: true
    },
    issuedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: null
    },
    revokedAt: {
        type: Date,
        default: null
    }
})
const Credential = mongoose.model("Credential", CredentialSchema)
export default Credential