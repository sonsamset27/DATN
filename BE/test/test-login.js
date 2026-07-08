import { Wallet } from "ethers";
// 0xbf1b36fc4c8ca88fc8ba4bc3f3bdfeb376c46dd3
// pvk: 0x29b78e32ac4b74d83f1b54241af9dc12f00fde9597d2a7d46264c44e6799f4bc
const wallet = new Wallet(
    "0x29b78e32ac4b74d83f1b54241af9dc12f00fde9597d2a7d46264c44e6799f4bc"
);

const nonce = "cdaf826d64e0dc5b1075f0c7336263a7";

const signature = await wallet.signMessage(nonce);

console.log(wallet.address);
console.log(signature);