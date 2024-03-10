require("dotenv").config({
  path: ".env",
});

const { ParameterizedQuery, as } = require("pg-promise");
const getUsernameByToken = require("./getUsernameByToken");
const pgp = require("pg-promise")();
const db = pgp(process.env.DATABASE_URL);

async function createUser(username, password, email) {
  const data = [{ username, password, email }];
  const cs = new pgp.helpers.ColumnSet(["username", "password", "email"], {
    table: "users",
  });
  const sql = pgp.helpers.insert(data, cs);
  return db
    .none(sql)
    .then(() => {
      return true;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
}

async function findUser(username) {
  const findUser = new ParameterizedQuery({
    text: "SELECT * FROM users WHERE username = $1",
    values: [username],
  });
  return db
    .one(findUser)
    .then((user) => {
      return user;
    })
    .catch((error) => {
      console.log(error);
      return false;
    });
}

async function getIdByUsername(username) {
  const findId = new ParameterizedQuery({
    text: "SELECT user_id FROM users WHERE username = $1",
    values: [username],
  });
  return db
    .one(findId)
    .then((id) => {
      return id.user_id;
    })
    .catch((e) => {
      console.log(e);
    });
}

async function getFlashcardSets(username) {
  const id = await getIdByUsername(username);
  const findSets = new ParameterizedQuery({
    text: "SELECT * FROM flashcard_sets WHERE user_id = $1 ORDER BY created_at DESC",
    values: [id],
  });

  return db
    .many(findSets)
    .then((sets) => {
      return sets;
    })
    .catch((e) => {
      console.log(e);
    });
}

async function createSet(set_name, username, qa, public) {
  const created_at = new Date().toISOString();
  const id = await getIdByUsername(username);
  data = [
    { user_id: id, set_name, created_at, likes_count: 0, is_public: public },
  ];

  let cs = new pgp.helpers.ColumnSet(
    ["user_id", "set_name", "created_at", "likes_count", "is_public"],
    {
      table: "flashcard_sets",
    }
  );
  let sql = pgp.helpers.insert(data, cs);
  const create = await db
    .none(sql)
    .then(() => {
      return true;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
  if (create) {
    const findSetId = new ParameterizedQuery({
      text: "SELECT set_id FROM flashcard_sets WHERE user_id = $1 AND created_at=$2",
      values: [id, created_at],
    });
    const setId = await db
      .one(findSetId)
      .then((data) => {
        return data.set_id;
      })
      .catch((e) => console.log(e));

    let formattedData = qa.map((item) => {
      return {
        set_id: setId,
        question: item.question,
        answer: item.answer,
        created_at,
        is_public: public,
        user_id: id,
      };
    });

    let cs = new pgp.helpers.ColumnSet(
      ["set_id", "question", "answer", "created_at", "is_public", "user_id"],
      {
        table: "flashcards",
      }
    );

    let sql = pgp.helpers.insert(formattedData, cs);

    db.none(sql)
      // .then((data) => console.log(data))
      .catch((e) => {
        console.log(e);
      });
  } else {
    res.status(500).send("An eror occured");
  }
}

async function getQA(setId, id) {
  const setExists = new ParameterizedQuery({
    text: "SELECT EXISTS(SELECT * FROM flashcard_sets WHERE set_id=$1 )",
    values: [setId],
  });

  const { exists } = await db
    .one(setExists)
    .then((data) => {
      return data;
    })
    .catch((e) => {
      console.log(e);
      return false;
    });
  if (exists) {
    const publicPrivate = new ParameterizedQuery({
      text: "SELECT is_public,likes_count,user_id,created_at,set_name FROM flashcard_sets WHERE set_id = $1",
      values: [setId],
    });
    const { is_public, likes_count, created_at, user_id, set_name } = await db
      .one(publicPrivate)
      .then((set) => {
        return set;
      })
      .catch((e) => {
        console.log(e);
      });

    let findQA = "";
    if (is_public) {
      findQA = new ParameterizedQuery({
        text: "SELECT question,answer FROM flashcards WHERE set_id = $1",
        values: [setId],
      });
    } else {
      findQA = new ParameterizedQuery({
        text: "SELECT question,answer FROM flashcards WHERE set_id = $1 AND user_id=$2",
        values: [setId, id],
      });
    }
    const resultsQuery = new ParameterizedQuery({
      text: "SELECT wrong_answers,right_answers FROM results WHERE set_id = $1 AND user_id=$2 ORDER BY result_id DESC",
      values: [setId, id],
    });

    const isSetLiked = await isLiked(id, setId);

    const allResults = await db
      .many(resultsQuery)
      .then((results) => results)
      .catch((e) => console.log(e));
    return db
      .many(findQA)
      .then(async (qa) => {
        console.log(qa);
        const { username } = await getUsernameById(user_id);
        const resp = {
          allResults,
          qa,
          is_public,
          likes_count,
          username,
          created_at,
          set_name,
          liked: isSetLiked,
        };
        return resp;
      })
      .catch((e) => {
        console.log(e);
      });
  } else {
    return false;
  }
}

async function saveResult(token, right, wrong, set_id) {
  const username = await getUsernameByToken(token);

  const user_id = await getIdByUsername(username);

  const data = {
    set_id,
    right_answers: right,
    wrong_answers: wrong,
    user_id,
  };
  let cs = new pgp.helpers.ColumnSet(
    ["set_id", "right_answers", "wrong_answers", "user_id"],
    {
      table: "results",
    }
  );

  let sql = pgp.helpers.insert(data, cs);
  return db
    .none(sql)
    .then(() => {
      return true;
    })
    .catch((e) => {
      console.log(e);
      return false;
    });
}

async function getUsernameById(id) {
  const findUser = new ParameterizedQuery({
    text: "SELECT username FROM users WHERE user_id = $1",
    values: [id],
  });
  return db
    .one(findUser)
    .then((username) => {
      return username;
    })
    .catch((e) => {
      console.log(e);
    });
}

async function addLike(user_id, set_id) {
  const data = {
    set_id,
    user_id,
  };
  let cs = new pgp.helpers.ColumnSet(["set_id", "user_id"], {
    table: "likes",
  });

  let sql = pgp.helpers.insert(data, cs);
  return db
    .none(sql)
    .then(() => {
      return true;
    })
    .catch((e) => {
      console.log(e);
      return false;
    });
}

async function removeLike(user_id, set_id) {
  const removeLike = new ParameterizedQuery({
    text: "DELETE FROM likes WHERE user_id = $1 AND set_id=$2",
    values: [user_id, set_id],
  });
  return db
    .none(removeLike)
    .then(() => {
      return true;
    })
    .catch((e) => {
      console.log(e);
      return false;
    });
}

async function isLiked(user_id, set_id) {
  const isLikedQuery = new ParameterizedQuery({
    text: "SELECT like_id FROM likes WHERE user_id=$1 AND set_id=$2",
    values: [user_id, set_id],
  });
  return db
    .one(isLikedQuery)
    .then(() => {
      return true;
    })
    .catch((e) => {
      console.log(e);
      return false;
    });
}

async function getPublicSets() {
  const getPublicSetsQuery = new ParameterizedQuery({
    text: "SELECT flashcard_sets.*, users.username FROM flashcard_sets JOIN users ON flashcard_sets.user_id = users.user_id WHERE is_public=$1 ORDER BY created_at DESC LIMIT 20",
    values: [true],
  });
  return db
    .many(getPublicSetsQuery)
    .then((data) => {
      return data;
    })
    .catch((e) => {
      console.log(e);
      return false;
    });
}

async function getMostLikedPublicSets() {
  const getPublicSetsQuery = new ParameterizedQuery({
    text: "SELECT flashcard_sets.*, users.username FROM flashcard_sets JOIN users ON flashcard_sets.user_id = users.user_id WHERE is_public=$1 ORDER BY likes_count DESC LIMIT 20",
    values: [true],
  });
  return db
    .many(getPublicSetsQuery)
    .then((data) => {
      return data;
    })
    .catch((e) => {
      console.log(e);
      return false;
    });
}

async function getUserInfo(user_id, username) {
  const emailQuery = new ParameterizedQuery({
    text: "SELECT email FROM users WHERE user_id=$1",
    values: [user_id],
  });
  const [{ email }] = await db
    .many(emailQuery)
    .then((data) => {
      return data;
    })
    .catch((e) => {
      console.log(e);
      return false;
    });

  const setCountQuery = new ParameterizedQuery({
    text: "SELECT COUNT(*) FROM flashcard_sets WHERE user_id=$1 UNION ALL SELECT COUNT(*) FROM results WHERE user_id=$1 UNION ALL SELECT COUNT(*) FROM flashcards WHERE user_id=$1 UNION ALL SELECT COUNT(*) FROM likes WHERE user_id=$1",
    values: [user_id],
  });

  const setCount = await db
    .many(setCountQuery)
    .then((data) => {
      return data;
    })
    .catch((e) => {
      console.log(e);
      return false;
    });

  const sumCountQuery = new ParameterizedQuery({
    text: "SELECT SUM(likes_count) FROM flashcard_sets WHERE user_id=$1",
    values: [user_id],
  });
  const sumCount = await db
    .many(sumCountQuery)
    .then((data) => {
      return data;
    })
    .catch((e) => {
      console.log(e);
      return false;
    });
  const obj = {
    email,
    username,
    createdSetsCount: setCount[0]?.count || 0,
    playedSetsCount: setCount[1]?.count || 0,
    createdQuestionsCount: setCount[2]?.count || 0,
    likedSetsCount: setCount[3]?.count || 0,
    gottenLikesOnSetsCount: sumCount[0]?.sum || 0,
  };

  return obj;
}

async function getOwnerOfSet(set_id) {
  const getOwnerQuery = new ParameterizedQuery({
    text: "SELECT user_id FROM flashcard_sets WHERE set_id=$1",
    values: [set_id],
  });

  return db
    .one(getOwnerQuery)
    .then((data) => {
      return data.user_id;
    })
    .catch((e) => {
      console.log(e);
      return false;
    });
}

async function deleteSet(set_id) {
  const deleteSetQuery = new ParameterizedQuery({
    text: "DELETE FROM flashcard_sets WHERE set_id=$1",
    values: [set_id],
  });

  const deleteCardsQuery = new ParameterizedQuery({
    text: "DELETE FROM flashcards WHERE set_id=$1",
    values: [set_id],
  });

  const deleteResultsQuery = new ParameterizedQuery({
    text: "DELETE FROM results WHERE set_id=$1",
    values: [set_id],
  });
  const deleteLikesQuery = new ParameterizedQuery({
    text: "DELETE FROM likes WHERE set_id=$1",
    values: [set_id],
  });

  return db
    .none(deleteLikesQuery)
    .then(() => {
      db.none(deleteResultsQuery)
        .then(() => {
          db.none(deleteCardsQuery)
            .then(() => {
              db.none(deleteSetQuery)
                .then(() => {
                  return true;
                })
                .catch((e) => {
                  console.log(e);
                  return false;
                });
            })
            .catch((e) => {
              console.log(e);
              return false;
            });
        })
        .catch((e) => {
          console.log(e);
          return false;
        });
    })
    .catch((e) => {
      console.log(e);
      return false;
    });
}

module.exports = {
  createUser,
  findUser,
  getFlashcardSets,
  getIdByUsername,
  createSet,
  getQA,
  saveResult,
  getUsernameById,
  addLike,
  removeLike,
  getPublicSets,
  getMostLikedPublicSets,
  getUserInfo,
  getOwnerOfSet,
  deleteSet,
};
