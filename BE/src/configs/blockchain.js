import { ethers } from "ethers"
import env from "./env.js"

import DIDRegistry from "../contracts/DIDRegistry.json" with { type: "json" }
import CredentialRegistry from "../contracts/CredentialRegistry.json" with { type: "json" }

const { SEPOLIA_RPC_URL, SEPOLIA_PRIVATE_KEY, SEPOLIA_DID_CONTRACT_ADDRESS, SEPOLIA_CREDENTIAL_CONTRACT_ADDRESS } = env

const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL)

const wallet = new ethers.Wallet(SEPOLIA_PRIVATE_KEY, provider)

const didRegistry = new ethers.Contract(
    SEPOLIA_DID_CONTRACT_ADDRESS,
    DIDRegistry.abi,
    wallet
)

const credentialRegistry = new ethers.Contract(
    SEPOLIA_CREDENTIAL_CONTRACT_ADDRESS,
    CredentialRegistry.abi,
    wallet
)

export {
    provider,
    wallet,
    didRegistry,
    credentialRegistry
}
