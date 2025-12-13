import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  phone: { type: String },
  lastUpdated: { type: Date, required: true },
  ci: { type: String, required: true },
  extraData: { type: Object },
});

export default mongoose.model("Clients", ClientSchema);
