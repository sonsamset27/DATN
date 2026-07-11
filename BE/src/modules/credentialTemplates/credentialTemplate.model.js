import mongoose from "mongoose";

const CredentialTemplateSchema = new mongoose.Schema({
    issuerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    fields: [
        {
            name: {
                type: String,
                required: true
            },
            label: {
                type: String,
                required: true
            },
            type: {
                type: String,
                enum: ["string", "number", "date", "boolean", "select"],
                default: "string"
            },
            options: [{
                type: String,
            }],
            required: {
                type: Boolean,
                default: false
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const CredentialTemplate = mongoose.model("CredentialTemplate", CredentialTemplateSchema);

export default CredentialTemplate;