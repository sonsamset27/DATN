import connectDB from "./configs/db.js";
import env from "./configs/env.js";
import app from "./app.js";
import { checkBlockchainConnection } from "./shared/services/blockchain.service.js";


const start = async () => {
    try {
        await connectDB();
        console.log("MongoDB Connected");
        await checkBlockchainConnection();
        console.log("Blockchain Connected");
        app.listen(env.PORT, () => {
            console.log(`Server is running on port ${env.PORT}`);
        });

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

start();