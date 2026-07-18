import UserService from "../users/user.service.js";
import DidRepository from "./did.repository.js";
import BlockchainService from "../../shared/services/blockchain.service.js";
import AppError from "../../shared/errors/AppError.js";
import ErrorCodes from "../../shared/errors/errorCodes.js";
import AuditLogService from "../auditLog/auditLog.service.js";

const DidService = {
    prepareCreateDid: async (userData) => {
        const user = await UserService.findUserById(userData.id);
        const didExist = await DidRepository.getDidByUserId(user.id);
        if (didExist) {
            throw AppError.conflict(ErrorCodes.DID_002, "User already has a DID");
        }
        return {
            did: `did:ethr:testnet:${user.walletAddress}`,
            publicKey: user.walletAddress,
            algorithm: "ECC",
        };
    },

    registerDid: async (userData, txHash) => {
        const user = await UserService.findUserById(userData.id);
        const didExist = await DidRepository.getDidByUserId(user.id);
        if (didExist) {
            throw AppError.conflict(ErrorCodes.DID_002, "User already has a DID");
        }

        const txReceipt = await BlockchainService.checkTxHash(txHash);
        const dataDidFromEvent = await BlockchainService.getDataFromDidEvent(txReceipt, "DIDRegistered");

        if (dataDidFromEvent.owner.toLowerCase() !== user.walletAddress.toLowerCase()) {
            throw AppError.unprocessable(ErrorCodes.DID_003, "DID owner does not match the authenticated user");
        }

        const didData = {
            did: dataDidFromEvent.did,
            ownerId: user.id,
            publicKey: user.walletAddress,
        };
        AuditLogService.log(
            dataDidFromEvent.did,
            "REGISTER_DID",
            dataDidFromEvent.did,
            "DID",
            { txHash: txHash }
        );

        return await DidRepository.createDid(didData);
    },

    getDidByUserId: async (userData) => {
        const user = await UserService.findUserById(userData.id);
        const didDb = await DidRepository.getDidByUserId(user.id);
        if (!didDb) {
            throw AppError.notFound(ErrorCodes.DID_001, "DID not found for this user");
        }

        const didBlockchain = await BlockchainService.getDID(didDb.did);
        if (!didBlockchain) {
            throw AppError.notFound(ErrorCodes.DID_004, "DID not found on blockchain");
        }

        if (didBlockchain[1].toLowerCase() !== user.walletAddress.toLowerCase()) {
            throw AppError.unprocessable(ErrorCodes.DID_003, "DID owner does not match");
        }

        return didDb;
    },

    getDidByAddress: async (address) => {
        const didDb = await DidRepository.getDidByAddress(address);
        if (!didDb) {
            throw AppError.notFound(ErrorCodes.DID_001, "DID not found for this address");
        }

        const didBlockchain = await BlockchainService.getDID(didDb.did);
        if (!didBlockchain) {
            throw AppError.notFound(ErrorCodes.DID_004, "DID not found on blockchain");
        }

        if (didBlockchain[1].toLowerCase() !== address.toLowerCase()) {
            throw AppError.unprocessable(ErrorCodes.DID_003, "DID owner does not match");
        }

        return didDb;
    },
};

export default DidService;