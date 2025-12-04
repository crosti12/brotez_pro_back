import express from "express";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { protect } from "../middleware/auth.js";
import { PERMISSIONS, ROLES } from "../constants.js";

const router = express.Router();

const isAllowedToEditUsername = (req) => {
  if (PERMISSIONS[req.user.role]?.changeUsername) return true;
  return false;
};

const userFormat = (user) => {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    language: user.language,
    permissions: PERMISSIONS[user.role],
  };
};

router.put("/id/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (!isAllowedToEditUsername(req)) {
      delete updates.username;
    }

    if (updates.role && req.user.role !== ROLES.DEVELOPER) {
      return res.status(403).json({ message: "Only developers can update role" });
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(userFormat(user));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already used" });
    const user = await User.create({ username, email, password });

    res.json({
      ...userFormat(user),
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    if (!req?.body) return res.status(400).json({ message: "Missing credentials" });
    const { password = "", username = "" } = req?.body;
    if (!username || !password) return res.status(400).json({ message: "Missing credentials" });
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid user" });
    const valid = await user.matchPassword(password);
    if (!valid) return res.status(400).json({ message: "Invalid password" });

    res.json({
      token: generateToken(user._id),
      user: userFormat(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const isAllowed = req.user.role === ROLES.DEVELOPER;
    const people = isAllowed ? await User.find() : await User.find().select("-createdAt -__v -password");
    res.json(people);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
