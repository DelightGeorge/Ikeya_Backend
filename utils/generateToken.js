// utils/generateToken.js
import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  const payload = {
    userid: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "2h" });
};
