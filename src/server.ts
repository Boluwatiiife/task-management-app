import express, { Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("hello from the backend dev!");
});

let handleError = require("./middleware/error");
let authRoutes = require("./routes/authRoute");
let userRoutes = require("./routes/userRoute");
let taskRoutes = require("./routes/taskRoute");

// database
mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log(`Database connected!...`))
  .catch((err: any) => console.log(err));

//middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(bodyParser.json({ limit: "5mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "5mb",
    extended: true,
  })
);
app.use(cookieParser());
app.use(cors());

// prevent sql injection
app.use(mongoSanitize());

// adding security headers
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// route middleware
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", taskRoutes);

// error middlerware
app.use(handleError);

__dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req: Request, res: Response) => {
    res.send("API is running....");
  });
}

const port: number = parseInt(process.env.PORT as string) || 1335;

app.listen(port, (): void => {
  console.log(`Server is up and running...on port ${port}`);
});
