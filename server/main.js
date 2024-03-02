const express = require("express");
const apiRouter = express.Router();

apiRouter.get("/ping", (req, res) => {
  res.status(200).send();
});

apiRouter.get("/", (req, res) => {
  res.json({
    working: true,
  });
});
const loginRouter = require("./login");
apiRouter.use("/login", loginRouter);

const signUpRouter = require("./signup");
apiRouter.use("/signup", signUpRouter);

module.exports = apiRouter;
