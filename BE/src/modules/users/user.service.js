import UserRepository from "./user.repository.js";
import BlockchainService from "../../shared/services/blockchain.service.js";
import AppError from "../../shared/errors/AppError.js";
import AuditLogService from "../auditLog/auditLog.service.js";
import DidService from "../dids/did.service.js";
import ErrorCodes from "../../shared/errors/errorCodes.js";

const UserService = {
    findUserById: async (id) => {
        const user = await UserRepository.findUserById(id);
        if (!user) {
            throw AppError.notFound(ErrorCodes.USER_001, "User not found");
        }
        return user;
    },

    updateUserName: async (id, userName) => {
        const user = await UserRepository.findUserById(id);
        if (!user) {
            throw AppError.notFound(ErrorCodes.USER_001, "User not found");
        }
        return await UserRepository.updateUserName(id, userName);
    },

    findAllUsers: async () => {
        const users = await UserRepository.findAllUsers();
        return users || [];
    },

    updateUserRole: async (id, role) => {
        const user = await UserRepository.findUserById(id);
        if (!user) {
            throw AppError.notFound(ErrorCodes.USER_001, "User not found");
        }
        return await UserRepository.updateUserRole(id, role);
    },

    updateUserStatus: async (id, status) => {
        const user = await UserRepository.findUserById(id);
        if (!user) {
            throw AppError.notFound(ErrorCodes.USER_001, "User not found");
        }
        return await UserRepository.updateUserStatus(id, status);
    },

    findByWalletAddress: async (walletAddress) => {
        const user = await UserRepository.findUserByWalletAddress(walletAddress);
        if (!user) {
            throw AppError.notFound(ErrorCodes.USER_001, "User not found");
        }
        return user;
    },

    createUser: async (walletAddress) => {
        return await UserRepository.createUser({ walletAddress });
    },

    promoteToIssuer: async (id, organizationName, organizationCode, adminDid) => {
        const user = await UserRepository.findUserById(id);
        if (!user) {
            throw AppError.notFound(ErrorCodes.USER_001, "User not found");
        }
        if (user.role === "ISSUER") {
            throw AppError.conflict(ErrorCodes.USER_002, "User is already an issuer");
        }
        const tx = await BlockchainService.setRelayerStatus(user.walletAddress, true);
        await tx.wait();
        const userUpdated = await UserRepository.promoteToIssuer(id, organizationName, organizationCode);
        AuditLogService.log(
            adminDid,
            "USER_PROMOTE",
            userUpdated.id,
            "USER",
            { userId: userUpdated.id, userName: userUpdated.userName, walletAddress: userUpdated.walletAddress }
        );
        return userUpdated;
    },

    demoteOrRevokeIssuer: async (id, adminDid) => {
        const user = await UserRepository.findUserById(id);
        if (!user) {
            throw AppError.notFound(ErrorCodes.USER_001, "User not found");
        }
        if (user.walletAddress) {
            const tx = await BlockchainService.setRelayerStatus(user.walletAddress, false);
            await tx.wait();
        }
        const userUpdated = await UserRepository.updateUserStatus(id, "DISABLE");
        AuditLogService.log(
            adminDid,
            "USER_DEMOTE",
            userUpdated.id,
            "USER",
            { userId: userUpdated.id, userName: userUpdated.userName, walletAddress: userUpdated.walletAddress }
        );
        return userUpdated;
    },
};

export default UserService;