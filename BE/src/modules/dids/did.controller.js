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
    }
}

export default DidController;