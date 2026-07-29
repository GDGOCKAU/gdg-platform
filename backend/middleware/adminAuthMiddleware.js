const { verifyToken } = require("../utils/jwt");

const adminAuthMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.admin_token;

    if (!token) {
      return res.status(401).json({
        message: "Admin authentication required",
      });
    }

    const decoded = verifyToken(token);

    if (
      decoded.role !== "Admin" ||
      !decoded.user_id
    ) {
      return res.status(403).json({
        message: "Admin access only",
      });
    }

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired admin token",
    });
  }
};

module.exports = adminAuthMiddleware;