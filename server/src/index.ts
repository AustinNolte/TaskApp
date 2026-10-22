import "dotenv/config";
import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.js";
import { taskRouter } from "./routes/tasks.js";
import { requireAuth } from "./middleware/requireAuth.js";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/tasks", requireAuth, taskRouter);

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
