const express = require("express");
const setsRouter = express.Router();
const jwt = require("jsonwebtoken");
const { createSet } = require("./db");
require("dotenv").config({
  path: ".env",
});

setsRouter.post("/", async (req, res) => {
  const { questionsAndAnswers, setName, token, public } = req.body.set[0];

  jwt.verify(token, process.env.SECRETKEY, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const username = decoded.username;
    const response = await createSet(
      setName,
      username,
      questionsAndAnswers,
      public
    );
    res.json(response);
  });
});

module.exports = setsRouter;
