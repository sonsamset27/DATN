import connectDB from "./configs/db.js";
import env from "./configs/env.js";
import app from "./app.js";


const start = async () => {
    try {
        await connectDB();
        console.log("MongoDB Connected");
        app.listen(env.PORT, () => {
            console.log(`Server is running on port ${env.PORT}`);
        });

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

start();