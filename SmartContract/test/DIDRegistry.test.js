import { expect } from "chai";
import { network } from "hardhat";

describe("DIDRegistry", function () {
    let registry;
    let owner;
    let user1;
    let user2;

    const did = "did:ethr:0x123456";
    const publicKey = "public-key";
    const algorithm = "Ed25519";
    let ethers;

    beforeEach(async function () {
        ({ ethers } = await network.connect());
        [owner, user1, user2] = await ethers.getSigners();

        const DIDRegistry = await ethers.deployContract("DIDRegistry");
        await DIDRegistry.waitForDeployment();

        registry = DIDRegistry;
    });

    describe("registerDID()", function () {

        it("should register DID successfully", async function () {

            await expect(
                registry
                    .connect(user1)
                    .registerDID(did, publicKey, algorithm)
            )
                .to.emit(registry, "DIDRegistered")
                .withArgs(did, user1.address);

            const document = await registry.getDID(did);

            expect(document[0]).to.equal(did);
            expect(document[1]).to.equal(user1.address);
            expect(document[2]).to.equal(publicKey);
            expect(document[3]).to.equal(algorithm);
            expect(document[5]).to.equal(true);
        });

        it("should revert if DID is empty", async function () {
            await expect(
                registry
                    .connect(user1)
                    .registerDID("", publicKey, algorithm)
            ).to.be.revertedWithCustomError(
                registry,
                "InvalidInput"
            );
        });

        it("should revert if public key is empty", async function () {
            await expect(
                registry
                    .connect(user1)
                    .registerDID(did, "", algorithm)
            ).to.be.revertedWithCustomError(
                registry,
                "InvalidInput"
            );
        });

        it("should revert if algorithm is empty", async function () {
            await expect(
                registry
                    .connect(user1)
                    .registerDID(did, publicKey, "")
            ).to.be.revertedWithCustomError(
                registry,
                "InvalidInput"
            );
        });

        it("should revert if DID already exists", async function () {

            await registry
                .connect(user1)
                .registerDID(did, publicKey, algorithm);

            await expect(
                registry
                    .connect(user2)
                    .registerDID(did, "pk2", "RSA")
            ).to.be.revertedWithCustomError(
                registry,
                "DIDAlreadyExists"
            );
        });

        it("should revert if wallet already has DID", async function () {

            await registry
                .connect(user1)
                .registerDID(did, publicKey, algorithm);

            await expect(
                registry
                    .connect(user1)
                    .registerDID(
                        "did:ethr:0x999",
                        "pk2",
                        "RSA"
                    )
            ).to.be.revertedWithCustomError(
                registry,
                "WalletAlreadyHasDID"
            );
        });

    });

    describe("getDID()", function () {

        beforeEach(async function () {
            await registry
                .connect(user1)
                .registerDID(did, publicKey, algorithm);
        });

        it("should return correct DID document", async function () {

            const document = await registry.getDID(did);

            expect(document[0]).to.equal(did);
            expect(document[1]).to.equal(user1.address);
            expect(document[2]).to.equal(publicKey);
            expect(document[3]).to.equal(algorithm);
            expect(document[5]).to.equal(true);
        });

        it("should revert if DID is empty", async function () {

            await expect(
                registry.getDID("")
            ).to.be.revertedWithCustomError(
                registry,
                "InvalidInput"
            );
        });

        it("should revert if DID does not exist", async function () {

            await expect(
                registry.getDID("did:ethr:notfound")
            ).to.be.revertedWithCustomError(
                registry,
                "DIDNotFound"
            );
        });

    });

    describe("didExists()", function () {

        beforeEach(async function () {
            await registry
                .connect(user1)
                .registerDID(did, publicKey, algorithm);
        });

        it("should return true if DID exists", async function () {
            expect(await registry.didExists(did)).to.equal(true);
        });

        it("should return false if DID does not exist", async function () {
            expect(
                await registry.didExists("did:ethr:unknown")
            ).to.equal(false);
        });

        it("should revert if DID is empty", async function () {
            await expect(
                registry.didExists("")
            ).to.be.revertedWithCustomError(
                registry,
                "InvalidInput"
            );
        });

    });

    describe("getOwner()", function () {

        beforeEach(async function () {
            await registry
                .connect(user1)
                .registerDID(did, publicKey, algorithm);
        });

        it("should return correct owner", async function () {
            expect(
                await registry.getOwner(did)
            ).to.equal(user1.address);
        });

        it("should revert if DID is empty", async function () {
            await expect(
                registry.getOwner("")
            ).to.be.revertedWithCustomError(
                registry,
                "InvalidInput"
            );
        });

        it("should revert if DID not found", async function () {
            await expect(
                registry.getOwner("did:ethr:unknown")
            ).to.be.revertedWithCustomError(
                registry,
                "DIDNotFound"
            );
        });

    });

    describe("getDidByOwner()", function () {

        beforeEach(async function () {
            await registry
                .connect(user1)
                .registerDID(did, publicKey, algorithm);
        });

        it("should return DID of owner", async function () {
            expect(
                await registry.getDidByOwner(user1.address)
            ).to.equal(did);
        });

        it("should return empty string if owner has no DID", async function () {
            expect(
                await registry.getDidByOwner(user2.address)
            ).to.equal("");
        });

        it("should revert if owner is zero address", async function () {
            await expect(
                registry.getDidByOwner(
                    ethers.ZeroAddress
                )
            ).to.be.revertedWithCustomError(
                registry,
                "InvalidInput"
            );
        });

    });
});