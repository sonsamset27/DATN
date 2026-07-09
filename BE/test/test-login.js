import { Wallet } from "ethers";
// 0xbf1b36fc4c8ca88fc8ba4bc3f3bdfeb376c46dd3
// pvk: 0x29b78e32ac4b74d83f1b54241af9dc12f00fde9597d2a7d46264c44e6799f4bc
const wallet = new Wallet(
    "0x29b78e32ac4b74d83f1b54241af9dc12f00fde9597d2a7d46264c44e6799f4bc"
);

const nonce = "dbcb76ad2048d84b5ac360068f003fbf";

// 0xe7b765fd5daabb51d4973124d8b9a780b4f5334a
// pvk: 0x02cda644445ec8fb74eea22e34b98423145c1a499b75fc5d86bae81969a00e47
// const wallet = new Wallet(
//     "0x02cda644445ec8fb74eea22e34b98423145c1a499b75fc5d86bae81969a00e47"
// );

// const nonce = "4d31bbff451df7f3afa1d821b448f7e2";

const signature = await wallet.signMessage(nonce);

console.log(wallet.address);
console.log(signature);