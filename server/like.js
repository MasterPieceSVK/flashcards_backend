const express = require("express");
const {
  addLike,
  getUsernameById,
  getIdByUsername,
  removeLike,
} = require("./db");
const getUsernameByToken = require("./getUsernameByToken");
const likeRouter = express.Router();

likeRouter.post("/", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  const { setId, like } = req.body;
  const username = await getUsernameByToken(token);
  const user_id = await getIdByUsername(username);
  if (like) {
    const newLike = await addLike(user_id, setId);
    if (newLike) {
      res.status(201).json({ like });
    } else {
      res.status(404).json({ like });
    }
  } else {
    const newUnlike = await removeLike(user_id, setId);
    if (newUnlike) {
      res.status(201).json({ like });
    } else {
      res.status(404).json({ like });
    }
  }
});

module.exports = likeRouter;
