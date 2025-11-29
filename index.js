import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./src/config/database.js";
import userRoutes from "./src/controllers/userController.js";
import productRoutes from "./src/controllers/productController.js";
import orderRoutes from "./src/controllers/orderController.js";
import { protect } from "./src/middleware/auth.js";

dotenv.config();

const app = express();
const allowedOrigins = ["http://localhost:5173", "https://brotez-pro-front.vercel.app"];

app.use(helmet());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 86400,
  })
);

app.options("*", cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

connectDB();

app.use("/api/users", userRoutes);
app.use("/api/products", protect, productRoutes);
app.use("/api/orders", protect, orderRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
