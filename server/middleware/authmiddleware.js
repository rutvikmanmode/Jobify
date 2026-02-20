const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ msg: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const normalizedId = decoded.id || decoded.userId || decoded._id || null;
    if (!normalizedId) {
      return res.status(401).json({ msg: "Token invalid: missing user id" });
    }

    const user = await User.findById(normalizedId).select("_id role tokenVersion");
    if (!user) {
      return res.status(401).json({ msg: "Token invalid: user not found" });
    }

    if ((decoded.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)) {
      return res.status(401).json({ msg: "Token expired. Please login again." });
    }

    req.user = {
      ...decoded,
      id: normalizedId,
      role: user.role,
      tokenVersion: user.tokenVersion
    };
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token invalid" });
  }
};

// ROLE CHECK
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Access denied" });
    }
    next();
  };
};
