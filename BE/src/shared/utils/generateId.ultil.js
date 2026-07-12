import { randomBytes } from "ethers";

const GenerateIdUltil = {
    generateCredentialId: (organizationCode) => {
        return `VC-${organizationCode}-${Date.getFullYear()}-${randomBytes(5).toString('hex')}`;
    }
}

export default GenerateIdUltil;