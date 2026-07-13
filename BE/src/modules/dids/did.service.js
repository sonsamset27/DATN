import UserService from "../users/user.service.js";
import DidRepository from "./dis.repository.js";
import BlockchainService from "../../shared/services/blockchain.service.js";

const DidService = {
    prepareCreateDid: async (userData) => {
        try {
            const user = await UserService.findUserById(userData.id);
            if (!user) {
                throw new Error("User not found");
            }
            const didExist = await DidRepository.getDidByUserId(user.id);
            if (didExist) {
                throw new Error("User already has a DID");
            }
            const message = {
                did: `did:ethr:testnet:${user.walletAddress}`,
                publicKey: user.walletAddress,
                algorithm: "ECC"
            }
            return message;
        } catch (error) {
            throw error;
        }
    },
    registerDid: async (userData, txHash) => {
        try {
            const user = await UserService.findUserById(userData.id);
            if (!user) {
                throw new Error("User not found");
            }
            const didExist = await DidRepository.getDidByUserId(user.id);
            if (didExist) {
                throw new Error("User already has a DID");
            }
            const txReceipt = await BlockchainService.checkTxHash(txHash);
            const dataDidFromEvent = await BlockchainService.getDataFromDidEvent(txReceipt, "DIDRegistered");
            if (dataDidFromEvent.owner.toLowerCase() !== user.walletAddress.toLowerCase()) {
                throw new Error("Owner not match");
            }
            const did = dataDidFromEvent.did;
            const didData = {
                did: did,
                ownerId: user.id,
                publicKey: user.walletAddress
            }
            return await DidRepository.createDid(didData);
        } catch (error) {
            throw error;
        }
    },
    getDidByUserId: async (userData) => {
        try {
            const user = await UserService.findUserById(userData.id);
            if (!user) {
                throw new Error("User not found");
            }
            const didDb = await DidRepository.getDidByUserId(user.id);
            if (!didDb) {
                throw new Error("Did not found");
            }
            const didBlockchain = await BlockchainService.getDID(didDb.did);
            if (!didBlockchain) {
                throw new Error("Did not found on blockchain");
            }
            if (didBlockchain[1].toLowerCase() !== user.walletAddress.toLowerCase()) {
                throw new Error("Owner not match");
            }
            return didDb;
        } catch (error) {
            throw error;
        }
    },
    getDidByAddress: async (address) => {
        try {
            const didDb = await DidRepository.getDidByAddress(address);
            if (!didDb) {
                throw new Error("Did not found Did");
            }
            const didBlockchain = await BlockchainService.getDID(didDb.did);
            if (!didBlockchain) {
                throw new Error("Did not found on blockchain");
            }
            if (didBlockchain[1].toLowerCase() !== address.toLowerCase()) {
                throw new Error("Owner not match");
            }
            return didDb;
        } catch (error) {
            throw error;
        }
    }
}

export default DidService;