import GenerateIdUltil from "../../shared/utils/generateId.ultil.js";
import CredentialRepository from "./credential.repository.js";
import IpfsService from "../../shared/services/pinata.service.js";
import DidService from "../dids/did.service.js";
import BlockchainService from "../../shared/services/blockchain.service.js";
import CredentialTemplateService from "../credentialTemplates/credentialTemplate.service.js";
import CredentialValidator from "./credential.validator.js";
import AuditLogService from "../auditLog/auditLog.service.js";
import AppError from "../../shared/errors/AppError.js";
import ErrorCodes from "../../shared/errors/errorCodes.js";
import crypto from "crypto";

const resolveCredentialStatus = (cred) => {
    if (cred.status === "REVOKED") return "REVOKED";
    if (cred.expiresAt && new Date(cred.expiresAt) < new Date()) return "EXPIRED";
    return "ACTIVE";
};

/**
 * Batch load templates theo danh sách unique IDs.
 * Fix Bug (N+1): thay vì mỗi credential gọi 1 query riêng,
 * gom tất cả templateIds → gọi 1 lần → build Map tra cứu O(1).
 *
 * @param {string[]} templateIds
 * @returns {Promise<Map<string, Object>>} Map<templateId, template>
 */
const batchLoadTemplates = async (templateIds) => {
    const uniqueIds = [...new Set(templateIds.map(String))];
    const templateMap = new Map();

    await Promise.all(
        uniqueIds.map(async (id) => {
            try {
                const template = await CredentialTemplateService.getCredentialTemplateById(id);
                if (template) {
                    templateMap.set(id, template);
                }
            } catch {
            }
        })
    );

    return templateMap;
};

