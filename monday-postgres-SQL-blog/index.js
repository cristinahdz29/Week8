const express = require("express");
const index = express();
// initialize pg-promise library
const pgp = require("pg-promise")();

const connectionString = "postgres://localhost:5432/mydatabase";

// initialize pg promise by using a connection string
// pgp(...) returns an object which contains functions to interact with the database
const db = pgp(connectionString);

const mustacheExpress = require("mustache-express");
index.use(express.urlencoded());

// tell express to use mustache templating engine
index.engine("mustache", mustacheExpress());
// the pages are located in views directory
index.set("views", "./views");
// extension will be .mustache
index.set("view engine", "mustache");

//initializing the server
index.listen(3000, (req, res) => {
  console.log("Server is running...");
});

// Route that will dispaly all posts
index.get("/", (req, res) => {
  // res.render("index")
  //need to get all blog posts from posts db
  // 'any' function will always return an array
  db.any(
    "SELECT post_id, title, body, date_created, date_updated FROM posts ORDER BY date_updated DESC;"
  ).then((posts) => {
    res.render("index", { posts: posts });
  });
});

//route to create a post
index.post("/post/create-post", (req, res) => {
  const title = req.body.title;
  const body = req.body.body;

  db.none("INSERT INTO posts (title, body) VALUES($1, $2)", [title, body]).then(
    () => {
      res.redirect("/");
    }
  );
});

//deleting a blog post
index.post("/delete-post", (req, res) => {
  const postId = req.body.post_id;
  console.log(postId);

  db.none("DELETE FROM posts WHERE post_id = $1;", [postId]).then(() => {
    res.redirect("/");
  });
});

//updating a blog post
index.get("/update-post/:post_id", (req, res) => {
  const id = req.params.post_id;
  db.any(`SELECT * FROM posts WHERE post_id = ${id};`).then((post) => {
    console.log(post);
    res.render("update-post", { post: post });
  });
});

index.post("/update-post/:post_id", (req, res) => {
  const id = req.params.post_id;
  const title = req.body.title;
  const body = req.body.body;

  db.none(
    "UPDATE posts SET title = $1, body = $2, date_updated = CURRENT_TIMESTAMP WHERE post_id = $3",
    [title, body, id]
  )
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
});
