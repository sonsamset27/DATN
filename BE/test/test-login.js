import { Wallet } from "ethers";
// 0xbf1b36fc4c8ca88fc8ba4bc3f3bdfeb376c46dd3
// pvk: 0x29b78e32ac4b74d83f1b54241af9dc12f00fde9597d2a7d46264c44e6799f4bc
const wallet = new Wallet(
    "0x29b78e32ac4b74d83f1b54241af9dc12f00fde9597d2a7d46264c44e6799f4bc"
);

const nonce = "3448e4c980b9e77f81438defff3abbfd";

// 0xe7b765fd5daabb51d4973124d8b9a780b4f5334a
// pvk: 0x02cda644445ec8fb74eea22e34b98423145c1a499b75fc5d86bae81969a00e47
// const wallet = new Wallet(
//     "0x02cda644445ec8fb74eea22e34b98423145c1a499b75fc5d86bae81969a00e47"
// );

// const nonce = "94c67d224c74076496b1757692a57678";

// 0xebe653198a00b3fc58cb5fc332f8278da40cb4b9
//pvk: 0xe371d193f59baade013766ed582212def10ff21222dc64a375235fb3c88e6977
// const wallet = new Wallet(
//     "0xe371d193f59baade013766ed582212def10ff21222dc64a375235fb3c88e6977"
// );

// const nonce = "bceee803cc02fded98b9ce404562b67e";


const signature = await wallet.signMessage(nonce);

console.log(wallet.address);
console.log(signature);