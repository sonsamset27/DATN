import pinata from "../../configs/pinata.js";

const PinataService = {
    pinJsonToIpfs: async (jsonData) => {
        try {
            const result = await pinata.upload.public.json(jsonData);

            return result.cid;
        } catch (error) {
            throw error;
        }
    }
}

export default PinataService;