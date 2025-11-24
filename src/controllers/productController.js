import express from "express";
import Product from "../models/Product.js";
import { isSuper } from "../utils/generateToken.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("author", "username email");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/id/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("author", "username email");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/id/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
      "author",
      "username email"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/id/:id", async (req, res) => {
  try {
    const isAllowed = isSuper(req);
    if (!isAllowed) return res.status(403).json({ message: "forbidden" });

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
