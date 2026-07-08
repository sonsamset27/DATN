import { isAddress, getAddress } from "ethers";

const isValidWalletAddress = (walletAddress) => {
    if (!walletAddress) {
        return false;
    }
    return isAddress(walletAddress);
};

const normalizeWalletAddress = (walletAddress) => {
    return getAddress(walletAddress);
};

const compareWalletAddress = (wallet1, wallet2) => {
    if (!isAddress(wallet1) || !isAddress(wallet2)) {
        return false;
    }

    return (
        normalizeWalletAddress(wallet1) === normalizeWalletAddress(wallet2)
    );
};
const validateAndNormalizeWallet = (walletAddress) => {
    if (!isAddress(walletAddress)) {
        throw new Error("Invalid wallet address");
    }

    return getAddress(walletAddress);
};

export {
    isValidWalletAddress,
    normalizeWalletAddress,
    compareWalletAddress,
    validateAndNormalizeWallet
};