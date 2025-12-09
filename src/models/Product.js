import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productType: { type: String, required: true },
  name: { type: String, required: true },
  cost: { type: Number },
  price: { type: Number, required: true },
  unit: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  currency: { type: String },
  lastUpdated: { type: Date, required: true },
});

export default mongoose.model("Product", ProductSchema);
