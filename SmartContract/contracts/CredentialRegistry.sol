// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./interfaces/IDIDRegistry.sol";

contract CredentialRegistry {
    error CredentialAlreadyExists();
    error CredentialNotFound();
    error CredentialAlreadyRevoked();
    error IssuerDIDNotFound();
    error HolderDIDNotFound();
    error NotIssuerOwner();
    error InvalidInput();

    IDIDRegistry public didRegistry;

    enum Status {
        ACTIVE,
        REVOKED
    }

    struct CredentialRecord {
        string credentialId;
        bytes32 credentialHash;
        string issuerDid;
        string holderDid;
        uint256 issuedAt;
        uint256 expiresAt;
        uint256 revokedAt;
        Status status;
        string signatureAlgorithm;
        bool exists;
    }

    mapping(string => CredentialRecord)
        private credentials;

    event CredentialIssued(
        string credentialId,
        string issuerDid,
        string holderDid
    );

    event CredentialRevoked(
        string credentialId
    );

    constructor(address didRegistryAddress) {
        didRegistry = IDIDRegistry(didRegistryAddress);
    }

    function issueCredential(
        string calldata credentialId,
        bytes32 credentialHash,
        string calldata issuerDid,
        string calldata holderDid,
        uint256 expiresAt,
        string calldata signatureAlgorithm
    ) external {
        if (
            bytes(credentialId).length == 0 ||
            credentialHash == bytes32(0) ||
            bytes(issuerDid).length == 0 ||
            bytes(holderDid).length == 0 ||
            bytes(signatureAlgorithm).length == 0
        ) {
            revert InvalidInput();
        }
        if (expiresAt != 0 && expiresAt <= block.timestamp) {
            revert InvalidInput();
        }
        if (credentials[credentialId].exists) {
            revert CredentialAlreadyExists();
        }
        if (!didRegistry.didExists(issuerDid)) {
            revert IssuerDIDNotFound();
        }
        if (!didRegistry.didExists(holderDid)) {
            revert HolderDIDNotFound();
        }
        if (didRegistry.getOwner(issuerDid) != msg.sender) {
            revert NotIssuerOwner();
        }

        credentials[credentialId] = CredentialRecord({
            credentialId: credentialId,
            credentialHash: credentialHash,
            issuerDid: issuerDid,
            holderDid: holderDid,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            revokedAt: 0,
            status: Status.ACTIVE,
            signatureAlgorithm: signatureAlgorithm,
            exists: true
        });
        emit CredentialIssued(
            credentialId,
            issuerDid,
            holderDid
        );
    }

    function revokeCredential(string calldata credentialId) external {
        CredentialRecord storage credential = credentials[credentialId];

        if (bytes(credentialId).length == 0) {
            revert InvalidInput();
        }
        if (!credential.exists) {
            revert CredentialNotFound();
        }
        if (credential.status == Status.REVOKED) {
            revert CredentialAlreadyRevoked();
        }
        if (didRegistry.getOwner(credential.issuerDid) != msg.sender) {
            revert NotIssuerOwner();
        }

        credential.status = Status.REVOKED;
        credential.revokedAt = block.timestamp;

        emit CredentialRevoked(credentialId);
    }

    function getCredential(string calldata credentialId) external view returns (
            string memory,
            bytes32,
            string memory,
            string memory,
            uint256,
            uint256,
            uint256,
            Status,
            string memory,
            bool
        ){
        if (bytes(credentialId).length == 0) {
            revert InvalidInput();
        }
        if (!credentials[credentialId].exists) {
            revert CredentialNotFound();
        }
        CredentialRecord memory credential = credentials[credentialId];

        return (
            credential.credentialId,
            credential.credentialHash,
            credential.issuerDid,
            credential.holderDid,
            credential.issuedAt,
            credential.expiresAt,
            credential.revokedAt,
            credential.status,
            credential.signatureAlgorithm,
            credential.exists
        );
    }

    function credentialExists(string calldata credentialId) external view returns (bool) {
        if (bytes(credentialId).length == 0) {
            revert InvalidInput();
        }
        return credentials[credentialId].exists;
    }
    function getCredentialHash(string calldata credentialId) external view returns (bytes32) {
        if (bytes(credentialId).length == 0) {
            revert InvalidInput();
        }
        if (!credentials[credentialId].exists) {
            revert CredentialNotFound();
    }
    return credentials[credentialId].credentialHash;
}
}