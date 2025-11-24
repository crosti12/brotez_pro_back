import jwt from "jsonwebtoken";

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};
export const isSuper = (req) => {
  return req.user.role === "admin" || req.user.role === "developer";
};
