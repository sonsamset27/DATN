import express from "express"
import AuthRouter from "./modules/auth/auth.route.js"
import UserRouter from "./modules/users/user.route.js"
import { swaggerUi, swaggerSpec } from "./configs/swagger.js";

const app = express()

app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", AuthRouter);
app.use("/api/users", UserRouter);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Backend is running"
    })
})

export default app