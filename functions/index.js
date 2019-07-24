/* eslint-disable consistent-return */
/* eslint-disable no-useless-escape */
/* eslint-disable promise/always-return */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();
admin.initializeApp();

const config = {
  apiKey: "AIzaSyDDg3RKbCriCpgYg8H4IJfDYklU6m7Ep_4",
  authDomain: "social-app-d3eeb.firebaseapp.com",
  databaseURL: "https://social-app-d3eeb.firebaseio.com",
  projectId: "social-app-d3eeb",
  storageBucket: "social-app-d3eeb.appspot.com",
  messagingSenderId: "124783971440",
  appId: "1:124783971440:web:8565143d9bba0a74"
};

const firebase = require("firebase");
firebase.initializeApp(config);

const db = admin.firestore();

app.get("/posts", (req, res) => {
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
    .catch(err => console.error(err));
});

// Routes token middleware
const FBAuth = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("No token found");
    return res.status(403).json({ error: "Unauthorized!" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      console.log(decodedToken);
      return db
        .collection("users")
        .where("U serId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then(data => {
      req.user.username = data.docs[0].data().username;
      return next();
    })
    .catch(err => {
      console.error("Error while verifying token", err);
      return res.status(403).json(err);
    });
};

app.post("/post", FBAuth, (req, res) => {
  const newPost = {
    body: req.body.body,
    username: req.user.username,
    createdAt: new Date().toISOString()
  };
  db.collection("posts")
    .add(newPost)
    .then(doc => {
      res.json({ message: `document ${doc.id} created succesfully` });
    })
    .catch(err => {
      res.status(500).json({
        error: "Sorry, something went wrong."
      });
      console.error(err);
    });
});

const isEmail = email => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

const isEmpty = string => {
  if (string.trim() === "") {
    return true;
  } else return false;
};

// Signup route
// eslint-disable-next-line consistent-return
app.post("/signup", (req, res) => {
  const { email, password, confirmPassword, username } = req.body;
  const newUser = {
    email: email,
    password: password,
    confirmPassword: confirmPassword,
    username: username
  };

  let errors = {};

  // Auth validation
  if (isEmpty(newUser.email)) {
    errors.email = "Must not be empty";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Must be a valid email address";
  }

  if (isEmpty(newUser.password)) {
    errors.password = "Must not be empty";
  }
  if (newUser.password !== newUser.confirmPassword) {
    errors.confirmPassword = "Passwords must match";
  }
  if (isEmpty(newUser.username)) {
    errors.username = "Must not be empty";
  }

  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

  // TODO validate data
  let token, UserId;
  db.doc(`/users/${newUser.username}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res
          .status(400)
          .json({ username: "This username is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      UserId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        username: newUser.username,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        UserId
      };
      return db.doc(`/users/${newUser.username}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already in use" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});

app.post("/login", (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };
  let errors = {};

  if (isEmpty(user.email)) {
    errors.email = "Must not be empty";
  }
  if (isEmpty(user.password)) {
    errors.password = "Must not be empty";
  }

  if (Object.keys(errors).keys.length > 0) {
    return res.status(400).json({ errors });
  }

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token });
    })
    .catch(err => {
      console.error(err);
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-email"
      ) {
        return res
          .status(403)
          .json({ general: "Wrong Credentials, please try again" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});

exports.api = functions.https.onRequest(app);
