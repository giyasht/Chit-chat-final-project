const express = require('express');
const PostController = require('../Controller/postController');
const authController = require('../Controller/authController');

//Creating a Express Router for Like Routes
const router = express.Router({ mergeParams: true });

//Protects a Route from Unautheticated user
router.use(authController.protectAccess);
router.route('/').patch(PostController.Like);

//Exporting Routes
module.exports = router;
