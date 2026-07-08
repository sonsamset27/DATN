import express from "express"

const app = express()

app.use(express.json())

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Backend is running"
    })
})

export default app