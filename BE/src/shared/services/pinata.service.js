import pinata from "../../configs/pinata.js";
import axios from "axios";
import env from "../../configs/env.js";

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
            let gateway = env.PINATA_GATEWAY_URL.trim();
            if (!gateway.startsWith("http://") && !gateway.startsWith("https://")) {
                gateway = `https://${gateway}`;
            }
            gateway = gateway.replace(/\/$/, "");
            const response = await axios.get(`${gateway}/ipfs/${cid}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default PinataService;