import { provider, didRegistry, credentialRegistry } from "../../configs/blockchain.js";
import env from "../../configs/env.js";

const { SEPOLIA_DID_CONTRACT_ADDRESS, SEPOLIA_CREDENTIAL_CONTRACT_ADDRESS } = env;

export const checkBlockchainConnection = async () => {
    try {
        const network = await provider.getNetwork();

        const didCode = await provider.getCode(SEPOLIA_DID_CONTRACT_ADDRESS);

        const credentialCode = await provider.getCode(SEPOLIA_CREDENTIAL_CONTRACT_ADDRESS);

        return {
            connected: true,
            chainId: Number(network.chainId),
            didRegistry: didCode !== "0x",
            credentialRegistry: credentialCode !== "0x"
        };
    } catch (err) {
        return {
            connected: false,
            error: err.message
        };
    }
}