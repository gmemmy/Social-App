/* eslint-disable consistent-return */
/* eslint-disable no-useless-escape */
/* eslint-disable promise/always-return */
const functions = require("firebase-functions");

const app = require("express")();
const FBAuth = require("./util/fbAuth");

const {
  getAllPosts,
  getOnePost,
  commentOnPost,
  makeANewPost,
  likePost,
  unlikePost
} = require("./handlers/posts");
const {
  signUp,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser
} = require("./handlers/users");

// Post routes
app.get("/posts", getAllPosts);
app.get("/post/:postId", getOnePost);
app.post("/post/:postId/comment", FBAuth, commentOnPost);
app.post("/post", FBAuth, makeANewPost);
app.get("/post/:postId/like", FBAuth, likePost);
app.get("/post/:postId/unlike", FBAuth, unlikePost);

// Authentication route
app.post("/signup", signUp);
app.post("/login", login);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);
app.post("/user/image", FBAuth, uploadImage);

exports.api = functions.https.onRequest(app);
