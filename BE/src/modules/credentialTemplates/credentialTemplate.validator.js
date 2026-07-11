const CredentialTemplateValidator = {
    createCredentialTemplate: (req, res, next) => {
        const { name, description, fields } = req.body;

        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ message: "Name is required and must be a string" });
        }
        if (!description || typeof description !== 'string' || !description.trim()) {
            return res.status(400).json({ message: "Description is required and must be a string" });
        }
        if (!fields || !Array.isArray(fields) || fields.length === 0) {
            return res.status(400).json({ message: "Fields must be a non-empty array" });
        }

        const validTypes = ["string", "number", "date", "boolean", "select"];
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];

            if (!field.name || !field.label) {
                return res.status(400).json({ message: `Field at index ${i} is missing name or label` });
            }
            if (field.type && !validTypes.includes(field.type)) {
                return res.status(400).json({ message: `Field at index ${i} has invalid type` });
            }
            if (field.type === 'select' && (!field.options || !Array.isArray(field.options) || field.options.length === 0)) {
                return res.status(400).json({ message: `Field at index ${i} with type 'select' must have options` });
            }
        }

        next();
    },

    updateCredentialTemplate: (req, res, next) => {
        const { name, description, fields } = req.body;

        if (!name && !description && !fields) {
            return res.status(400).json({ message: "At least one field (name, description, fields) must be provided" });
        }
        next();
    }
};

export default CredentialTemplateValidator;


