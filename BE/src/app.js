import express from "express"
import AuthRouter from "./modules/auth/auth.route.js"
import UserRouter from "./modules/users/user.route.js"
import { swaggerUi, swaggerSpec } from "./configs/swagger.js";
import helmet from "helmet"
import compression from "compression";
import morgan from "morgan";

const app = express()

app.use(express.json({
    limit: "1mb"
}))

// tăng cường bảo mật
app.use(helmet())

// giảm băng thông
app.use(compression());

// log request
app.use(morgan("dev"));

// swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// routes
app.use("/api/auth", AuthRouter);
app.use("/api/users", UserRouter);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Backend is running"
    })
})

export default app