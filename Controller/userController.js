const User = require('../models/userModel');
const validator = require('validator');
const fs = require('fs');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Story = require('./../models/storyModel');
const multer = require('multer');
const sharp = require('sharp');
const { findById } = require('../models/userModel');

// const { post } = require('../routes/userRoutes');

//Uploading an Image
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an Image! Upload Appropiate Image!!', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

//Uploading Cover photo
exports.uploadPhotoCoverPhoto = upload.fields([
  { name: 'userPhoto', maxCount: 1 },
  { name: 'coverPhoto', maxCount: 1 },
]);

//Resizing Cover photo
exports.resizePhotoCoverPhoto = catchAsync(async (req, res, next) => {
  if (!req.files.userPhoto && !req.files.coverPhoto) return next();
  const loginUser = await User.findById(req.user.id);
  if (req.files.userPhoto) {
    if (loginUser.userPhoto != 'profileD.png')
      fs.unlink(
        `${__dirname}/../public/users/${loginUser.userPhoto}`,
        (err) => {
          if (err) {
            throw err;
          }
        }
      );
    req.body.userPhoto = `user-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.files.userPhoto[0].buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/users/${req.body.userPhoto}`);
  }
  if (req.files.coverPhoto) {
    if (loginUser.coverPhoto != 'coverPhotoD.jpg') {
      fs.unlink(
        `${__dirname}/../public/coverPhoto/${loginUser.coverPhoto}`,
        (err) => {
          if (err) {
            throw err;
          }
        }
      );
    }
    req.body.coverPhoto = `coverPhoto-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.files.coverPhoto[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/coverPhoto/${req.body.coverPhoto}`);
  }
  next();
});
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

//Getting All User
exports.GetAllUser = catchAsync(async (req, res, next) => {
  const AllUser = await User.find();
  res.status(200).json({
    status: 'OK',
    length: AllUser.length,
    data: {
      AllUser,
    },
  });
  //res.status(200).render('users.ejs', { users: AllUser });
});

//Updating My Section
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create an Error If User tries to update Password (Post Password Data)
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password Updates. Please Use /updateMyPassword',
        400
      )
    );
  }

  // Filtered Out unwanted fields name that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    'username',
    'email',
    'DOB',
    'photo',
    'firstname',
    'lastname',
    'phoneNumber',
    'userPhoto',
    'coverPhoto'
  );

  // 2) Update User Document
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

//Deleting
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

//Creating user
exports.CreateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

//Get User
exports.GetUser = catchAsync(async (req, res, next) => {
  const IdUser = await User.findById(req.params.id);

  if (!IdUser) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'OK',
    data: {
      IdUser,
    },
  });
});

