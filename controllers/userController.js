const {
  createSendToken
} = require('./authController');

const AppError = require('../utils/appError');
const dotenv = require('dotenv');
dotenv.config({
  path: './config.env'
});

exports.login = (async (req, res, next) => {
  const mongo = req.app.locals.db;
  const {
    email,
  } = req.body;

  // 1) Check if email and password exist
  if (!email || !pass) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if user exists && password is correct
  const currentUser = await mongo.db(process.env.DATABASE_NAME).collection('Users').findOne({
    email
  });

  //   await bcrypt.compare(candidatePassword, userPassword);
  if (!currentUser || !(currentUser.password === pass)) {
    res.status(404).json({
      status: 'fail',
      message: 'Incorrect email or password',
    });
    return next(new AppError('Incorrect email or password', 404));
  }

  createSendToken(currentUser, 200, res);
});

exports.getUser = (async (req, res, next) => {
  const mongo = req.app.locals.db;
  const id = parseInt(req.params.id);
  result = await mongo.db(process.env.DATABASE_NAME).collection('Users').findOne({
    _id: id,
  });

  if (result) {
    console.log(`Found user(s) with the name '${id}':`);
    res.status(200).json(result);
  } else {
    console.log(`No user found with the name '${id}'`);
    return next(new AppError('Not found user for this id!', 404));
  }
});

exports.getUserByEmail = (async (req, res, next) => {
  const mongo = req.app.locals.db;
  const email = req.params.email;
  result = await mongo.db(process.env.DATABASE_NAME).collection('Users').findOne({
    email
  });

  if (result) {
    return res.status(200).json(result);
  } else {
    console.log(`No user found with the name '${email}'`);
    return next(new AppError('Not found user for this email!', 404));
  }
});

exports.updateUser = (async (req, res, next) => {
  const mongo = req.app.locals.db;
  const id = parseInt(req.params.id);
  result = await mongo.db(process.env.DATABASE_NAME).collection('Users').updateOne({
    _id: id,
  }, {
    $set: req.body,
  });

  if (!result) {
    return next(new AppError('Not found this id', 404));
  }

  console.log(`${result.matchedCount} document(s) matched the query criteria.`);
  console.log(`${result.modifiedCount} document(s) was/were updated.`);
  res.status(200).json({
    status: 'success',
    data: {
      user: result,
    },
  });
})