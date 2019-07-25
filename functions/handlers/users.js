/* eslint-disable consistent-return */
const{ db }= require('../util/admin');
const {config} = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp(config);

const { validateSignup, validateLogin } = require('../util/validator');

exports.signUp = (req, res) => {
  const { email, password, confirmPassword, username } = req.body;
  const newUser = {
    email: email,
    password: password,
    confirmPassword: confirmPassword,
    username: username
  };

  const { valid, errors } = validateSignup(newUser);
  if (!valid) return res.status(400).json({ errors });
  
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
}

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };
  const { valid, errors } = validateLogin(user);
  if (!valid) return res.status(400).json({ errors })

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
}