const { db } = require('../util/admin');

exports.getAllPosts = (req, res) => {
  db.collection("posts")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let posts = [];
      data.forEach(doc => {
        posts.push({
          postId: doc.id,
          body: doc.data().body,
          username: doc.data().username,
          createdAt: doc.data().createdAt
        });
      });
      return res.json(posts);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
  }

exports.makeANewPost = (req, res) => {
  const newPost = {
    body: req.body.body,
    username: req.user.username,
    createdAt: new Date().toISOString()
  };
  db.collection("posts")
    .add(newPost)
    .then(doc => {
      return res.json({ message: `document ${doc.id} created succesfully` });
    })
    .catch(err => {
      res.status(500).json({
        error: "Sorry, something went wrong."
      });
      console.error(err);
    });
}