//Deleting
exports.DeleteUser = catchAsync(async (req, res, next) => {
  const IdUser = await User.findByIdAndDelete(req.params.id);

  if (!IdUser) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

//Adding Freind
exports.addFriend = catchAsync(async (req, res, next) => {
  const userName = req.params.userName.replace(/ /g, '');
  const searchedUser = await User.find({ username: userName }); // friend User
  if (searchedUser[0]) {
    const userId = searchedUser[0].id; // friends id
    const toBeFriend = await User.findById(userId);
    const index = req.user.friendList.indexOf(userId);
    if (index == -1) {
      req.user.friendList.push(userId);
      toBeFriend.friendList.push(req.user.id);
      req.user.save({ validateBeforeSave: false });
      toBeFriend.save({ validateBeforeSave: false });
    }

    return res.status(200).json({
      status: 'Success',
    });
  } else {
    return next(new AppError('No user found with given id', 404));
  }
});

//Removing Freind
exports.removeFriend = catchAsync(async (req, res, next) => {
  const userName = req.params.userName.replace(/ /g, '');
  const searchedUser = await User.find({ username: userName });
  if (searchedUser[0]) {
    const userId = searchedUser[0].id;
    const toBeNotFriend = await User.findById(userId);
    const CurrentUser = req.user;
    // console.log(userId);
    var index = CurrentUser.friendList.indexOf(userId);
    if (index > -1) {
      CurrentUser.friendList.splice(index, 1);
      CurrentUser.save({ validateBeforeSave: false });
      var new_id = toBeNotFriend.friendList.indexOf(req.user.id);
      if (new_id > -1) {
        toBeNotFriend.friendList.splice(new_id, 1);
        toBeNotFriend.save({ validateBeforeSave: false });
      }
    }
    return res.status(200).json({
      status: 'Success',
    });
  } else {
    return next(new AppError('No user found with given id', 404));
  }
});

exports.getMe = (req, res) => {
  res.status(200).json({
    user: res.locals.user,
  });
};

//Freind List
exports.FriendList = catchAsync(async (req, res, next) => {
  var friends = [];
  var currentUser = req.user;
  for (var i = 0; i < currentUser.friendList.length; i++) {
    var obj = await User.findById(currentUser.friendList[i]);
    if (obj) {
      friends.push(obj);
    }
  }
  res.locals.friendlist = friends;
  next();
});

//Finds a Friend's Story
exports.FriendStory = catchAsync(async (req, res, next) => {
  var friendStory = [];
  var currentUser = req.user;
  for (var i = 0; i < currentUser.friendList.length; i++) {
    var obj = await User.findById(currentUser.friendList[i]);
    if (obj) {
      var arr = [];
      for (var j = 0; j < obj.userStory.length; j++) {
        var findStory = await Story.findById(obj.userStory[j]);
        if (!findStory) {
          arr.push(obj.userStory[j]);
        }
      }
      for (var j = 0; j < arr.length; j++) {
        var index = obj.userStory.indexOf(arr[j]);
        if (index > -1) {
          obj.userStory.splice(index, 1);
        }
      }
      obj.save({ validateBeforeSave: false });
      obj = await User.findById(currentUser.friendList[i]).populate({
        path: 'userStory',
      });

      Arr = [];
      for (var j = 0; j < obj.userStory.length; j++) {
        if (
          Math.floor(Date.now() * 1000 - obj.userStory[j].createdAt) >=
          1615880199999999
        ) {
          var id = obj.userStory[j].id;
          Arr.push(id);
          const findStory = await Story.findById(id);
          if (findStory) {
            if (findStory.storyPhoto) {
              fs.unlink(
                `${__dirname}/../public/story/${findStory.storyPhoto}`,
                (err) => {
                  if (err) {
                    throw err;
                  }
                }
              );
            }
            const story = await Story.findByIdAndDelete(id);
          }
        }
      }
      for (var j = 0; j < Arr.length; j++) {
        var index = obj.userStory.indexOf(Arr[j]);
        if (index > -1) {
          obj.userStory.splice(index, 1);
        }
      }
      obj.save({ validateBeforeSave: false });
      obj = await User.findById(currentUser.friendList[i]).populate({
        path: 'userStory',
      });
      friendStory.push(obj);
    }
  }
  res.locals.friendStory = friendStory;

  // works same as above for current user
  currentUser = req.user;
  var arr = [];
  for (var j = 0; j < currentUser.userStory.length; j++) {
    var findStory = await Story.findById(currentUser.userStory[j]);
    if (!findStory) {
      arr.push(currentUser.userStory[j]);
    }
  }
  for (var j = 0; j < arr.length; j++) {
    var index = currentUser.userStory.indexOf(arr[j]);
    if (index > -1) {
      currentUser.userStory.splice(index, 1);
    }
  }
  currentUser.save({ validateBeforeSave: false });
  currentUser = await User.findById(currentUser.id).populate({
    path: 'userStory',
  });
  Arr = [];
  for (var j = 0; j < currentUser.userStory.length; j++) {
    if (
      Math.floor(Date.now() * 1000 - currentUser.userStory[j].createdAt) >=
      1615880199999999
    ) {
      var id = currentUser.userStory[j].id;
      Arr.push(id);
      const findStory = await Story.findById(id);
      if (findStory) {
        if (findStory.storyPhoto) {
          fs.unlink(
            `${__dirname}/../public/story/${findStory.storyPhoto}`,
            (err) => {
              if (err) {
                throw err;
              }
            }
          );
        }
        const story = await Story.findByIdAndDelete(id);
      }
    }
  }
  for (var j = 0; j < Arr.length; j++) {
    var index = currentUser.userStory.indexOf(Arr[j]);
    if (index > -1) {
      currentUser.userStory.splice(index, 1);
    }
  }
  currentUser.save({ validateBeforeSave: false });
  currentUser = await User.findById(currentUser.id).populate({
    path: 'userStory',
  });
  req.user = currentUser;
  next();
});
