import { network } from "hardhat";

async function main() {
    // Sử dụng getOrCreate() theo chuẩn mới nhất của Hardhat để tránh cảnh báo lỗi thời
    const { ethers } = await network.getOrCreate();
    const [deployer] = await ethers.getSigners();

    console.log("=========================================");
    console.log("Ví thực hiện deploy hợp đồng:", deployer.address);
    console.log("=========================================");

    // 1. ĐIỀN ĐỊA CHỈ DIDREGISTRY CŨ ĐÃ CÓ CỦA BẠN VÀO ĐÂY
    const oldDidRegistryAddress = "0xDf984bd126fbAc373064CeE56bC0AF3b741A29B0";
    console.log("Liên kết với DIDRegistry cũ tại địa chỉ:", oldDidRegistryAddress);

    console.log("-----------------------------------------");

    // 2. Chỉ deploy duy nhất CredentialRegistry mới
    console.log("Đang tiến hành deploy CredentialRegistry...");
    const credentialRegistry = await ethers.deployContract(
        "CredentialRegistry",
        [oldDidRegistryAddress]
    );

    await credentialRegistry.waitForDeployment();
    const credentialAddress = await credentialRegistry.getAddress();

    console.log("\n-> ĐỊA CHỈ CREDENTIALREGISTRY MỚI:", credentialAddress);
    console.log("=========================================");
    console.log("🎉 DEPLOY HOÀN TẤT THÀNH CÔNG 🎉");
    console.log("=========================================");
}

main().catch((error) => {
    console.error("Quá trình deploy xảy ra lỗi:", error);
    process.exitCode = 1;
});
