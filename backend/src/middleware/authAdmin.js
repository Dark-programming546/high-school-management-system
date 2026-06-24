import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Extract Bearer token safely
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7) // Remove "Bearer " prefix
      : authHeader;

    if (!token || token.trim() === "") {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    // Verify JWT with secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload to request object
    req.admin = decoded;

    next();
  } catch (error) {
    // Handle expired tokens
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }

    // Handle invalid signature or malformed tokens
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Generic error response
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

export default authAdmin;
