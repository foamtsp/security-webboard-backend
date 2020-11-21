const fireAdmin = require('firebase-admin');
const serviceAccount = require("../security-auth-1ffeb-firebase-adminsdk.json");
const dotenv = require('dotenv');
const CryptoJS = require('crypto-js');
dotenv.config({
  path: './config.env'
});

// Initialize Firebase
const admin = fireAdmin.initializeApp({
  credential: fireAdmin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL
});

exports.createSendToken = (user, statusCode, req, res) => {
  // Get the ID token passed and the CSRF token.
  const idToken = req.body.idToken.toString();
  const csrfToken = req.body.csrfToken.toString();
  // Guard against CSRF attacks.
  if (csrfToken !== process.env.CSRF_TOKEN) {
    res.status(401).send('UNAUTHORIZED REQUEST!');
    return;
  }
  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  // Create the session cookie. This will also verify the ID token in the process.
  // The session cookie will have the same claims as the ID token.
  // To only allow session cookie setting on recent sign-in, auth_time in ID token
  // can be checked to ensure user was recently signed in before creating a session cookie.
  admin.auth().createSessionCookie(idToken, {expiresIn})
    .then((sessionCookie) => {
     // Set cookie policy for session cookie.
     let enToken = CryptoJS.AES.encrypt(JSON.stringify(`Bearer ${sessionCookie}`), process.env.PASSWORD_SECRET).toString();
     res.send(JSON.stringify({
       token: enToken,
       status: 'success',
       data: {
          user
       }
      }));
    }, error => {
      console.log(error)
      res.status(401).send('UNAUTHORIZED REQUEST!');
    });
};

exports.protect = (req, res, next) => {

  let sessionCookie;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    sessionCookie = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    sessionCookie = req.cookies.jwt;
  }
  // Verify the session cookie. In this case an additional check is added to detect
  // if the user's Firebase session was revoked, user deleted/disabled, etc.
  admin.auth().verifySessionCookie(
    sessionCookie, true /** checkRevoked */)
    .then((decodedClaims) => {
      next();
    })
    .catch(error => {
      // Session cookie is unavailable or invalid. Force user to login.
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access',
      });
    });

};

exports.logout = (req, res) => {
  res.clearCookie('session');
  res.status(200).json({
    status: 'success',
  });
};
