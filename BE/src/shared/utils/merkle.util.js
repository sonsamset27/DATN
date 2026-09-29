import { ethers } from 'ethers';
import crypto from 'crypto';

/**
 * Merkle Tree Utility for Selective Disclosure Verifiable Credentials.
 * Uses keccak256 with sorted pairs (OpenZeppelin standard) to construct deterministic Merkle trees.
 */
export class MerkleUtil {
    /**
     * Generate random 16-byte hex salts for each field in subject data.
     * @param {Object} subjectData - The key-value pairs of credentialSubject
     * @returns {Object} Mapping of fieldName -> saltHex
     */
    static generateSalts(subjectData) {
        const salts = {};
        for (const key of Object.keys(subjectData)) {
            salts[key] = crypto.randomBytes(16).toString('hex');
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
     * Combine two hashes in lexicographical order (sorted pairs) to prevent second pre-image attacks.
     */
    static combineHashes(h1, h2) {
        if (!h2) return h1;
        // Lexicographical sort
        const [left, right] = h1.toLowerCase() < h2.toLowerCase() ? [h1, h2] : [h2, h1];
        return ethers.keccak256(ethers.concat([left, right]));
    }

    /**
     * Build a full Merkle Tree from credentialSubject and its salts.
     * Keys are sorted alphabetically to guarantee deterministic tree structure.
     * @param {Object} subjectData 
     * @param {Object} salts 
     * @returns {Object} { root, leaves, keys, leafMap }
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

        // Build tree level by level
        let currentLevel = [...leaves];
        while (currentLevel.length > 1) {
            const nextLevel = [];
            for (let i = 0; i < currentLevel.length; i += 2) {
                if (i + 1 < currentLevel.length) {
                    nextLevel.push(this.combineHashes(currentLevel[i], currentLevel[i + 1]));
                } else {
                    // Odd number of leaves: promote the last leaf to the next level
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
     * Hidden keys only expose their leafHash (acting as cryptographic commitments).
     * @param {Object} subjectData - Full credentialSubject
     * @param {Object} salts - Full salts
     * @param {Array<string>} revealedKeys - Array of field keys holder chooses to reveal
     * @returns {Object} { revealed, salts, hidden, merkleRoot }
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
                // Keep only the leaf hash, hiding value and salt completely
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
     * Reconstructs all leaf hashes (from revealed fields and hidden commitments) and recomputes root.
     * @param {Object} packageData - { revealed, salts, hidden, merkleRoot }
     * @param {string} onChainHash - Expected root from blockchain
     * @returns {Object} { isValid, calculatedRoot, isRootMatch }
     */
    static verifySelectiveDisclosure(packageData, onChainHash) {
        const { revealed = {}, salts = {}, hidden = {}, merkleRoot } = packageData;
        const allKeys = [...new Set([...Object.keys(revealed), ...Object.keys(hidden)])].sort();

        const leaves = [];
        for (const key of allKeys) {
            if (revealed[key] !== undefined) {
                const salt = salts[key];
                if (!salt) {
                    return { isValid: false, error: `Missing salt for revealed key: ${key}` };
                }
                const leaf = this.hashField(key, revealed[key], salt);
                leaves.push(leaf);
            } else if (hidden[key] !== undefined) {
                // Hidden field commitment
                leaves.push(hidden[key]);
            }
        }

        if (leaves.length === 0) {
            return { isValid: false, error: 'No fields provided' };
        }

        // Recompute Merkle root
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
