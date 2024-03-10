const express = require("express");
const setsRouter = express.Router();
const jwt = require("jsonwebtoken");
const {
  createSet,
  getOwnerOfSet,
  getIdByUsername,
  deleteSet,
} = require("./db");
const getUsernameByToken = require("./getUsernameByToken");
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

setsRouter.delete("/", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  const { setId } = req.query;
  const ownerId = await getOwnerOfSet(setId);
  const username = await getUsernameByToken(token);
  const user_id = await getIdByUsername(username);

  if (ownerId == user_id) {
    deleteSet(setId);
    console.log("deleted");
    res.status(204).send("deleted");
  } else {
    res.status(401).send("no permission to delete this set");
  }
});

module.exports = setsRouter;
