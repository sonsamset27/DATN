import pinata from "../../configs/pinata.js";

const PinataService = {
    pinJsonToIpfs: async (jsonData) => {
        try {
            const result = await pinata.upload.public.json(jsonData);

            return result.cid;
        } catch (error) {
            throw error;
        }
    },
    readJsonFromIpfs: async (cid) => {
        try {
            const result = await pinata.download.public.json(cid);
            return result;
        } catch (error) {
            throw error;
        }
    }
}

export default PinataService;