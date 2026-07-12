const CredentialValidator = {
    issueCredentialValidator(data) {
        if (!data) {
            throw new Error("Request body is required");
        }
        if (!data.holderAddress || typeof data.holderAddress !== "string") {
            throw new Error("Holder address is required");
        }
        if (!data.credentialTemplateId || typeof data.credentialTemplateId !== "string") {
            throw new Error("Credential template id is required");
        }
        if (!data.credentialSubject || typeof data.credentialSubject !== "object" || Array.isArray(data.credentialSubject)) {
            throw new Error("Credential subject is required");
        }
        if (data.expiresAt && Number.isNaN(Date.parse(data.expiresAt))) {
            throw new Error("Invalid expiresAt");
        }

        return true;
    },
    validateCredentialSubject(fields, credentialSubject) {

        if (!Array.isArray(fields)) {
            throw new Error("Invalid template");
        }
        for (const field of fields) {
            const value = credentialSubject[field.name];
            if (field.required && (value === undefined || value === null || value === "")) {
                throw new Error(`${field.label} is required`);
            }
            if (value === undefined || value === null) {
                continue;
            }
            if (field.type === "string") {
                if (typeof value !== "string") {
                    throw new Error(`${field.label} must be string`);
                }
                continue;
            }
            if (field.type === "number") {
                if (typeof value !== "number") {
                    throw new Error(`${field.label} must be number`);
                }
                continue;
            }
            if (field.type === "boolean") {
                if (typeof value !== "boolean") {
                    throw new Error(`${field.label} must be boolean`);
                }
                continue;
            }
            if (field.type === "date") {
                if (Number.isNaN(Date.parse(value))) {
                    throw new Error(`${field.label} must be valid date`);
                }
                continue;
            }
            if (field.type === "select") {
                if (!field.options.includes(value)) {
                    throw new Error(`${field.label} is invalid`);
                }
                continue;
            }
        }

        for (const key of Object.keys(credentialSubject)) {
            const exists = fields.some(
                field => field.name === key
            );
            if (!exists) {
                throw new Error(
                    `Unexpected field '${key}'`
                );
            }
        }
        return true;
    }
};

export default CredentialValidator;