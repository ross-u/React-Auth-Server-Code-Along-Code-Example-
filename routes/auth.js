const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require('../models/user');

// HELPER FUNCTIONS
const {
  isLoggedIn,
  isNotLoggedIn,
  validationLoggin,
} = require('../helpers/middlewares');

//  GET    '/me'
router.get('/me', isLoggedIn, (req, res, next) => {
  req.session.currentUser.password = '*';
  res.json(req.session.currentUser);
});

//  POST    '/signup'
router.post(
  '/signup',
  isNotLoggedIn,
  validationLoggin,
  async (req, res, next) => {
    const { username, password } = req.body;

    try {
      // projection
      const usernameExists = await User.findOne({ username }, 'username');

      if (usernameExists) return next(createError(400));
      else {
        const salt = bcrypt.genSaltSync(saltRounds);
        const hashPass = bcrypt.hashSync(password, salt);
        const newUser = await User.create({ username, password: hashPass });
        req.session.currentUser = newUser;
        res
          .status(200) //  OK
          .json(newUser);
      }
    } catch (error) {
      next(error);
    }
  },
);

//  POST    '/login'
router.post(
  '/login',
  isNotLoggedIn,
  validationLoggin,
  async (req, res, next) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });
      if (!user) {
        next(createError(404));
      } else if (bcrypt.compareSync(password, user.password)) {
        req.session.currentUser = user;
        res.status(200).json(user);
        return;
      } else {
        next(createError(401));
      }
    } catch (error) {
      next(error);
    }
  },
);

//  POST    '/logout'
router.post('/logout', isLoggedIn, (req, res, next) => {
  const { username } = req.session.currentUser;
  req.session.destroy();
  res
    .status(200) //  No Content
    .json({ message: `User '${username}' logged out - session destroyed` });
  return;
});

//  GET    '/private'   --> Only for testing - Same as /me but it returns a message instead
router.get('/private', isLoggedIn, (req, res, next) => {
  res
    .status(200) // OK
    .json({ message: 'Test - User is logged in' });
});

module.exports = router;
