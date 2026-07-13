import dotenv from "dotenv"
dotenv.config()

export default {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL,
    SEPOLIA_PRIVATE_KEY: process.env.SEPOLIA_PRIVATE_KEY,
    SEPOLIA_DID_CONTRACT_ADDRESS: process.env.SEPOLIA_DID_CONTRACT_ADDRESS,
    SEPOLIA_CREDENTIAL_CONTRACT_ADDRESS: process.env.SEPOLIA_CREDENTIAL_CONTRACT_ADDRESS,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    PINATA_API_KEY: process.env.PINATA_API_KEY,
    PINATA_API_SECRET: process.env.PINATA_API_SECRET,
    PINATA_JWT: process.env.PINATA_JWT,
    PINATA_GATEWAY_URL: process.env.PINATA_GATEWAY_URL,
}