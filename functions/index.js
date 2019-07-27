/* eslint-disable no-template-curly-in-string */
/* eslint-disable consistent-return */
/* eslint-disable no-useless-escape */
/* eslint-disable promise/always-return */
const functions = require("firebase-functions");

const app = require("express")();
const FBAuth = require("./util/fbAuth");
const { db } = require("./util/admin");

const {
  getAllPosts,
  getOnePost,
  commentOnPost,
  makeANewPost,
  likePost,
  unlikePost,
  deletePost
} = require("./handlers/posts");
const {
  signUp,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead
} = require("./handlers/users");

// Post routes
app.get("/posts", getAllPosts);
app.get("/post/:postId", getOnePost);
app.post("/post/:postId/comment", FBAuth, commentOnPost);
app.post("/post", FBAuth, makeANewPost);
app.get("/post/:postId/like", FBAuth, likePost);
app.get("/post/:postId/unlike", FBAuth, unlikePost);
app.delete("/post/:postId", FBAuth, deletePost);

// Authentication routes
app.post("/signup", signUp);
app.post("/login", login);

// User routes
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);
app.get("/user/:username", getUserDetails);
app.post("/notifications", FBAuth, markNotificationsRead);
app.post("/user/image", FBAuth, uploadImage);

exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore
  .document('likes/{id}')
  .onCreate(snapshot => {
    return db.doc(`/posts/${snapshot.data().postId}`)
      .get()
      .then(doc => {
        if (doc.exists && doc.data().username !== snapshot.data().username) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().username,
            sender: snapshot.data().username,
            type: "like",
            read: false,
            postId: doc.id
          });
        }
      })
      .catch(err => console.error(err));
  });

exports.deleteNotificationOnUnlike = functions.firestore
  .document('likes/{id}')
  .onDelete(snapshot => {
    return db.doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch(err => console.error(err));
  });

exports.createNotificationOnComment = functions.firestore
  .document('comments/{id}')
  .onCreate(snapshot => {
    return db.doc(`/posts/${snapshot.data().postId}`)
      .get()
      .then(doc => {
        if (doc.exists && doc.data().username !== snapshot.data().username) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().username,
            sender: snapshot.data().username,
            type: "comment",
            read: false,
            postId: doc.id
          });
        }
      })
      .catch(err => console.error(err));
  });
