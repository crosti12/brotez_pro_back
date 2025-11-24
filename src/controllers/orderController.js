import express from "express";
import Order from "../models/Order.js";
import { isSuper } from "../utils/generateToken.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const order = await Order.create(req.body);

    const populatedOrder = await Order.findById(order._id).select("-__v").populate("author", "username email -_id");

    res.status(201).json(populatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const isSuper = isSuper(req);
    let orders;

    if (isSuper) {
      orders = await Order.find().select("-__v").populate("author", "username email");
    } else {
      orders = await Order.find({ author: req.user._id }).select("-__v").populate("author", "username email");
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/id/:id", async (req, res) => {
  try {
    let order;

    if (isSuper(req)) {
      order = await Order.findById(req.params.id)
        .populate("author", "username email")
        .populate("products.productId", "productType earningMargin");
    } else {
      order = await Order.findOne({ _id: req.params.id, author: req.user._id })
        .populate("author", "username email")
        .populate("products.productId", "productType earningMargin");
    }
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/id/:id", async (req, res) => {
  try {
    let order;

    if (isSuper(req)) {
      order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    } else {
      order = await Order.findOneAndUpdate({ _id: req.params.id, author: req.user._id }, req.body, { new: true });
    }
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/id/:id", async (req, res) => {
  try {
    let order;
    if (isSuper(req)) {
      order = await Order.findByIdAndDelete(req.params.id);
    } else {
      order = await Order.findOneAndDelete({ _id: req.params.id, author: req.user._id });
    }
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
