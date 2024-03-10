const getUsernameByToken = require("./getUsernameByToken");

async function abcc() {
  const abc = await getUsernameByToken(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuZXdVc2VybmFtZSI6ImNoYW5nZXI0IiwiaWF0IjoxNzEwMDk0MjA0fQ.EYdb0rwMCQIlXlag_9Lrj8zjUbGzotqV9QFrQ_Rgcsc"
  );
  console.log(abc);
}
abcc();
