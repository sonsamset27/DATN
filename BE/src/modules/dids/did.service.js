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
    }
}

export default DidService;