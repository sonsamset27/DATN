import DidService from "./did.service.js";

const DidController = {
    prepareCreateDid: async (req, res) => {
        try {
            const message = await DidService.prepareCreateDid(req.user);
            res.status(200).json({
                status: 200,
                message: "Create DID message prepared successfully",
                data: message
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: "Error preparing create DID message",
                error: error.message
            });
        }
    },
    registerDid: async (req, res) => {
        try {
            const { txHash } = req.body;
            const message = await DidService.registerDid(req.user, txHash);
            res.status(200).json({
                status: 200,
                message: "DID registered successfully",
                data: message
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: "Error register DID",
                error: error.message
            });
        }
    }
}

export default DidController;