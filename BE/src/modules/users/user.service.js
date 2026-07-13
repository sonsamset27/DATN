import UserRepository from "./user.repository.js";
import BlockchainService from "../../shared/services/blockchain.service.js";

const UserService = {
    findUserById: async (id) => {
        try {
            const user = await UserRepository.findUserById(id);
            if (!user) {
                throw new Error("User not found");
            }
            return user;
        } catch (error) {
            throw error;
        }
    },
    updateUserName: async (id, userName) => {
        try {
            const user = await UserRepository.findUserById(id);
            if (!user) {
                throw new Error("User not found");
            }
            return await UserRepository.updateUserName(id, userName);
        } catch (error) {
            throw error;
        }
    },
    findAllUsers: async () => {
        try {
            const users = await UserRepository.findAllUsers();
            if (!users) {
                throw new Error("No users found");
            }
            return users;
        } catch (error) {
            throw error;
        }
    },
    updateUserRole: async (id, role) => {
        try {
            const user = await UserRepository.findUserById(id);
            if (!user) {
                throw new Error("User not found");
            }
            return await UserRepository.updateUserRole(id, role);
        } catch (error) {
            throw error;
        }
    },
    updateUserStatus: async (id, status) => {
        try {
            const user = await UserRepository.findUserById(id);
            if (!user) {
                throw new Error("User not found");
            }
            return await UserRepository.updateUserStatus(id, status);
        } catch (error) {
            throw error;
        }
    },
    findByWalletAddress: async (walletAddress) => {
        try {
            const user = await UserRepository.findUserByWalletAddress(walletAddress);
            if (!user) {
                throw new Error("User not found");
            }
            return user;
        } catch (error) {
            throw error;
        }
    },
    createUser: async (walletAddress) => {
        try {
            const user = await UserRepository.createUser({ walletAddress });
            return user;
        } catch (error) {
            throw error;
        }
    },
    promoteToIssuer: async (id, organizationName, organizationCode) => {
        try {
            const user = await UserRepository.findUserById(id);
            if (!user) {
                throw new Error("User not found");
            }
            if (user.role === "ISSUER") {
                throw new Error("User is already an issuer");
            }
            const tx = await BlockchainService.setRelayerStatus(user.walletAddress, true);
            await tx.wait();
            return await UserRepository.promoteToIssuer(id, organizationName, organizationCode);
        } catch (error) {
            throw error;
        }
    },
    demoteOrRevokeIssuer: async (id) => {
        try {
            const user = await UserRepository.findUserById(id);
            if (!user) {
                throw new Error("User not found");
            }
            if (user.walletAddress) {
                const tx = await BlockchainService.setRelayerStatus(user.walletAddress, false);
                await tx.wait();
            }
            const updatedUser = await UserRepository.updateUserStatus(id, "DISABLE");
            return updatedUser;
        } catch (error) {
            throw error;
        }
    }
}

export default UserService;