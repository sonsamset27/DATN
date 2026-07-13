import { expect } from "chai";
import { network } from "hardhat";

describe("CredentialRegistry", function () {
    let didRegistry;
    let credentialRegistry;

    let owner;       // Người deploy contract (mặc định là admin)
    let issuer;      // Người sở hữu Issuer DID
    let holder;      // Người sở hữu Holder DID
    let backendWallet; // Ví phụ đóng vai trò Backend Relayer
    let stranger;    // Ví lạ không được phân quyền

    const issuerDid = "did:ethr:issuer";
    const holderDid = "did:ethr:holder";

    const issuerPk = "issuer-public-key";
    const holderPk = "holder-public-key";

    const algorithm = "Ed25519";
    const credentialId = "VC001";

    let credentialHash;
    let ethers;

    beforeEach(async function () {
        ({ ethers } = await network.connect());
        // Khởi tạo các ví test
        [owner, issuer, holder, backendWallet, stranger] = await ethers.getSigners();

        // Deploy Mock/Real DIDRegistry
        didRegistry = await ethers.deployContract("DIDRegistry");
        await didRegistry.waitForDeployment();

        // Deploy CredentialRegistry
        credentialRegistry = await ethers.deployContract(
            "CredentialRegistry",
            [await didRegistry.getAddress()]
        );
        await credentialRegistry.waitForDeployment();

        credentialHash = ethers.keccak256(ethers.toUtf8Bytes("credential"));

        // Đăng ký DID cho Issuer và Holder trên DIDRegistry
        await didRegistry.connect(issuer).registerDID(issuerDid, issuerPk, algorithm);
        await didRegistry.connect(holder).registerDID(holderDid, holderPk, algorithm);
    });

    describe("Ủy quyền Relayer (setRelayerStatus)", function () {
        it("Chỉ Admin mới có quyền cấp quyền cho Relayer", async function () {
            await expect(
                await credentialRegistry.connect(owner).setRelayerStatus(backendWallet.address, true)
            ).to.emit(credentialRegistry, "RelayerStatusChanged")
                .withArgs(backendWallet.address, true);

            expect(await credentialRegistry.authorizedRelayers(backendWallet.address)).to.equal(true);
        });

        it("Người lạ gọi setRelayerStatus phải bị revert", async function () {
            await expect(
                credentialRegistry.connect(stranger).setRelayerStatus(backendWallet.address, true)
            ).to.be.revertedWithCustomError(credentialRegistry, "NotAuthorizedSender");
        });
    });

    describe("issueCredential()", function () {
        it("Trường hợp 1: Issuer tự ký cấp bằng trực tiếp (Không qua relayer) phải thành công", async function () {
            const expires = (await ethers.provider.getBlock("latest")).timestamp + 3600;

            await expect(
                credentialRegistry.connect(issuer).issueCredential(
                    credentialId, credentialHash, issuerDid, holderDid, expires, algorithm
                )
            ).to.emit(credentialRegistry, "CredentialIssued")
                .withArgs(credentialId, issuerDid, holderDid);
        });

        it("Trường hợp 2: Ví Backend (được ủy quyền) ký gửi hộ Issuer phải thành công", async function () {
            const expires = (await ethers.provider.getBlock("latest")).timestamp + 3600;

            // Bước 1: Admin cấp quyền Relayer cho ví Backend trước
            await credentialRegistry.connect(owner).setRelayerStatus(backendWallet.address, true);

            // Bước 2: Ví Backend thay mặt gọi hàm (Mặc dù backendWallet không sở hữu issuerDid)
            await expect(
                credentialRegistry.connect(backendWallet).issueCredential(
                    credentialId, credentialHash, issuerDid, holderDid, expires, algorithm
                )
            ).to.emit(credentialRegistry, "CredentialIssued")
                .withArgs(credentialId, issuerDid, holderDid);
        });

        it("Trường hợp 3: Ví lạ (chưa ủy quyền) cố tình gọi hộ phải bị chặn (revert NotIssuerOwner)", async function () {
            const expires = (await ethers.provider.getBlock("latest")).timestamp + 3600;

            // Ví stranger không làm chủ DID, cũng không lọt danh sách trắng của hệ thống
            await expect(
                credentialRegistry.connect(stranger).issueCredential(
                    credentialId, credentialHash, issuerDid, holderDid, expires, algorithm
                )
            ).to.be.revertedWithCustomError(credentialRegistry, "NotIssuerOwner");
        });

        it("should revert if credential id is empty", async function () {
            const expires = (await ethers.provider.getBlock("latest")).timestamp + 3600;
            await expect(
                credentialRegistry.connect(issuer).issueCredential(
                    "", credentialHash, issuerDid, holderDid, expires, algorithm
                )
            ).to.be.revertedWithCustomError(credentialRegistry, "InvalidInput");
        });

        it("should revert if hash is empty", async function () {
            const expires = (await ethers.provider.getBlock("latest")).timestamp + 3600;
            await expect(
                credentialRegistry.connect(issuer).issueCredential(
                    credentialId, ethers.ZeroHash, issuerDid, holderDid, expires, algorithm
                )
            ).to.be.revertedWithCustomError(credentialRegistry, "InvalidInput");
        });

        it("should revert if expiresAt is in the past", async function () {
            const now = (await ethers.provider.getBlock("latest")).timestamp;
            await expect(
                credentialRegistry.connect(issuer).issueCredential(
                    credentialId, credentialHash, issuerDid, holderDid, now - 1, algorithm
                )
            ).to.be.revertedWithCustomError(credentialRegistry, "InvalidInput");
        });
    });

    describe("revokeCredential()", function () {
        beforeEach(async function () {
            const expires = (await ethers.provider.getBlock("latest")).timestamp + 3600;
            // Tạo sẵn một chứng chỉ bằng ví của issuer trước khi test thu hồi
            await credentialRegistry.connect(issuer).issueCredential(
                credentialId, credentialHash, issuerDid, holderDid, expires, algorithm
            );
        });

        it("Ví Backend (được ủy quyền) được phép thu hồi hộ bằng", async function () {
            // Cấp quyền cho ví backend
            await credentialRegistry.connect(owner).setRelayerStatus(backendWallet.address, true);

            await expect(
                credentialRegistry.connect(backendWallet).revokeCredential(credentialId)
            ).to.emit(credentialRegistry, "CredentialRevoked")
                .withArgs(credentialId);
        });

        it("Ví lạ gọi hàm thu hồi hộ phải bị báo lỗi NotIssuerOwner", async function () {
            await expect(
                credentialRegistry.connect(stranger).revokeCredential(credentialId)
            ).to.be.revertedWithCustomError(credentialRegistry, "NotIssuerOwner");
        });
    });
});
