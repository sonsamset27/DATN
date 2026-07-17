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
    },
    verifyCredential: async (credentialId) => {
        try {
            const credential = await CredentialRepository.getCredentialByCredentialId(credentialId);
            if (!credential) {
                throw new Error("Credential not found in database");
            }
            const dataIpfs = await IpfsService.readJsonFromIpfs(credential.cid);
            const jsonString = JSON.stringify(dataIpfs);
            const credentialHash = "0x" + crypto.createHash("sha256").update(jsonString).digest("hex");
            const credentialHashBlockchain = await BlockchainService.getCredentialHash(credentialId);

            if (credentialHash !== credentialHashBlockchain) {
                throw new Error("Credential hash does not match");
            }
            return {
                status: "VERIFIED",
                metadata: {
                    credentialId: dataIpfs.credentialId,
                    issuerDid: dataIpfs.issuerDid,
                    holderDid: dataIpfs.holderDid,
                    credentialTemplateId: dataIpfs.credentialTemplateId,
                    issuedAt: dataIpfs.issuedAt,
                    expiresAt: dataIpfs.expiresAt || "Never",
                    status: credential.status
                },
                subjectData: dataIpfs.credentialSubject,
                blockchainProof: {
                    credentialHash: credentialHash,
                    txHash: credential.txHash
                }
            };
        } catch (error) {
            throw error;
        }
    },
    getOwnCredentials: async (user) => {
        try {
            const holderDid = await DidService.getDidByAddress(user.walletAddress);
            if (!holderDid) {
                throw new Error("Holder DID not found");
            }

            const credentials = await CredentialRepository.getCredentialsByHolderDid(holderDid.did);
            if (!credentials || credentials.length === 0) {
                return [];
            }

            const formattedCredentials = await Promise.all(
                credentials.map(async (cred) => {
                    const getCredentialStatus = () => {
                        if (cred.isRevoked || cred.status === "REVOKED") return "REVOKED";
                        if (cred.expiresAt && new Date(cred.expiresAt) < new Date()) return "EXPIRED";
                        return "ACTIVE";
                    };

                    let templateInfo = { name: "Chứng chỉ số", description: "" };
                    try {
                        const template = await CredentialTemplateService.getCredentialTemplateById(cred.credentialTemplateId);
                        if (template) {
                            templateInfo.name = template.name;
                            templateInfo.description = template.description;
                        }
                    } catch (tError) {
                        console.error(`Không tìm thấy mẫu template cho ID: ${cred.credentialTemplateId}`);
                    }

                    return {
                        id: cred.id || cred._id,
                        credentialId: cred.credentialId,
                        templateId: cred.credentialTemplateId,
                        issuerDid: cred.issuerDid,
                        issuedAt: cred.issuedAt,
                        expiresAt: cred.expiresAt || "Never",
                        txHash: cred.txHash,
                        cid: cred.cid,
                        status: getCredentialStatus(),

                        title: templateInfo.name,
                        description: templateInfo.description
                    };
                })
            );

            return formattedCredentials;
        } catch (error) {
            throw error;
        }
    },

    getCredentialIssueByIssuer: async (user) => {
        try {
            const issuerDid = await DidService.getDidByAddress(user.walletAddress);
            if (!issuerDid) {
                throw new Error("Issuer DID not found");
            }

            const credentials = await CredentialRepository.getCredentialsByIssuerDid(issuerDid.did);
            if (!credentials || credentials.length === 0) {
                return { total: 0, list: [] };
            }

            const formattedList = await Promise.all(
                credentials.map(async (cred) => {
                    const getCredentialStatus = () => {
                        if (cred.isRevoked || cred.status === "REVOKED") return "REVOKED";
                        if (cred.expiresAt && new Date(cred.expiresAt) < new Date()) return "EXPIRED";
                        return "ACTIVE";
                    };

                    let templateName = "Mẫu chứng chỉ";
                    try {
                        const template = await CredentialTemplateService.getCredentialTemplateById(cred.credentialTemplateId);
                        if (template) templateName = template.name;
                    } catch (tError) {
                        console.error(`Không tìm thấy mẫu template cho ID: ${cred.credentialTemplateId}`);
                    }

                    return {
                        id: cred.id || cred._id,
                        credentialId: cred.credentialId,
                        templateId: cred.credentialTemplateId,

                        templateName: templateName,

                        holderDid: cred.holderDid,
                        issuedAt: cred.issuedAt,
                        expiresAt: cred.expiresAt || "Never",
                        txHash: cred.txHash,
                        cid: cred.cid,
                        status: getCredentialStatus()
                    };
                })
            );

            return {
                total: formattedList.length,
                list: formattedList
            };
        } catch (error) {
            throw error;
        }
    },
    getCredentialById: async (credentialId) => {
        try {
            const credential = await CredentialRepository.getCredentialByCredentialId(credentialId);
            if (!credential) {
                throw new Error("Credential not found in database");
            }

            const isExpired = credential.expiresAt && new Date(credential.expiresAt) < new Date();
            const isRevoked = credential.isRevoked || credential.status === "REVOKED";

            const dataIpfs = await IpfsService.readJsonFromIpfs(credential.cid);
            if (!dataIpfs) {
                throw new Error("Failed to read data from IPFS");
            }

            const jsonString = JSON.stringify(dataIpfs);
            const computedHash = "0x" + crypto.createHash("sha256").update(jsonString).digest("hex");

            const blockchainHash = await BlockchainService.getCredentialHash(credentialId);
            const isHashValid = computedHash === blockchainHash;

            let finalStatus = "ACTIVE";
            if (isRevoked) finalStatus = "REVOKED";
            else if (isExpired) finalStatus = "EXPIRED";
            else if (!isHashValid) finalStatus = "INVALID_HASH";
            return {
                status: finalStatus,
                isValid: isHashValid && !isExpired && !isRevoked,
                metadata: {
                    credentialId: credential.credentialId,
                    templateId: credential.credentialTemplateId,
                    issuerDid: credential.issuerDid,
                    holderDid: credential.holderDid,
                    issuedAt: credential.issuedAt,
                    expiresAt: credential.expiresAt || "Never"
                },
                subjectData: dataIpfs.credentialSubject,
                proof: {
                    cid: credential.cid,
                    computedHash: computedHash,
                    blockchainHash: blockchainHash,
                    txHash: credential.txHash,
                }
            };

        } catch (error) {
            throw error;
        }
    },
    reissueAllCredentials: async (oldWalletAddress, newWalletAddress, user) => {
        try {
            const currentIssuerDid = await DidService.getDidByAddress(user.walletAddress);
            if (!currentIssuerDid) throw new Error("Tổ chức của bạn chưa được đăng ký định danh DID");

            const oldHolderDid = await DidService.getDidByAddress(oldWalletAddress);
            const newHolderDid = await DidService.getDidByAddress(newWalletAddress);

            if (!oldHolderDid) throw new Error("Không tìm thấy định danh DID của ví cũ");
            if (!newHolderDid) throw new Error("Ví mới chưa được đăng ký định danh DID");

            const allOldCredentials = await CredentialRepository.getCredentialsByHolderDid(oldHolderDid.did);
            if (!allOldCredentials || allOldCredentials.length === 0) {
                throw new Error("Ví cũ này không sở hữu chứng chỉ nào hệ thống");
            }

            const credentialsToProcess = allOldCredentials.filter(
                (cred) => cred.issuerDid === currentIssuerDid.did
            );

            if (credentialsToProcess.length === 0) {
                throw new Error("Ví cũ này không có chứng chỉ nào do tổ chức của bạn phát hành để cấp lại");
            }

            const reissuedList = [];

            for (const oldCred of credentialsToProcess) {
                try {
                    if (BlockchainService.revokeCredential) {
                        const revokeTx = await BlockchainService.revokeCredential(oldCred.credentialId);
                        await revokeTx.wait();
                    }

                    if (CredentialRepository.updateCredential) {
                        await CredentialRepository.updateCredential(oldCred.credentialId, {
                            status: "REVOKED"
                        });
                    }

                    const oldDataIpfs = await IpfsService.readJsonFromIpfs(oldCred.cid);

                    const newDataIpfs = {
                        credentialId: GenerateIdUltil.generateCredentialId(user.organizationCode),
                        issuerDid: oldDataIpfs.issuerDid,
                        holderDid: newHolderDid.did,
                        credentialTemplateId: oldDataIpfs.credentialTemplateId,
                        credentialSubject: oldDataIpfs.credentialSubject,
                        issuedAt: new Date().toISOString(),
                        expiresAt: oldDataIpfs.expiresAt,
                        signatureAlgorithm: "ECC"
                    };

                    const newCid = await IpfsService.pinJsonToIpfs(newDataIpfs);
                    const jsonString = JSON.stringify(newDataIpfs);
                    const newCredentialHash = "0x" + crypto.createHash("sha256").update(jsonString).digest("hex");

                    const isValidDate = newDataIpfs.expiresAt && !isNaN(new Date(newDataIpfs.expiresAt).getTime());
                    const expiresAtUnix = isValidDate
                        ? Math.floor(new Date(newDataIpfs.expiresAt).getTime() / 1000)
                        : 0;

                    const dataBlockchain = {
                        credentialId: newDataIpfs.credentialId,
                        credentialHash: newCredentialHash,
                        issuerDid: newDataIpfs.issuerDid,
                        holderDid: newDataIpfs.holderDid,
                        expiresAt: expiresAtUnix,
                        signatureAlgorithm: "ECC"
                    };

                    const tx = await BlockchainService.issueCredential(dataBlockchain);
                    await tx.wait();

                    const newCredSaved = await CredentialRepository.issueCredential({
                        credentialId: newDataIpfs.credentialId,
                        issuerDid: newDataIpfs.issuerDid,
                        holderDid: newDataIpfs.holderDid,
                        credentialTemplateId: newDataIpfs.credentialTemplateId,
                        cid: newCid,
                        credentialHash: newCredentialHash,
                        txHash: tx.hash,
                        issuedAt: newDataIpfs.issuedAt,
                        expiresAt: newDataIpfs.expiresAt,
                        status: "ACTIVE"
                    });

                    reissuedList.push(newCredSaved);

                } catch (singleError) {
                    console.error(`Lỗi khi xử lý cấp lại chứng chỉ ${oldCred.credentialId}:`, singleError);
                }
            }

            return {
                success: true,
                message: `Đã cấp lại thành công ${reissuedList.length}/${credentialsToProcess.length} chứng chỉ thuộc thẩm quyền của tổ chức sang ví mới.`,
                data: reissuedList
            };

        } catch (error) {
            throw error;
        }
    }


}

export default CredentialService;
