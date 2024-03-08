const express = require("express");
const qaRouter = express.Router();
const jwt = require("jsonwebtoken");
const { getQA, getIdByUsername } = require("./db");
const getUsernameByToken = require("./getUsernameByToken");

qaRouter.post("/:setId", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  const username = await getUsernameByToken(token);
  const userId = await getIdByUsername(username);
  const { setId } = req.params;
  const response = await getQA(setId, userId);
  console.log("response comming");
  console.log(response);
  res.json(response);
});

module.exports = qaRouter;
