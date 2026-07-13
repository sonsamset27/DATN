import GenerateIdUltil from "../../shared/utils/generateId.ultil.js";
import CredentialRepository from "./credential.repository.js";
import IpfsService from "../../shared/services/pinata.service.js";
import DidService from "../dids/did.service.js";
import BlockchainService from "../../shared/services/blockchain.service.js";
import CredentialTemplateService from "../credentialTemplates/credentialTemplate.service.js";
import CredentialValidator from "./credential.validator.js";
import crypto from "crypto";

const CredentialService = {
    issueCredential: async (data, user) => {
        try {
            const templateFields = (await CredentialTemplateService.getCredentialTemplateById(data.credentialTemplateId)).fields;
            await CredentialValidator.validateCredentialSubject(templateFields, data.credentialSubject);
            const issuerDid = await DidService.getDidByAddress(user.walletAddress);
            console.log(issuerDid)
            const holderDid = await DidService.getDidByAddress(data.holderAddress);
            console.log(holderDid)
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
            const jsonString = JSON.stringify(dataIpfs);
            const credentialHash = "0x" + crypto.createHash("sha256").update(jsonString).digest("hex");
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

            const credential = await CredentialRepository.issueCredential({
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
