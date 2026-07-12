import GenerateIdUltil from "../../shared/utils/generateId.ultil.js";
import CredentialRepository from "./credential.repository.js";
import IpfsService from "../../shared/services/pinata.service.js";
import DidService from "../dids/did.service.js";
import BlockchainService from "../../shared/services/blockchain.service.js";
import CredentialTemplateService from "../credentialTemplates/credentialTemplate.service.js";
import CredentialValidator from "./credential.validator.js";
const CredentialService = {
    issueCredential: async (data, user) => {
        try {
            await CredentialValidator.issueCredential(data);
            const templateFields = (await CredentialTemplateService.getCredentialTemplateById(data.credentialTemplateId)).fields;
            await CredentialValidator.validateCredential(data.credentialSubject, templateFields);
            const issuerDid = await DidService.getDidByUserId(user._id);
            const holderDid = await DidService.getDidByAddress(data.holderAddress);
            const dataIpfs = {
                credentialId: GenerateIdUltil.generateCredentialId(user.organizationCode),
                issuerDid: issuerDid.did,
                holderDid: holderDid.did,
                credentialTemplateId: data.credentialTemplateId,
                credentialSubject: data.credentialSubject,
                issuedAt: new Date().toISOString(),
                expiresAt: data.expirateAt,
                signatureAlgorithm: "ECC"
            }

            const cid = await IpfsService.pinJsonToIpfs(dataIpfs);
            const credentialHash = "0x" + SHA256(JSON.stringify(dataIpfs)).toString();
            const expiresAt = dataIpfs.expiresAt
                ? Math.floor(new Date(dataIpfs.expiresAt).getTime() / 1000)
                : 0;

            const dataBlockchain = {
                credentialId: dataIpfs.credentialId,
                credentialHash: credentialHash,
                issuerDid: dataIpfs.issuerDid,
                holderDid: dataIpfs.holderDid,
                expiresAt: expiresAt,
                signatureAlgorithm: "ECC"
            }

            const tx = await BlockchainService.issueCredential(dataBlockchain);
            const receipt = await tx.wait();
            const txHash = tx.hash;

            const credential = await CredentialRepository.createCredential({
                credentialId: dataIpfs.credentialId,
                issuerDid: dataIpfs.issuerDid,
                holderDid: dataIpfs.holderDid,
                credentialTemplateId: dataIpfs.credentialTemplateId,
                cid: cid,
                credentialHash: credentialHash,
                txHash: txHash,
                issuedAt: dataIpfs.issuedAt,
                expiresAt: dataIpfs.expiresAt
            });
            return credential;
        } catch (error) {
            throw error;
        }
    }
}

export default CredentialService;
