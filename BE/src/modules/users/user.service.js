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

    findAllUsers: async (query = {}) => {
        const { role, status, search, page = 1, limit = 20 } = query;
        const filter = {};
        if (role) filter.role = role;
        if (status) filter.status = status;
        if (search) {
            const { default: DidModel } = await import('../dids/did.model.js');
            const matchingDids = await DidModel.find({ did: { $regex: search, $options: "i" } }).select('ownerId').lean();
            const ownerIds = matchingDids.map(d => d.ownerId);

            filter.$or = [
                { userName: { $regex: search, $options: "i" } },
                { walletAddress: { $regex: search, $options: "i" } },
                { _id: { $in: ownerIds } }
            ];
        }
        return await UserRepository.findAllUsers(filter, Number(page), Number(limit));
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
        const userUpdated = await UserRepository.demoteToHolder(id);
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