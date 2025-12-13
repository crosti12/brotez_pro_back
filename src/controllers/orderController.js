import express from "express";
import Order from "../models/Order.js";
import { isAllowedToHistoryAll } from "../constants.js";
import { createClient } from "./clientController.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const body = { ...req.body, lastUpdated: new Date().toISOString() };

    if (body.clientName && body.clientPhone && body.ci) {
      const client = await createClient({
        ci: body.ci,
        name: body.clientName,
        phone: body.clientPhone,
        author: req.user._id,
      });
      body.clientId = client._id;
    }
    const resp = await Order.create(body);
    res.json(resp);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/id/:id", async (req, res) => {
  try {
    const body = { ...req.body, lastUpdated: new Date() };

    if (body.clientName && body.clientPhone && body.cliendId) {
      const client = await createClient({ name: body.clientName, phone: body.clientPhone });
      body.clientId = client._id;
    }

    let resp;
    if (isAllowedToHistoryAll(req)) {
      resp = await Order.findByIdAndUpdate(req.params.id, body, { new: true });
    } else {
      resp = await Order.findOneAndUpdate({ _id: req.params.id, author: req.user._id }, body, { new: true });
    }

    if (!resp) return res.status(404).json({ message: "Order not found" });
    res.json(resp);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.get("/", async (req, res) => {
  try {
    const { lastUpdated } = req.query;

    let filter = {};

    if (!isAllowedToHistoryAll(req)) {
      filter.author = req.user._id;
    }

    if (lastUpdated) {
      const date = new Date(lastUpdated);
      if (!isNaN(date.getTime())) {
        filter.lastUpdated = { $gt: date };
      } else {
        return res.status(400).json({ message: "Invalid date format" });
      }
    }

    const orders = await Order.find(filter).select("-__v").populate("author", "username email");

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/id/:id", async (req, res) => {
  try {
    let order;

    if (isAllowedToHistoryAll(req)) {
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

router.delete("/id/:id", async (req, res) => {
  try {
    let order;

    if (isAllowedToHistoryAll(req)) {
      order = await Order.findByIdAndUpdate(
        req.params.id,
        { isDeleted: true, deletedAt: new Date(), lastUpdated: new Date() },
        { new: true }
      );
    } else {
      order = await Order.findOneAndUpdate(
        { _id: req.params.id, author: req.user._id },
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
      );
    }

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
