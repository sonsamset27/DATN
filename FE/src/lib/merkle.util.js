import { ethers } from 'ethers';

/**
 * Frontend Merkle Tree Utility for Selective Disclosure Verifiable Credentials.
 * Compatible with Backend MerkleUtil.
 */
export class MerkleUtil {
    /**
     * Generate random 16-byte hex salts using browser Web Crypto API.
     */
    static generateSalts(subjectData) {
        const salts = {};
        for (const key of Object.keys(subjectData)) {
            const randomBytes = new Uint8Array(16);
            window.crypto.getRandomValues(randomBytes);
            salts[key] = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        return salts;
    }

    /**
     * Compute a single leaf hash for a field with key, value, and salt.
     * Leaf = keccak256(utf8Bytes(`${key}:${val}:${salt}`))
     */
    static hashField(key, value, salt) {
        const strVal = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);
        const leafContent = `${key}:${strVal}:${salt}`;
        return ethers.keccak256(ethers.toUtf8Bytes(leafContent));
    }

    /**
     * Combine two hashes in lexicographical order (sorted pairs).
     */
    static combineHashes(h1, h2) {
        if (!h2) return h1;
        const [left, right] = h1.toLowerCase() < h2.toLowerCase() ? [h1, h2] : [h2, h1];
        return ethers.keccak256(ethers.concat([left, right]));
    }

    /**
     * Build a full Merkle Tree from credentialSubject and its salts.
     */
    static buildMerkleTree(subjectData, salts) {
        const keys = Object.keys(subjectData).sort();
        const leafMap = {};
        const leaves = [];

        for (const key of keys) {
            const salt = salts[key] || '';
            const leaf = this.hashField(key, subjectData[key], salt);
            leafMap[key] = leaf;
            leaves.push(leaf);
        }

        if (leaves.length === 0) {
            return {
                root: ethers.ZeroHash,
                leaves: [],
                keys: [],
                leafMap: {},
            };
        }

        let currentLevel = [...leaves];
        while (currentLevel.length > 1) {
            const nextLevel = [];
            for (let i = 0; i < currentLevel.length; i += 2) {
                if (i + 1 < currentLevel.length) {
                    nextLevel.push(this.combineHashes(currentLevel[i], currentLevel[i + 1]));
                } else {
                    nextLevel.push(currentLevel[i]);
                }
            }
            currentLevel = nextLevel;
        }

        return {
            root: currentLevel[0],
            leaves,
            keys,
            leafMap,
        };
    }

    /**
     * Create a Selective Disclosure package where only revealedKeys are exposed.
     */
    static generateSelectiveDisclosure(subjectData, salts, revealedKeys) {
        const { root: merkleRoot, leafMap } = this.buildMerkleTree(subjectData, salts);
        const revealedSet = new Set(revealedKeys);

        const revealed = {};
        const revealedSalts = {};
        const hidden = {};

        for (const key of Object.keys(subjectData)) {
            if (revealedSet.has(key)) {
                revealed[key] = subjectData[key];
                revealedSalts[key] = salts[key];
            } else {
                hidden[key] = leafMap[key];
            }
        }

        return {
            revealed,
            salts: revealedSalts,
            hidden,
            merkleRoot,
        };
    }

    /**
     * Verify a Selective Disclosure package against an expected Merkle Root.
     */
    static verifySelectiveDisclosure(packageData, onChainHash) {
        const { revealed = {}, salts = {}, hidden = {}, merkleRoot } = packageData;
        const allKeys = [...new Set([...Object.keys(revealed), ...Object.keys(hidden)])].sort();

        const leaves = [];
        for (const key of allKeys) {
            if (revealed[key] !== undefined) {
                const salt = salts[key];
                if (!salt) {
                    return { isValid: false, error: `Thiếu mã muối (salt) cho trường: ${key}` };
                }
                const leaf = this.hashField(key, revealed[key], salt);
                leaves.push(leaf);
            } else if (hidden[key] !== undefined) {
                leaves.push(hidden[key]);
            }
        }

        if (leaves.length === 0) {
            return { isValid: false, error: 'Không có dữ liệu trường nào được cung cấp' };
        }

        let currentLevel = [...leaves];
        while (currentLevel.length > 1) {
            const nextLevel = [];
            for (let i = 0; i < currentLevel.length; i += 2) {
                if (i + 1 < currentLevel.length) {
                    nextLevel.push(this.combineHashes(currentLevel[i], currentLevel[i + 1]));
                } else {
                    nextLevel.push(currentLevel[i]);
                }
            }
            currentLevel = nextLevel;
        }

        const calculatedRoot = currentLevel[0];
        const isRootMatch = calculatedRoot.toLowerCase() === merkleRoot.toLowerCase();
        const isOnChainMatch = onChainHash
            ? calculatedRoot.toLowerCase() === onChainHash.toLowerCase()
            : true;

        return {
            isValid: isRootMatch && isOnChainMatch,
            calculatedRoot,
            expectedRoot: merkleRoot,
            onChainHash: onChainHash || null,
            isRootMatch,
            isOnChainMatch,
        };
    }
}
