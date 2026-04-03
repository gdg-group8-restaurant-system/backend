const studentMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated. Please log in first.",
    });
  }

  if (req.user.role !== "student") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Students only.",
    });
  }

  next();
};

export default studentMiddleware;
