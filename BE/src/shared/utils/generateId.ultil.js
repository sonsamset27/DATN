import crypto from "crypto";
const GenerateIdUltil = {
    generateCredentialId: (organizationCode) => {
        const year = new Date().getFullYear();
        const timestampHex = Date.now().toString(16).slice(-6);
        const randomHex = crypto.randomBytes(2).toString('hex');

        return `VC-${organizationCode}-${year}-${timestampHex}${randomHex}`;
    }
}

export default GenerateIdUltil;