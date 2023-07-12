const expressErrorHandler = (err, req, res, next) => {
  if (err?.error?.isJoi) {
    return res.status(400).json({
      type: err.type,
      message: err.error.toString(),
    });
  }

  if (err?.code === 11000) {
    return res.status(400).json({ message: "Duplicate key error" });
  }

  if (err) {
    return res.status(500).json({ message: "Internal server error" });
  }

  res.status(404).json({ message: "Endpoint not found" });
};

module.exports = { expressErrorHandler };
