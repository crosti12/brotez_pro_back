import express from "express";
import { isAllowedToHistoryAll } from "../constants.js";
import Clients from "../models/Clients.js";
import axios from "axios";

const router = express.Router();

export async function createClient(data) {
  const ci = data.ci;
  if ((!data.author || !data.lastUpdated, !ci)) {
    throw new Error("Author or lastUpdated or cliendId are required fields");
  }
  const existingClient = await Clients.findOne({
    ci: ci,
  }).select("_id");

  if (existingClient) return existingClient;
  let extraData = null;
  try {
    const resp = await getUserExraInfo(ci);
    extraData = resp.data;
  } catch (error) {
    console.error("Error fetching user extra info:", error.message);
    extraData = null;
  }

  const clientDefinition = {
    author: data.author,
    name: data.name,
    phone: data.phone || "",
    ci: ci,
    lastUpdated: data.lastUpdated || new Date(),
  };

  extraData && (clientDefinition.extraData = extraData);

  const client = new Clients(clientDefinition);
  const savedClient = await client.save();
  return savedClient._id;
}

router.post("/", async (req, res) => {
  try {
    const client = await createClient(req.body);
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
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
    const clients = await Clients.find(filter).select("-__v").populate("author", "username email");
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const client = await Clients.findById(req.params.id).populate("author");
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const client = await Clients.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const client = await Clients.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json({ message: "Client deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export async function getUserExraInfo(ci) {
  const url = `https://api.cedula.com.ve/api/v1?app_id=${process.env.API_ID_CEDULA_API}&token=${process.env.TOKEN_CEDULA_API}&cedula=${ci}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (err) {
    console.error("Error fetching user extra info:", err.message);
    return null;
  }
}

export default router;
