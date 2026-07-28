export const CREDENTIAL_REGISTRY_ADDRESS = "0x9cD00eEa06267bcaEc67E44dA7094CEe70E55894";

export const CREDENTIAL_REGISTRY_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "credentialId", "type": "string" },
      { "internalType": "bytes32", "name": "credentialHash", "type": "bytes32" },
      { "internalType": "string", "name": "issuerDid", "type": "string" },
      { "internalType": "string", "name": "holderDid", "type": "string" },
      { "internalType": "uint256", "name": "expiresAt", "type": "uint256" },
      { "internalType": "string", "name": "signatureAlgorithm", "type": "string" }
    ],
    "name": "issueCredential",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "credentialId", "type": "string" }
    ],
    "name": "revokeCredential",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "credentialId", "type": "string" }
    ],
    "name": "getCredentialHash",
    "outputs": [
      { "internalType": "bytes32", "name": "", "type": "bytes32" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
