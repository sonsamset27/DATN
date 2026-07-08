import { network } from "hardhat";

async function main() {

    const { ethers } = await network.connect();

    console.log("Deploying DIDRegistry...");

    const didRegistry = await ethers.deployContract("DIDRegistry");

    await didRegistry.waitForDeployment();

    const didAddress = await didRegistry.getAddress();

    console.log("DIDRegistry:", didAddress);

    console.log("Deploying CredentialRegistry...");

    const credentialRegistry =
        await ethers.deployContract(
            "CredentialRegistry",
            [didAddress]
        );

    await credentialRegistry.waitForDeployment();

    const credentialAddress =
        await credentialRegistry.getAddress();

    console.log("CredentialRegistry:", credentialAddress);

    console.log("-------------------------");
    console.log("Deployment completed");
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 