import { PinataSDK } from "pinata";
import env from './env.js';

const pinata = new PinataSDK({
    pinataJwt: env.PINATA_JWT,
    pinataGateway: env.PINATA_GATEWAY_URL,
});

export default pinata;