import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productType: { type: String, required: true },
  name: { type: String, required: true },
  earningMargin: { type: Number },
});

export default mongoose.model("Product", ProductSchema);
