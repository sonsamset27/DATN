import express from "express"
import AuthRouter from "./modules/auth/auth.route.js"
import UserRouter from "./modules/users/user.route.js"
import { swaggerUi, swaggerSpec } from "./configs/swagger.js";
import helmet from "helmet"
import compression from "compression";
import morgan from "morgan";
import DidRouter from "./modules/dids/did.route.js";
import CredentialTemplateRouter from "./modules/credentialTemplates/credentialTemplate.route.js";
import CredentialRouter from "./modules/credential/credential.route.js";
import AuditLogRouter from "./modules/auditLog/auditLog.route.js";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express()


app.use(express.json({
    limit: "1mb"
}))
app.use(cookieParser())
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Bị chặn bởi cấu hình CORS của Backend!'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// tăng cường bảo mật
app.use(helmet())

// giảm băng thông
app.use(compression());

// log request
app.use(morgan("dev"));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/users", UserRouter);
app.use("/api/v1/dids", DidRouter);
app.use("/api/v1/credential-templates", CredentialTemplateRouter);
app.use("/api/v1/credentials", CredentialRouter);
app.use("/api/v1/audit-logs", AuditLogRouter);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Backend is running"
    })
})

export default app