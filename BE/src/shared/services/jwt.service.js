import jwt from "jsonwebtoken"
import env from "../../configs/env.js"

const { JWT_SECRET, JWT_EXPIRES_IN } = env

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
}

export const generateAccessToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export const verifyAccessToken = (token) => {
    return jwt.verify(token, JWT_SECRET)
}