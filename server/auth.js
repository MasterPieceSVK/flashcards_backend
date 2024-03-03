const express = require("express");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config({
  path: ".env",
});
authRouter.post("/:user", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.SECRETKEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    // User is authenticated, now check if they are the "right" user
    if (decoded.username !== req.params.user) {
      return res.status(403).json({
        message: "You do not have permission to access this resource",
      });
    }
    // User is the "right" user, proceed with handling the request
    res.json({ username: req.params.user });
  });
});

module.exports = authRouter;
