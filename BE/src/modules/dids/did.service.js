import UserService from "../users/user.service.js";
import DidRepository from "./dis.repository.js";

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
                walletAddress: user.walletAddress,
                algorithm: "ECC"
            }
            return message;
        } catch (error) {
            throw error;
        }
    }
}

export default DidService;