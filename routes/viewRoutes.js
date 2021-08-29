const { response } = require('express');
const express = require('express');
// const postController = require('./../Controller/postController');
const User = require('./../models/userModel');
const authController = require('./../Controller/authController');
const userController = require('./../Controller/userController');
const Post = require('./../models/postModel');
const axios = require('axios');
const AppError = require('../utils/appError');

const router = express.Router();

//Login With jwt Token
router.route('/login').get((req, res, next) => {
  let token;
  if (req.cookies.jwt) token = req.cookies.jwt;
  if (!token) res.render('authorization.ejs');
  else res.redirect('/newsFeed');
});
// router.route('/register').get((req, res, next) => {
//   res.render('register.ejs');
// });

// router.route('/forgotPassword').get((req, res, next) => {
//   res.render('forgotPassword.ejs');
// });

// router.use(authController.protectAccess);

router.get('/', (req, res) => {
  res.render('homepage.ejs');
});

//Protects a Route from Unautheticated user
router
  .route('/newsFeed')
  .get(
    authController.protectAccess,
    userController.FriendList,
    userController.FriendStory,
    async (req, res, next) => {
      const post = await Post.find().populate({ path: 'authorId' });
      User.findRandom(
        {
          $and: [
            { _id: { $nin: req.user.friendList } },
            { _id: { $ne: req.user.id } },
          ],
        },
        {},
        { limit: 6 },
        function (err, results) {
          if (err) next(new AppError(err, 404));
          if (!results) {
            results = [];
          }
          res.render('newsFeed.ejs', {
            allPosts: post,
            friendSuggestion: results,
            data: Math.floor(Math.random() * 100),
          });
        }
      );
    }
  );
router
  .route('/profile')
  .get(
    authController.protectAccess,
    userController.FriendList,
    async (req, res, next) => {
      const post = await Post.find({ authorId: req.user.id }).populate({
        path: 'authorId',
      });
      res.render('profile.ejs', { allPosts: post });
    }
  );

router.get(
  '/chatting',
  authController.protectAccess,
  userController.FriendList,
  (req, res, next) => {
    res.render('messageindex.ejs');
  }
);

router.get(
  '/chatting/:roomname',
  authController.protectAccess,
  (req, res, next) => {
    var str = req.params.roomname.split('*');
    var uname = req.user.username;
    if (uname ===str[0] || uname===str[1]) {
      res.render('chatting', { user: req.user, room: req.params.roomname });
    } else {
      res.send("Sorrry, you can't access this URL.");
    }
  }
);

router.get(
  '/chatting/group/:roomid',
  authController.protectAccess,
  (req, res, next) => {
    res.render('chattinggroup', { user: req.user, room: req.params.roomid });
  }
);
//Exporting
module.exports = router;
