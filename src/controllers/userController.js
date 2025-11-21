import express from "express";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already used" });

    const user = await User.create({ username, email, password });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email = "", password = "" } = req?.body;
    if (!email || !password) return res.status(400).json({ message: "Missing credentials" });
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid user" });

    const valid = await user.matchPassword(password);

    if (!valid) return res.status(400).json({ message: "Invalid password" });

    res.json({
      token: generateToken(user._id),
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

export default router;
