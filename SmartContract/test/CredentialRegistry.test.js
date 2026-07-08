import { expect } from "chai";
import { network } from "hardhat";

describe("CredentialRegistry", function () {
    let didRegistry;
    let credentialRegistry;

    let owner;
    let issuer;
    let holder;
    let other;

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
        [owner, issuer, holder, other] = await ethers.getSigners();

        didRegistry = await ethers.deployContract("DIDRegistry");
        await didRegistry.waitForDeployment();

        credentialRegistry = await ethers.deployContract(
            "CredentialRegistry",
            [await didRegistry.getAddress()]
        );

        credentialHash = ethers.keccak256(
            ethers.toUtf8Bytes("credential")
        );

        await credentialRegistry.waitForDeployment();

        await didRegistry
            .connect(issuer)
            .registerDID(
                issuerDid,
                issuerPk,
                algorithm
            );

        await didRegistry
            .connect(holder)
            .registerDID(
                holderDid,
                holderPk,
                algorithm
            );
    });

    describe("issueCredential()", function () {

        it("should issue credential successfully", async function () {

            const expires =
                (await ethers.provider.getBlock("latest")).timestamp +
                3600;

            await expect(
                credentialRegistry
                    .connect(issuer)
                    .issueCredential(
                        credentialId,
                        credentialHash,
                        issuerDid,
                        holderDid,
                        expires,
                        algorithm
                    )
            )
                .to.emit(
                    credentialRegistry,
                    "CredentialIssued"
                )
                .withArgs(
                    credentialId,
                    issuerDid,
                    holderDid
                );

            const credential =
                await credentialRegistry.getCredential(
                    credentialId
                );

            expect(credential[0]).to.equal(
                credentialId
            );

            expect(credential[1]).to.equal(
                credentialHash
            );

            expect(credential[2]).to.equal(
                issuerDid
            );

            expect(credential[3]).to.equal(
                holderDid
            );

            expect(credential[7]).to.equal(0);

            expect(credential[8]).to.equal(
                algorithm
            );

            expect(credential[9]).to.equal(
                true
            );
        });

        it("should revert if credential id is empty", async function () {

            const expires =
                (await ethers.provider.getBlock("latest")).timestamp +
                3600;

            await expect(
                credentialRegistry
                    .connect(issuer)
                    .issueCredential(
                        "",
                        credentialHash,
                        issuerDid,
                        holderDid,
                        expires,
                        algorithm
                    )
            ).to.be.revertedWithCustomError(
                credentialRegistry,
                "InvalidInput"
            );
        });

        it("should revert if hash is empty", async function () {

            const expires =
                (await ethers.provider.getBlock("latest")).timestamp +
                3600;

            await expect(
                credentialRegistry
                    .connect(issuer)
                    .issueCredential(
                        credentialId,
                        ethers.ZeroHash,
                        issuerDid,
                        holderDid,
                        expires,
                        algorithm
                    )
            ).to.be.revertedWithCustomError(
                credentialRegistry,
                "InvalidInput"
            );
        });

        it("should revert if issuer DID is empty", async function () {

            const expires =
                (await ethers.provider.getBlock("latest")).timestamp +
                3600;

            await expect(
                credentialRegistry
                    .connect(issuer)
                    .issueCredential(
                        credentialId,
                        credentialHash,
                        "",
                        holderDid,
                        expires,
                        algorithm
                    )
            ).to.be.revertedWithCustomError(
                credentialRegistry,
                "InvalidInput"
            );
        });

        it("should revert if holder DID is empty", async function () {

            const expires =
                (await ethers.provider.getBlock("latest")).timestamp +
                3600;

            await expect(
                credentialRegistry
                    .connect(issuer)
                    .issueCredential(
                        credentialId,
                        credentialHash,
                        issuerDid,
                        "",
                        expires,
                        algorithm
                    )
            ).to.be.revertedWithCustomError(
                credentialRegistry,
                "InvalidInput"
            );
        });

        it("should revert if signature algorithm is empty", async function () {

            const expires =
                (await ethers.provider.getBlock("latest")).timestamp +
                3600;

            await expect(
                credentialRegistry
                    .connect(issuer)
                    .issueCredential(
                        credentialId,
                        credentialHash,
                        issuerDid,
                        holderDid,
                        expires,
                        ""
                    )
            ).to.be.revertedWithCustomError(
                credentialRegistry,
                "InvalidInput"
            );
        });

        it("should revert if expiresAt is in the past", async function () {

            const now =
                (await ethers.provider.getBlock("latest")).timestamp;

            await expect(
                credentialRegistry
                    .connect(issuer)
                    .issueCredential(
                        credentialId,
                        credentialHash,
                        issuerDid,
                        holderDid,
                        now - 1,
                        algorithm
                    )
            ).to.be.revertedWithCustomError(
                credentialRegistry,
                "InvalidInput"
            );
        });

        it("should revert if issuer DID not found", async function () {

            const expires =
                (await ethers.provider.getBlock("latest")).timestamp +
                3600;

            await expect(
                credentialRegistry
                    .connect(issuer)
                    .issueCredential(
                        credentialId,
                        credentialHash,
                        "unknown",
                        holderDid,
                        expires,
                        algorithm
                    )
            ).to.be.revertedWithCustomError(
                credentialRegistry,
                "IssuerDIDNotFound"
            );
        });

        it("should revert if holder DID not found", async function () {

            const expires =
                (await ethers.provider.getBlock("latest")).timestamp +
                3600;

            await expect(
                credentialRegistry
                    .connect(issuer)
                    .issueCredential(
                        credentialId,
                        credentialHash,
                        issuerDid,
                        "unknown",
                        expires,
                        algorithm
                    )
            ).to.be.revertedWithCustomError(
                credentialRegistry,
                "HolderDIDNotFound"
            );
        });

        it("should revert if sender is not issuer owner", async function () {

            const expires =
                (await ethers.provider.getBlock("latest")).timestamp +
                3600;

            await expect(
                credentialRegistry
                    .connect(other)
                    .issueCredential(
                        credentialId,
                        credentialHash,
                        issuerDid,
                        holderDid,
                        expires,
                        algorithm
                    )
            ).to.be.revertedWithCustomError(
                credentialRegistry,
                "NotIssuerOwner"
            );
        });

        it("should revert if credential already exists", async function () {

            const expires =
                (await ethers.provider.getBlock("latest")).timestamp +
                3600;

            await credentialRegistry
                .connect(issuer)
                .issueCredential(
                    credentialId,
                    credentialHash,
                    issuerDid,
                    holderDid,
                    expires,
                    algorithm
                );

            await expect(
                credentialRegistry
                    .connect(issuer)
                    .issueCredential(
                        credentialId,
                        credentialHash,
                        issuerDid,
                        holderDid,
                        expires,
                        algorithm
                    )
            ).to.be.revertedWithCustomError(
                credentialRegistry,
                "CredentialAlreadyExists"
            );
        });

    });

    describe("revokeCredential()", function () {

        beforeEach(async function () {

            const expires =
                (await ethers.provider.getBlock("latest")).timestamp +
                3600;

            await credentialRegistry
                .connect(issuer)
                .issueCredential(
                    credentialId,
                    credentialHash,
                    issuerDid,
                    holderDid,
                    expires,
                    algorithm
                );
        });

        it("should revoke credential", async function () {

            await expect(
                credentialRegistry
                    .connect(issuer)
                    .revokeCredential(
                        credentialId
                    )
            )
                .to.emit(
                    credentialRegistry,
                    "CredentialRevoked"
                )
                .withArgs(
                    credentialId
                );

            const credential =
                await credentialRegistry.getCredential(
                    credentialId
                );

            expect(credential[7]).to.equal(1);
        });

        it("should revert if credential already revoked", async function () {

            await credentialRegistry
                .connect(issuer)
                .revokeCredential(
                    credentialId
                );

            await expect(
                credentialRegistry
                    .connect(issuer)
                    .revokeCredential(
                        credentialId
                    )
            ).to.be.revertedWithCustomError(
                credentialRegistry,
                "CredentialAlreadyRevoked"
            );
        });

        it("should revert if credential not found", async function () {

            await expect(
                credentialRegistry
                    .connect(issuer)
                    .revokeCredential(
                        "unknown"
                    )
            ).to.be.revertedWithCustomError(
                credentialRegistry,
                "CredentialNotFound"
            );
        });

        it("should revert if sender is not issuer", async function () {

            await expect(
                credentialRegistry
                    .connect(holder)
                    .revokeCredential(
                        credentialId
                    )
            ).to.be.revertedWithCustomError(
                credentialRegistry,
                "NotIssuerOwner"
            );
        });

    });

    describe("getCredential()", function () {

        it("should revert if credential not found", async function () {

            await expect(
                credentialRegistry.getCredential(
                    "abc"
                )
            ).to.be.revertedWithCustomError(
                credentialRegistry,
                "CredentialNotFound"
            );
        });

        it("should revert if id is empty", async function () {

            await expect(
                credentialRegistry.getCredential(
                    ""
                )
            ).to.be.revertedWithCustomError(
                credentialRegistry,
                "InvalidInput"
            );
        });

    });

    describe("credentialExists()", function () {

        it("should return false", async function () {

            expect(
                await credentialRegistry.credentialExists(
                    credentialId
                )
            ).to.equal(false);
        });

    });

    describe("getCredentialHash()", function () {

        it("should revert if credential not found", async function () {

            await expect(
                credentialRegistry.getCredentialHash(
                    credentialId
                )
            ).to.be.revertedWithCustomError(
                credentialRegistry,
                "CredentialNotFound"
            );
        });

    });

});