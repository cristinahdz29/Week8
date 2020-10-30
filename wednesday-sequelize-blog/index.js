const express = require("express");
const index = express();
const models = require("./models");
//unique id
const bcrypt = require("bcryptjs");

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

//route to GET posts
index.get("/posts", (req, res) => {
  models.Post.findAll().then((posts) => {
    res.render("posts", { posts: posts });
  });
});

//route to create/POST a post
index.get("/create-post", (req, res) => {
  res.render("create-post");
});

index.post("/create-post", (req, res) => {
  const title = req.body.title;
  const body = req.body.newPost;
  const category = req.body.category;

  //building the Post object
  let post = models.Post.build({
    title: title,
    body: body,
    category: category,
  });

  console.log(post);

  post
    .save()
    .then((savedPost) => {
      console.log(savedPost);
      res.redirect("/posts");
    })
    .catch((error) => {
      res.send("error");
    });
});

//delete a post
index.post("/delete-post", (req, res) => {
  const id = req.body.id;

  models.Post.destroy({
    where: {
      id: id,
    },
  }).then((deletedPost) => {
    console.log(deletedPost);
    res.redirect("/posts");
  });
});

//details route
index.get("/post/:id/details", (req, res) => {
  const id = req.params.id;
  console.log(id);
  models.Post.findByPk(id, {
    include: [{
      model: models.Comment,
      as: 'comments'
    }]
  }).then((post) => {
    console.log(post);
    res.render("post-details", post.dataValues);
  });

  //
});

//getting all posts
index.post("/all-posts", (req, res) => {
  res.redirect("/posts");
});

//ability to filter based on category
index.post("/post-category", (req, res) => {
  const category = req.body.category;
  models.Post.findAll({
    where: {
      category: category,
    },
  }).then((posts) => {
    res.render("posts", { posts: posts });
  });
});

//update a post
index.get("/update-post/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);
  models.Post.findByPk(id).then((post) => {
    console.log(post);
    res.render("update-post", post.dataValues);
  });
});

index.post("/update-post/:id", (req, res) => {
    const id = req.params.id;
    const title = req.body.title;
    const body = req.body.body;

    models.Post.update({
        title: title,
        description: body
    }, {
        where: {
            id: id
        }
    }).then(updatedPost => {
        res.redirect('/posts')
    })
});

//creating a comment
index.post('/post/:id/new-comment', (req, res) => {
  const id = req.params.id
  const title = req.body.title;
  const body = req.body.newComment;

  let comment = models.Comment.build({
    post_id: id,
    title: title,
    body: body
  })

  comment.save().then(savedComment => {
    res.redirect(`/post/${id}/details`)
  })
});

// route to delete a comment from a post
index.post("/posts/:post_id/comments/:id/delete", (req,res) => {
  const comment_id = req.params.id
  const post_id = req.params.post_id;

  console.log(post_id, comment_id)
  models.Comment.destroy({
    where: {
      id: comment_id
    }
  }).then(() => {
    res.redirect(`/post/${post_id}/details`);
  })
});
