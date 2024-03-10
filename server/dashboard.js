const express = require("express");
const dashboardRouter = express.Router();
const jwt = require("jsonwebtoken");
const { getFlashcardSets } = require("./db");
require("dotenv").config({
  path: ".env",
});
dashboardRouter.post("/", async (req, res) => {
  const searchForSets = req.body.sets;
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  // console.log(token);
  if (!token) {
    console.log("no token");
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.SECRETKEY, async (err, decoded) => {
    if (err) {
      console.log("invalid token");

      return res.status(403).json({ message: "Invalid token" });
    }
    // console.log(req.body);
    if (searchForSets) {
      const sets = (await getFlashcardSets(decoded.username)) || [];
      res.json({ username: decoded.username, sets });
    } else {
      res.json({ username: decoded.username });
    }

    // User is the "right" user, proceed with handling the request
  });
});

module.exports = dashboardRouter;
