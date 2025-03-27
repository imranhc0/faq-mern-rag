import express from "express";
import { configDotenv } from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { logger, morganMiddleware } from "./utils/logger.js";


import connectDB from "./config/db.js"
import { auth } from "./routes/auth.routes.js";
import filesRoutes from './routes/files.routes.js'
import { requireAuth } from './middleware/auth.middleware.js'
import chatRoutes from './routes/chat.routes.js'


// Load environment variables
configDotenv()

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware

app.use(
    cors({
        origin: "*", // Replace with your frontend's origin
        methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
        credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    })
);

// Only auth routes
app.all("/api/auth/*", toNodeHandler(auth));

//for better-auth we have to use express.json after auth
app.use(morganMiddleware);
app.use(helmet());
app.use(express.json());

app.use("/api/file", requireAuth, filesRoutes);
app.use("/api/query", requireAuth, chatRoutes);

app.get('/', (req, res) => {
    {
        res.send("Hello world")
    }
})

app.get('/api/protected', requireAuth, (_req, res) => {
    res.json({
        msg: "you are procted"
    })
})


connectDB().then(async () => {
    console.log("Db Connected!");
    app.listen(PORT, () => {
        console.log(`Server running on port: ${PORT}`);
    })
})
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
