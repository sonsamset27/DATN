import express from "express"
import AuthRouter from "./modules/auth/auth.route.js"

const app = express()

app.use(express.json())

app.use("/api/auth", AuthRouter);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Backend is running"
    })
})

export default app