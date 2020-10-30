const express = require("express");
const index = express();
// initialize pg-promise library
const pgp = require("pg-promise")();
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

// let id = uuidv4()
// console.log(id)

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

// Route/action for user to register
index.get('/user/register', (req, res) => {
  res.render('register')
});

// Route/action for user to register
index.post('/user/new-register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
      db.none("INSERT INTO users(username, password) VALUES($1,$2)", [
        username,
        hash,
      ]).then(() => {
        res.render("login");
      });
    });
  });
})

// Route that will dispaly all posts
index.get("/", (req, res) => {
  // res.render("index")
  //need to get all blog posts from posts db
  // 'any' function will always return an array
  db.any(
    "SELECT post_id, title, body, to_char(date_created, 'MM/DD/YYYY') AS date_created, to_char(date_updated, 'MM/DD/YYYY') AS date_updated FROM posts ORDER BY date_updated DESC;"
  ).then((posts) => {
    res.render("index", { posts: posts });
  });
});

//route to create a post
index.post("/post/create-post", (req, res) => {
  const title = req.body.title;
  const body = req.body.newPost;

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

index.get("/posts/:post_id/comments", async (req, res) => {
  const id = req.params.post_id;
  let result = await db.any(
    "SELECT posts.post_id, posts.title, posts.body AS post_body, to_char(posts.date_created, 'MM/DD/YYY') AS post_date_created, to_char(posts.date_updated, 'MM/DD/YYY') AS post_date_updated, commentaries.comment_id, commentaries.body AS commentaries_body, to_char(commentaries.date_created, 'MM/DD/YYYY') AS commentaries_date_created FROM posts LEFT JOIN commentaries ON posts.post_id = commentaries.post_id WHERE posts.post_id = $1;",
    [id]
  );

  let posts = formatPostsAndCommentsForDisplay(result);
  console.log(posts);
  // console.log(result[0].commentaries_date_created)

  res.render("details", { postDetails: posts });
});

//creating a function to format the joined list of posts and comments we got from the database
function formatPostsAndCommentsForDisplay(list) {
  let posts = [];

  list.forEach((item) => {
    if (posts.length == 0) {
      let post = {
        post_id: item.post_id,
        title: item.title,
        post_body: item.post_body,
        post_date_created: item.post_date_created,
        post_date_updated: item.post_date_updated,
        commentaries: [
          {
            comment_id: item.comment_id,
            comment_body: item.commentaries_body,
            date_created: item.commentaries_date_created,
          },
        ],
      };
      posts.push(post);
    } else {
      let post = posts.find((post) => post.post_id == item.post_id);
      if (post) {
        post.commentaries.push({
          comment_id: item.comment_id,
          comment_body: item.commentaries_body,
          date_created: item.commentaries_date_created,
        });
      } else {
        let post = {
          post_id: item.post_id,
          title: item.title,
          post_body: item.post_body,
          post_date_created: item.post_date_created,
          post_date_updated: item.post_date_updated,
          commentaries: [
            {
              comment_id: item.comment_id,
              comment_body: item.commentaries_body,
              date_created: item.commentaries_date_created,
            },
          ],
        };
        posts.push(post);
      }
    }
  });

  return posts;
}

//creating a comment on a post
index.post("/post/:post_id/new-comment", (req, res) => {
  const id = req.params.post_id;
  const newComment = req.body.newComment;
  console.log(newComment);
  console.log(id);

  db.none("INSERT INTO commentaries (body, post_id) VALUES($1, $2)", [
    newComment,
    id,
  ]).then(() => {
    res.redirect(`/posts/${id}/comments`);
  });

  // res.render('details')

  // const title = req.body.title;
  // const body = req.body.body;

  // db.none("INSERT INTO posts (title, body) VALUES($1, $2)", [title, body]).then(
  //   () => {
  //     res.redirect("/");
  //   }
  // );
});
