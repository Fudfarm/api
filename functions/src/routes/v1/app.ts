import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import generalRouter from "../generalRoutes";
import staffRouter from "./admin/staffRoutes";
import authRouter from "./authRoutes";
import farmerRouter from "./farmerRoutes";
import systemLogRouter from "./printLogRouter";
import statRouter from "./stat";
import systemInfoRouter from "./systeminfo";
import userRouter from "./userRouter";

const app = express();
const apiRouter = express.Router();

const allowedOrigins = [
  "http://localhost:3000",
  "https://localhost:3000",
  process.env.CLIENT_URL || "",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

//

app.use(express.json());
app.use(cookieParser());


app.use("/", generalRouter);
apiRouter.use("/", authRouter);
apiRouter.use("/staff", staffRouter);
apiRouter.use("/", systemInfoRouter);
apiRouter.use("/", userRouter);
apiRouter.use("/farmer", farmerRouter);
apiRouter.use("/log", systemLogRouter);
apiRouter.use("/stat", statRouter);
app.use("/api/v1", apiRouter);


// Handle 404 for API routes
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Error handling middleware in case of unhandled errors
app.use((err: any, req: any, res: any, _next: any) => {
  console.error(err.stack);
  return res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
