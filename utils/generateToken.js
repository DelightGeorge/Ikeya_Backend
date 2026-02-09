// utils/generateToken.js
import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role  // ✅ CRITICAL: Include role in token
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
  );
};
