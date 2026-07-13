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
    // Khi ví gọi hàm không có quyền Admin hoặc không được ủy quyền
    error NotAuthorizedSender(); 

    IDIDRegistry public didRegistry;
    
    // Địa chỉ Admin (người deploy contract) để quản lý danh sách ví Backend
    address public admin; 
    
    // Mapping lưu danh sách các ví Backend được phép chạy hộ người dùng
    mapping(address => bool) public authorizedRelayers;

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

    mapping(string => CredentialRecord) private credentials;

    event CredentialIssued(string credentialId, string issuerDid, string holderDid);
    event CredentialRevoked(string credentialId);
    //  Ghi vết khi thêm/xóa ví Backend
    event RelayerStatusChanged(address relayer, bool isAuthorized); 

    // Chỉ cho phép Admin gọi
    modifier onlyAdmin() {
        if (msg.sender != admin) {
            revert NotAuthorizedSender();
        }
        _;
    }

    constructor(address didRegistryAddress) {
        didRegistry = IDIDRegistry(didRegistryAddress);
        admin = msg.sender; // Người deploy mặc định là Admin
        authorizedRelayers[msg.sender] = true; // Mặc định Admin cũng là một người gửi hợp lệ
    }

    //  Thêm hoặc hủy quyền của ví Backend (Chỉ Admin được gọi)
    function setRelayerStatus(address _relayer, bool _isAuthorized) external onlyAdmin {
        authorizedRelayers[_relayer] = _isAuthorized;
        emit RelayerStatusChanged(_relayer, _isAuthorized);
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

        // Giao dịch hợp lệ NẾU: Ví gửi (msg.sender) là chủ sở hữu DID HOẶC Ví gửi nằm trong danh sách Backend được ủy quyền
        bool isOwner = (didRegistry.getOwner(issuerDid) == msg.sender);
        bool isAuthorizedBackend = authorizedRelayers[msg.sender];
        
        if (!isOwner && !isAuthorizedBackend) {
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
        emit CredentialIssued(credentialId, issuerDid, holderDid);
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

        // Cho phép ví Backend có quyền thu hồi hộ chứng chỉ
        bool isOwner = (didRegistry.getOwner(credential.issuerDid) == msg.sender);
        bool isAuthorizedBackend = authorizedRelayers[msg.sender];
        if (!isOwner && !isAuthorizedBackend) {
            revert NotIssuerOwner();
        }

        credential.status = Status.REVOKED;
        credential.revokedAt = block.timestamp;

        emit CredentialRevoked(credentialId);
    }

    function getCredential(string calldata credentialId) external view returns (string memory, bytes32, string memory, string memory, uint256, uint256, uint256, Status, string memory, bool) {
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
