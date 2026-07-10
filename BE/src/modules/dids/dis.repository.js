import DidModel from "./did.model.js";

const DidRepository = {
    createDid: async (didData) => {
        return await DidModel.create(didData);
    },
    getDidByUserId: async (userId) => {
        return await DidModel.findOne({ ownerId: userId });
    }
}

export default DidRepository;