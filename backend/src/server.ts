import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/auth.routes";
import transactionsRouter from "./routes/transactions.routes";
import categoriesRouter from "./routes/categories.routes";
import chartsRouter from "./routes/charts.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3001", // Allow only this domain
    methods: "GET,POST,PUT,DELETE", // Allowed HTTP methods
    allowedHeaders: "Content-Type,Authorization", // Allowed headers
    credentials: true, // Allow cookies or auth headers
  })
);

app.get("/", (_req, res) => {
  res.send("Hello TypeScript + Node.js!");
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/charts", chartsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
