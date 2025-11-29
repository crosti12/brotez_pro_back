import express from "express";
import Product from "../models/Product.js";
import { PERMISSIONS } from "../contants.js";
const isAllowedToDeleteProduct = (req) => PERMISSIONS[req.user.role]?.deleteProduct;
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const isExisting = await Product.findOne({ name: req?.body?.name });
    if (isExisting) return res.status(400).json({ message: "The item already exists" });
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
    const products = await Product.find().populate("author", "username email");
    res.json(products);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/id/:id", async (req, res) => {
  try {
    const isAllowed = isAllowedToDeleteProduct(req);
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!isAllowed) {
      if (String(product.author) !== String(req.user._id)) {
        return res.status(403).json({ message: "forbidden" });
      }
    }
    await product.deleteOne();

    const products = await Product.find().populate("author", "username email");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
