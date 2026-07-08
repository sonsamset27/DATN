import dotenv from "dotenv"
dotenv.config()

export default {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL,
    SEPOLIA_PRIVATE_KEY: process.env.SEPOLIA_PRIVATE_KEY,
    SEPOLIA_DID_CONTRACT_ADDRESS: process.env.SEPOLIA_DID_CONTRACT_ADDRESS,
    SEPOLIA_CREDENTIAL_CONTRACT_ADDRESS: process.env.SEPOLIA_CREDENTIAL_CONTRACT_ADDRESS,
}