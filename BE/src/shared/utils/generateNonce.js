import { randomBytes } from "crypto"

const generateNonce = () => {
    return randomBytes(16).toString("hex")
}

export default generateNonce