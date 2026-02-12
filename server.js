import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Routers
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js"; // ✅ NEW
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Ikeyà Originals API running");
});

// API Routes
app.use("/users", userRoutes);       // /users/register, /users/login, /users/profile
app.use("/products", productRoutes); // /products/type/:type, /products/:id
app.use("/cart", cartRoutes);        // /cart (GET, POST, PUT, DELETE)
app.use("/orders", orderRoutes);     // /orders (GET all, POST create, GET by id)
app.use("/categories", categoryRoutes);  // /categories (GET, POST)
app.use("/products", productRoutes);
app.use("/payments", paymentRoutes);
app.use("/newsletter", newsletterRoutes); // ✅ NEW
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
