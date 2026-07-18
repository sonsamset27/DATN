import AuthService from "./auth.service.js";
import AppError from "../../shared/errors/AppError.js";
import HttpStatus from "../../shared/errors/httpStatus.js";

const AuthController = {
    generateChallenge: async (req, res) => {
        try {
            const { walletAddress } = req.body;
            const message = await AuthService.generateChallenge(walletAddress);
            return res.status(HttpStatus.OK).json(message);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorCode: "SYS_001",
                message: "Failed to generate challenge",
            });
        }
    },

    verifySignature: async (req, res) => {
        try {
            const { walletAddress, signature } = req.body;
            const result = await AuthService.verifySignature(walletAddress, signature);
            return res.status(HttpStatus.OK).json({
                message: "Login successful",
                accessToken: result.accessToken,
                user: result.user,
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
                message: "Failed to verify signature",
            });
        }
    },
};

export default AuthController;
