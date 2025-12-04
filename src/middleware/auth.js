import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "token_invalid" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "user_not_found" });
    }

    if (!user.userAllowedLogIn) {
      return res.status(403).json({ message: "user_not_allowed" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "token_invalid" });
  }
};
