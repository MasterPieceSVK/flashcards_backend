const express = require("express");
const qaRouter = express.Router();
const jwt = require("jsonwebtoken");
const { getQA, getIdByUsername } = require("./db");
const getUsernameByToken = require("./getUsernameByToken");

qaRouter.post("/:setId", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  const username = await getUsernameByToken(token);
  console.log(username);
  if (username != false) {
    const userId = await getIdByUsername(username);
    const { setId } = req.params;
    const response = await getQA(setId, userId);
    console.log("response comming");
    res.json(response);
  } else {
    console.log("error 1234");
    res.status(404).send("error 1234");
  }
});

module.exports = qaRouter;
