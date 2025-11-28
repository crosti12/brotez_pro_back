import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: String, required: true },
    },
  ],
  isPaid: { type: Boolean, default: false },
  buyerContact: { type: Object },
  isDelivered: { type: Boolean, default: false },
  total: { type: String, required: true },
  orderId: { type: String },
  paymentId: { type: String },
  paymentType: { type: String },
  area: { type: String, required: true },
});

OrderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderId = `order-${count + 1}`;
  }
  next();
});

export default mongoose.model("Order", OrderSchema);
