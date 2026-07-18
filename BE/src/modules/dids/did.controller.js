import DidService from "./did.service.js";
import AppError from "../../shared/errors/AppError.js";
import HttpStatus from "../../shared/errors/httpStatus.js";

const DidController = {
    prepareCreateDid: async (req, res) => {
        try {
            const message = await DidService.prepareCreateDid(req.user);
            return res.status(HttpStatus.OK).json({
                message: "Create DID message prepared successfully",
                data: message,
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorCode: "SYS_001",
                message: "Error preparing create DID message",
            });
        }
    },

    registerDid: async (req, res) => {
        try {
            const { txHash } = req.body;
            const result = await DidService.registerDid(req.user, txHash);
            return res.status(HttpStatus.CREATED).json({
                message: "DID registered successfully",
                data: result,
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorCode: "SYS_001",
                message: "Error registering DID",
            });
        }
    },

    getDidByUserId: async (req, res) => {
        try {
            const result = await DidService.getDidByUserId(req.user);
            return res.status(HttpStatus.OK).json({
                message: "DID fetched successfully",
                data: result,
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorCode: "SYS_001",
                message: "Error fetching DID",
            });
        }
    },

    getDidByAddress: async (req, res) => {
        try {
            const address = req.body.walletAddress;
            const result = await DidService.getDidByAddress(address);
            return res.status(HttpStatus.OK).json({
                message: "DID fetched successfully",
                data: result,
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorCode: "SYS_001",
                message: "Error fetching DID by address",
            });
        }
    },
};

export default DidController;