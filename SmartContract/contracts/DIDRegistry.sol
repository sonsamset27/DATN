// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DIDRegistry {
    error DIDAlreadyExists();
    error WalletAlreadyHasDID();
    error DIDNotFound();
    error InvalidInput();

    struct DIDDocument {
        string did;
        address owner;
        string publicKey;
        string keyAlgorithm;
        uint256 createdAt;
        bool exists;
    }

    mapping(string => DIDDocument) private dids;
    mapping(address => string) private ownerToDid;

    event DIDRegistered(
        string did,
        address owner
    );

    function registerDID(
        string calldata did,
        string calldata publicKey,
        string calldata keyAlgorithm
    ) external {
        if (
            bytes(did).length == 0 ||
            bytes(publicKey).length == 0 ||
            bytes(keyAlgorithm).length == 0
        ) {
            revert InvalidInput();
        }
        if (dids[did].exists) {
            revert DIDAlreadyExists();
        }

        if (bytes(ownerToDid[msg.sender]).length != 0) {
            revert WalletAlreadyHasDID();
        }

        dids[did] = DIDDocument({
            did: did,
            owner: msg.sender,
            publicKey: publicKey,
            keyAlgorithm: keyAlgorithm,
            createdAt: block.timestamp,
            exists: true
        });

        ownerToDid[msg.sender] = did;

        emit DIDRegistered(did, msg.sender);
    }

    function getDID(string calldata did) external view returns (
            string memory,
            address,
            string memory,
            string memory,
            uint256,
            bool
        )
    {
        if (bytes(did).length == 0) {
            revert InvalidInput();
        }
        DIDDocument memory document = dids[did];

        if (!document.exists) {
            revert DIDNotFound();
        }

        return (
            document.did,
            document.owner,
            document.publicKey,
            document.keyAlgorithm,
            document.createdAt,
            document.exists
        );
    }

    function didExists(string calldata did) external view returns (bool) {
        if (bytes(did).length == 0) {
            revert InvalidInput();
        }
        return dids[did].exists;
    }

    function getOwner(string calldata did) external view returns (address) {
        if (bytes(did).length == 0) {
            revert InvalidInput();
        }
        DIDDocument memory document = dids[did];

        if (!document.exists) {
            revert DIDNotFound();
        }

        return document.owner;
    }

    function getDidByOwner(address owner) external view returns (string memory) {
        if (owner == address(0)) {
            revert InvalidInput();
        }
        return ownerToDid[owner];
    }
}
