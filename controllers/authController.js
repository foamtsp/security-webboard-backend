const fireadmin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config({
  path: './config.env'
});

var firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
};

// Initialize Firebase
const admin = fireadmin.initializeApp(firebaseConfig);

exports.createSendToken = (user, statusCode, res) => {
  // Get the ID token passed and the CSRF token.
  const idToken = req.body.idToken.toString();
  const csrfToken = req.body.csrfToken.toString();
  // Guard against CSRF attacks.
  if (csrfToken !== req.cookies.csrfToken) {
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
     const options = {maxAge: expiresIn, httpOnly: true, secure: true};
     res.cookie('session', sessionCookie, options);
     res.end(JSON.stringify({
       status: 'success',
       data: {
          user
      },
      }));
    }, error => {
     res.status(401).send('UNAUTHORIZED REQUEST!');
    });
};

exports.protect = (req, res, next) => {

  const sessionCookie = req.cookies.session || '';
  // Verify the session cookie. In this case an additional check is added to detect
  // if the user's Firebase session was revoked, user deleted/disabled, etc.
  admin.auth().verifySessionCookie(
    sessionCookie, true /** checkRevoked */)
    .then((decodedClaims) => {
      next(decodedClaims);
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