const CredentialService = {
    issueCredential: async (data, user) => {
        let blockchainCredentialId = null;

        try {
            const templateFields = (
                await CredentialTemplateService.getCredentialTemplateById(data.credentialTemplateId)
            ).fields;
            await CredentialValidator.validateCredentialSubject(templateFields, data.credentialSubject);

            const issuerDid = await DidService.getDidByAddress(user.walletAddress);
            const holderDid = await DidService.getDidByAddress(data.holderAddress);

            const dataIpfs = {
                credentialId: GenerateIdUltil.generateCredentialId(user.organizationCode),
                issuerDid: issuerDid.did,
                holderDid: holderDid.did,
                credentialTemplateId: data.credentialTemplateId,
                credentialSubject: data.credentialSubject,
                issuedAt: new Date().toISOString(),
                expiresAt: data.expiresAt,
                signatureAlgorithm: "ECC",
            };

            const cid = await IpfsService.pinJsonToIpfs(dataIpfs);

            const jsonString = JSON.stringify(dataIpfs);
            const credentialHash = "0x" + crypto.createHash("sha256").update(jsonString).digest("hex");
            const expiresAt = dataIpfs.expiresAt
                ? Math.floor(new Date(dataIpfs.expiresAt).getTime() / 1000)
                : 0;

            const dataBlockchain = {
                credentialId: dataIpfs.credentialId,
                credentialHash,
                issuerDid: dataIpfs.issuerDid,
                holderDid: dataIpfs.holderDid,
                expiresAt,
                signatureAlgorithm: "ECC",
            };

            const tx = await BlockchainService.issueCredential(dataBlockchain);
            await tx.wait();
            blockchainCredentialId = dataIpfs.credentialId;
            let credential;
            try {
                credential = await CredentialRepository.issueCredential({
                    credentialId: dataIpfs.credentialId,
                    issuerDid: dataIpfs.issuerDid,
                    holderDid: dataIpfs.holderDid,
                    credentialTemplateId: dataIpfs.credentialTemplateId,
                    cid,
                    credentialHash,
                    txHash: tx.hash,
                    issuedAt: dataIpfs.issuedAt,
                    expiresAt: dataIpfs.expiresAt,
                });
            } catch (dbError) {
                console.error("[Credential] DB save failed, rolling back blockchain...", dbError.message);
                try {
                    const revokeTx = await BlockchainService.revokeCredential(blockchainCredentialId);
                    await revokeTx.wait();
                    console.info("[Credential] Blockchain rollback successful for", blockchainCredentialId);
                } catch (rollbackError) {
                    console.error("[Credential] Blockchain rollback FAILED:", rollbackError.message);
                }
                throw AppError.internal(
                    ErrorCodes.CREDENTIAL_007,
                    "Failed to save credential to database. Blockchain transaction has been rolled back."
                );
            }
            AuditLogService.log(
                issuerDid.did,
                "ISSUE",
                credential.credentialId,
                "CREDENTIAL",
                { holderDid: holderDid.did, templateId: data.credentialTemplateId }
            );

            return credential;
        } catch (error) {
            throw error;
        }
    },

    verifyCredential: async (credentialId) => {
        const credential = await CredentialRepository.getCredentialByCredentialId(credentialId);
        if (!credential) {
            throw AppError.notFound(ErrorCodes.CREDENTIAL_001, "Credential not found in database");
        }

        const dataIpfs = await IpfsService.readJsonFromIpfs(credential.cid);
        if (!dataIpfs) {
            throw AppError.internal(ErrorCodes.CREDENTIAL_006, "Failed to read credential data from IPFS");
        }

        const jsonString = JSON.stringify(dataIpfs);
        const credentialHash = "0x" + crypto.createHash("sha256").update(jsonString).digest("hex");
        const credentialHashBlockchain = await BlockchainService.getCredentialHash(credentialId);

        if (credentialHash !== credentialHashBlockchain) {
            throw AppError.unprocessable(ErrorCodes.CREDENTIAL_002, "Credential hash does not match – possible tampering detected");
        }
        AuditLogService.log(
            dataIpfs.holderDid,
            "VERIFY",
            credential.credentialId,
            "CREDENTIAL",
            { holderDid: dataIpfs.holderDid, templateId: dataIpfs.credentialTemplateId }
        );

        return {
            status: "VERIFIED",
            metadata: {
                credentialId: dataIpfs.credentialId,
                issuerDid: dataIpfs.issuerDid,
                holderDid: dataIpfs.holderDid,
                credentialTemplateId: dataIpfs.credentialTemplateId,
                issuedAt: dataIpfs.issuedAt,
                expiresAt: dataIpfs.expiresAt || "Never",
                status: credential.status,
            },
            subjectData: dataIpfs.credentialSubject,
            blockchainProof: {
                credentialHash,
                txHash: credential.txHash,
            },
        };
    },

    getOwnCredentials: async (user) => {
        const holderDid = await DidService.getDidByAddress(user.walletAddress);
        if (!holderDid) {
            throw AppError.notFound(ErrorCodes.DID_001, "Holder DID not found");
        }

        const credentials = await CredentialRepository.getCredentialsByHolderDid(holderDid.did);
        if (!credentials || credentials.length === 0) {
            return [];
        }

        const templateIds = credentials.map((c) => c.credentialTemplateId);
        const templateMap = await batchLoadTemplates(templateIds);

        return credentials.map((cred) => {
            const tmpl = templateMap.get(String(cred.credentialTemplateId));
            return {
                id: cred._id,
                credentialId: cred.credentialId,
                templateId: cred.credentialTemplateId,
                issuerDid: cred.issuerDid,
                issuedAt: cred.issuedAt,
                expiresAt: cred.expiresAt || "Never",
                txHash: cred.txHash,
                cid: cred.cid,
                status: resolveCredentialStatus(cred),
                title: tmpl?.name || "Chứng chỉ số",
                description: tmpl?.description || "",
            };
        });
    },

    getCredentialIssueByIssuer: async (user) => {
        const issuerDid = await DidService.getDidByAddress(user.walletAddress);
        if (!issuerDid) {
            throw AppError.notFound(ErrorCodes.DID_001, "Issuer DID not found");
        }

        const credentials = await CredentialRepository.getCredentialsByIssuerDid(issuerDid.did);
        if (!credentials || credentials.length === 0) {
            return { total: 0, list: [] };
        }

        const templateIds = credentials.map((c) => c.credentialTemplateId);
        const templateMap = await batchLoadTemplates(templateIds);

        const formattedList = credentials.map((cred) => {
            const tmpl = templateMap.get(String(cred.credentialTemplateId));
            return {
                id: cred._id,
                credentialId: cred.credentialId,
                templateId: cred.credentialTemplateId,
                templateName: tmpl?.name || "Mẫu chứng chỉ",
                holderDid: cred.holderDid,
                issuedAt: cred.issuedAt,
                expiresAt: cred.expiresAt || "Never",
                txHash: cred.txHash,
                cid: cred.cid,
                status: resolveCredentialStatus(cred),
            };
        });

        return {
            total: formattedList.length,
            list: formattedList,
        };
    },

    getCredentialById: async (credentialId) => {
        const credential = await CredentialRepository.getCredentialByCredentialId(credentialId);
        if (!credential) {
            throw AppError.notFound(ErrorCodes.CREDENTIAL_001, "Credential not found in database");
        }

        const isExpired = credential.expiresAt && new Date(credential.expiresAt) < new Date();
        const isRevoked = credential.status === "REVOKED";

        const dataIpfs = await IpfsService.readJsonFromIpfs(credential.cid);
        if (!dataIpfs) {
            throw AppError.internal(ErrorCodes.CREDENTIAL_006, "Failed to read data from IPFS");
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
                expiresAt: credential.expiresAt || "Never",
            },
            subjectData: dataIpfs.credentialSubject,
            proof: {
                cid: credential.cid,
                computedHash,
                blockchainHash,
                txHash: credential.txHash,
            },
        };
    },

    reissueAllCredentials: async (oldWalletAddress, newWalletAddress, user) => {
        const currentIssuerDid = await DidService.getDidByAddress(user.walletAddress);
        if (!currentIssuerDid) {
            throw AppError.notFound(ErrorCodes.DID_001, "Tổ chức của bạn chưa được đăng ký định danh DID");
        }

        const oldHolderDid = await DidService.getDidByAddress(oldWalletAddress);
        const newHolderDid = await DidService.getDidByAddress(newWalletAddress);

        if (!oldHolderDid) {
            throw AppError.notFound(ErrorCodes.DID_001, "Không tìm thấy định danh DID của ví cũ");
        }
        if (!newHolderDid) {
            throw AppError.notFound(ErrorCodes.DID_001, "Ví mới chưa được đăng ký định danh DID");
        }

        const allOldCredentials = await CredentialRepository.getCredentialsByHolderDid(oldHolderDid.did);
        if (!allOldCredentials || allOldCredentials.length === 0) {
            throw AppError.notFound(ErrorCodes.CREDENTIAL_005, "Ví cũ này không sở hữu chứng chỉ nào trong hệ thống");
        }

        const credentialsToProcess = allOldCredentials.filter(
            (cred) => cred.issuerDid === currentIssuerDid.did
        );

        if (credentialsToProcess.length === 0) {
            throw AppError.notFound(
                ErrorCodes.CREDENTIAL_005,
                "Ví cũ này không có chứng chỉ nào do tổ chức của bạn phát hành để cấp lại"
            );
        }

        const reissuedList = [];
        const errors = [];

        for (const oldCred of credentialsToProcess) {
            try {
                const revokeTx = await BlockchainService.revokeCredential(oldCred.credentialId);
                await revokeTx.wait();

                await CredentialRepository.updateCredential(oldCred.credentialId, {
                    status: "REVOKED",
                    revokedAt: new Date(),
                });
                AuditLogService.log(
                    currentIssuerDid.did,
                    "REVOKE",
                    oldCred.credentialId,
                    "CREDENTIAL",
                    { reason: "REISSUE", newHolderDid: newHolderDid.did }
                );

                const oldDataIpfs = await IpfsService.readJsonFromIpfs(oldCred.cid);

                const newDataIpfs = {
                    credentialId: GenerateIdUltil.generateCredentialId(user.organizationCode),
                    issuerDid: oldDataIpfs.issuerDid,
                    holderDid: newHolderDid.did,
                    credentialTemplateId: oldDataIpfs.credentialTemplateId,
                    credentialSubject: oldDataIpfs.credentialSubject,
                    issuedAt: new Date().toISOString(),
                    expiresAt: oldDataIpfs.expiresAt,
                    signatureAlgorithm: "ECC",
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
                    signatureAlgorithm: "ECC",
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
                    status: "ACTIVE",
                });

                reissuedList.push(newCredSaved);

                AuditLogService.log(
                    currentIssuerDid.did,
                    "REISSUE",
                    newCredSaved.credentialId,
                    "CREDENTIAL",
                    { oldCredentialId: oldCred.credentialId, newHolderDid: newHolderDid.did }
                );
            } catch (singleError) {
                console.error(`[Credential] Lỗi khi xử lý cấp lại chứng chỉ ${oldCred.credentialId}:`, singleError.message);
                errors.push({ credentialId: oldCred.credentialId, error: singleError.message });
            }
        }

        return {
            success: true,
            message: `Đã cấp lại thành công ${reissuedList.length}/${credentialsToProcess.length} chứng chỉ sang ví mới.`,
            data: reissuedList,
            errors: errors.length > 0 ? errors : undefined,
        };
    },
};

export default CredentialService;
