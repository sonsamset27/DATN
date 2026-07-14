import { provider, didRegistry, credentialRegistry } from "../../configs/blockchain.js";
const BlockchainService = {
    checkBlockchainConnection: async () => {
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
    },
    checkTxHash: async (txHash) => {
        try {
            const txReceipt = await provider.getTransactionReceipt(txHash);
            if (!txReceipt) {
                throw new Error("Tx hash not found");
            }
            if (txReceipt.status !== 1) {
                throw new Error("Tx hash failed");
            }
            return txReceipt;
        } catch (err) {
            throw err;
        }
    },
    getDataFromDidEvent: async (txReceipt, eventName) => {
        try {
            for (const log of txReceipt.logs) {
                try {
                    const parsedLog = didRegistry.interface.parseLog(log);
                    if (parsedLog && parsedLog.name === eventName) {
                        return parsedLog.args;
                    }
                } catch (e) {
                    continue;
                }
            }
            throw new Error(`Không tìm thấy sự kiện '${eventName}' trong giao dịch này.`);
        } catch (err) {
            throw err;
        }
    },
    getDataFromCredentialEvent: async (txReceipt, eventName) => {
        try {
            for (const log of txReceipt.logs) {
                try {
                    const parsedLog = credentialRegistry.interface.parseLog(log);
                    if (parsedLog && parsedLog.name === eventName) {
                        return parsedLog.args;
                    }
                } catch (e) {
                    continue;
                }
            }
            throw new Error(`Không tìm thấy sự kiện '${eventName}' trong giao dịch này.`);
        } catch (err) {
            throw err;
        }
    },
    getContractError: (error) => {
        try {
            // 1. Tìm xem lỗi trả về từ blockchain có chứa trường dữ liệu lỗi thô (data) không
            const errorData = error.data || (error.info && error.info.error && error.info.error.data);

            if (errorData) {
                // 2. Sử dụng interface của contract để giải mã chuỗi hex (ví dụ: 0x4b200d3f)
                const parsedError = didRegistry.interface.parseError(errorData);

                if (parsedError) {
                    // Trả về tên lỗi (ví dụ: "WalletAlreadyHasDID") và các tham số truyền vào lỗi nếu có
                    return {
                        errorName: parsedError.name,
                        args: parsedError.args
                    };
                }
            }
        } catch (parseErr) {
            // Phòng trường hợp không giải mã được (ví dụ lỗi lạ từ node RPC)
            return null;
        }
        return null;
    },
    getDID: async (did) => {
        try {
            const didDocument = await didRegistry.getDID(did);
            return didDocument;
        } catch (error) {
            throw error;
        }
    },
    issueCredential: async (data) => {
        try {
            const tx = await credentialRegistry.issueCredential(
                data.credentialId,
                data.credentialHash,
                data.issuerDid,
                data.holderDid,
                data.expiresAt,
                data.signatureAlgorithm
            );
            return tx;
        } catch (error) {
            throw error;
        }
    },
    setRelayerStatus: async (targetWalletAddress, isAuthorized) => {
        try {
            // credentialRegistryContract phải được khởi tạo bằng ví Admin (ví deploy contract)
            const tx = await credentialRegistry.setRelayerStatus(
                targetWalletAddress,
                isAuthorized
            );
            return tx;
        } catch (error) {
            console.error("Lỗi gọi hàm setRelayerStatus lên Smart Contract:", error);
            throw error;
        }
    },
    getCredentialHash: async (credentialId) => {
        try {
            const credentialHash = await credentialRegistry.getCredentialHash(credentialId);
            return credentialHash;
        } catch (error) {
            throw error;
        }
    }
}

export default BlockchainService;