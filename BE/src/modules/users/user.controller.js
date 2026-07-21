import UserService from "./user.service.js";
import AppError from "../../shared/errors/AppError.js";
import HttpStatus from "../../shared/errors/httpStatus.js";
import DidService from "../dids/did.service.js";

const UserController = {
    findUserById: async (req, res) => {
        try {
            const result = await UserService.findUserById(req.params.id);
            return res.status(HttpStatus.OK).json({
                message: "User found successfully",
                data: result,
            });
        } catch (error) {
            if (!error instanceof AppError) {
                console.log("Error at findUserById: " + error);
            }
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorCode: "SYS_001",
                message: "Error finding user",
            });
        }
    },

    getMe: async (req, res) => {
        try {
            const result = await UserService.findUserById(req.user.id);
            return res.status(HttpStatus.OK).json({
                message: "User found successfully",
                data: result,
            });
        } catch (error) {
            if (!error instanceof AppError) {
                console.log("Error at getMe: " + error);
            }
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorCode: "SYS_001",
                message: "Error fetching current user",
            });
        }
    },

    updateUserName: async (req, res) => {
        try {
            const { userName } = req.body;
            const result = await UserService.updateUserName(req.user.id, userName);
            return res.status(HttpStatus.OK).json({
                message: "User name updated successfully",
                data: result,
            });
        } catch (error) {
            if (!error instanceof AppError) {
                console.log("Error at updateUserName: " + error);
            }
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorCode: "SYS_001",
                message: "Error updating user name",
            });
        }
    },

    findAllUsers: async (req, res) => {
        try {
            const users = await UserService.findAllUsers();
            return res.status(HttpStatus.OK).json({
                message: "Users found successfully",
                data: users,
            });
        } catch (error) {
            if (!error instanceof AppError) {
                console.log("Error at findAllUsers: " + error);
            }
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorCode: "SYS_001",
                message: "Error finding users",
            });
        }
    },

    updateUserRole: async (req, res) => {
        try {
            const { role } = req.body;
            const result = await UserService.updateUserRole(req.params.id, role);
            return res.status(HttpStatus.OK).json({
                message: "User role updated successfully",
                data: result,
            });
        } catch (error) {
            if (!error instanceof AppError) {
                console.log("Error at updateUserRole: " + error);
            }
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorCode: "SYS_001",
                message: "Error updating user role",
            });
        }
    },

    updateUserStatus: async (req, res) => {
        try {
            const { status } = req.body;
            const result = await UserService.updateUserStatus(req.params.id, status);
            return res.status(HttpStatus.OK).json({
                message: "User status updated successfully",
                data: result,
            });
        } catch (error) {
            if (!error instanceof AppError) {
                console.log("Error at updateUserStatus: " + error);
            }
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorCode: "SYS_001",
                message: "Error updating user status",
            });
        }
    },

    promoteToIssuer: async (req, res) => {
        try {
            const { organizationName, organizationCode } = req.body;
            const adminDid = await DidService.getDidByUserId(req.user);
            const result = await UserService.promoteToIssuer(req.params.id, organizationName, organizationCode, adminDid.did);
            return res.status(HttpStatus.OK).json({
                message: "User promoted to issuer successfully",
                data: result,
            });
        } catch (error) {
            if (!error instanceof AppError) {
                console.log("Error at promoteToIssuer: " + error);
            }
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorCode: "SYS_001",
                message: "Error promoting user to issuer",
            });
        }
    },

    demoteOrRevokeIssuer: async (req, res) => {
        try {
            const adminDid = await DidService.getDidByUserId(req.user);
            const result = await UserService.demoteOrRevokeIssuer(req.params.id, adminDid.did);
            return res.status(HttpStatus.OK).json({
                message: "User demoted to holder successfully",
                data: result,
            });
        } catch (error) {
            if (!error instanceof AppError) {
                console.log("Error at demoteOrRevokeIssuer: " + error);
            }
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorCode: "SYS_001",
                message: "Error demoting user",
            });
        }
    },
};

export default UserController;
