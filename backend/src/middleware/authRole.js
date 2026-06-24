import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

/**
 * Role-based auth middleware factory.
 * Usage: authRole("ADMIN")  or  authRole("ADMIN", "REGISTRAR")
 */
const authRole = (...allowedRoles) => (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ success: false, message: "No token provided" });

    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    if (!token || token.trim() === "")
      return res.status(401).json({ success: false, message: "Invalid token format" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError")
      return res.status(401).json({ success: false, message: "Token has expired" });
    if (error.name === "JsonWebTokenError" || error.name === "NotBeforeError")
      return res.status(401).json({ success: false, message: "Invalid token" });
    return res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

export default authRole;
