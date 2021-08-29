// Three Function Error's are not Working Have to Look
// TODO : To resolve nonOperationalErrors
const AppError = require('./../utils/appError');

//Handles Casting Error
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};


//Handles DataBase Duplicate Key Error
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  // console.log(value);
  const message = `Duplicate field value : ${value}. Please use another value!`;
  return new AppError(message, 400);
};

//Handle Validation Error in DB
const handleValidationErrorDB = (err) => {
  console.log('I came here');
  const error = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${error.join(' ')}`;
  return new AppError(message, 400);
};

//Sending Error
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

//Sending Error during Production
const sendErrorProd = (err, res) => {
  // Operational Error
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming Error
  else {
    console.log('ERROR 💥', err);

    // Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went Very Wrong!',
    });
  }
};

//Exports all Error functions above
module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    console.log(error);
    // Portion to be changed
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(errors);

    sendErrorProd(error, res);
  }
};
