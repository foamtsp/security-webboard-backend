const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

exports.createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 1000
    ),
    // httpOnly: true,
  };

  // if (process.env.NODE_ENV === 'production') {
  //   cookieOptions.secure = true;
  // }

  res.cookie('jwt', token, cookieOptions);

  // Remove the password from the output
  user.password = undefined;

  console.log(`User with the following id: ${user._id}`);
  res.status(statusCode).json({
    status: 'success',
    data: {
      user,
    },
  });
};

exports.protect = (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    console.log(req.headers);
    return res.status(401).json({
      status: 'fail',
      message: 'You are not logged in! Please log in to get access',
    });
    // throw new Error('You are not logged in! Please log in to get access', 401);
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  next();
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    // httpOnly: true
  });
  res.status(200).json({
    status: 'success',
  });
};
