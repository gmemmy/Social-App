/* eslint-disable consistent-return */
/* eslint-disable no-useless-escape */
/* eslint-disable promise/always-return */
const functions = require("firebase-functions");

const app = require("express")();
const FBAuth = require("./util/fbAuth");

const { getAllPosts, makeANewPost } = require("./handlers/posts");
const {
  signUp,
  login,
  uploadImage,
  addUserDetails
} = require("./handlers/users");

// Post routes
app.get("/posts", getAllPosts);
app.post("/post", FBAuth, makeANewPost);
app.post("/user", FBAuth, addUserDetails);

// Authentication route
app.post("/signup", signUp);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);

exports.api = functions.https.onRequest(app);
