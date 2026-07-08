import { provider, didRegistry, credentialRegistry } from "../../configs/blockchain.js";

export const checkBlockchainConnection = async () => {
    try {
        const network = await provider.getNetwork();

        const didCode = await provider.getCode(
            await didRegistry.getAddress()
        );

        const credentialCode = await provider.getCode(
            await credentialRegistry.getAddress()
        );

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