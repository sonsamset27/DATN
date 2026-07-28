export const DID_REGISTRY_ADDRESS = "0xDf984bd126fbAc373064CeE56bC0AF3b741A29B0";

export const DID_REGISTRY_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "did", "type": "string" },
      { "internalType": "string", "name": "publicKey", "type": "string" },
      { "internalType": "string", "name": "keyAlgorithm", "type": "string" }
    ],
    "name": "registerDID",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "did", "type": "string" }
    ],
    "name": "getDID",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
