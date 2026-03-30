// middlewares/auth.js
import jwt from "jsonwebtoken";

/**
 * authMiddleware
 *
 * Validates the Bearer token on every protected route.
 * Returns clean, user-safe messages — never raw JWT or Prisma internals.
 *
 * Response codes the frontend listens for:
 *   "NO_TOKEN"      → 401 — no Authorization header at all
 *   "TOKEN_EXPIRED" → 401 — token was valid but has now expired (auto-logout)
 *   "INVALID_TOKEN" → 401 — token is malformed or tampered with
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required. Please log in.",
      code: "NO_TOKEN",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    // Token was genuine but has passed its expiry time
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Your session has expired. Please log in again.",
        code: "TOKEN_EXPIRED",
      });
    }

    // Token is malformed, tampered with, or signed with the wrong secret
    return res.status(401).json({
      message: "Invalid session. Please log in again.",
      code: "INVALID_TOKEN",
    });
  }
};

export default authMiddleware;