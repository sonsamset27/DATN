import mongoose from "mongoose"
import env from "./env.js"

const { MONGO_URI } = env

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI)
    } catch (error) {
        console.log(error)
    }
}

export default connectDB