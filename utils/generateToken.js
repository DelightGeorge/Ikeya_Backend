import jwt from "jsonwebtoken";

/**
 * Generate a signed JWT for a user.
 * Expires in 7 days — after that all protected routes reject it
 * and the frontend automatically logs the user out.
 */
export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
  );
};