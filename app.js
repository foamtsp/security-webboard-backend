const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const optionsMiddleware = require('./utils/setHeaders');
const userRouter = require('./routes/userRoutes');
const blogRouter = require('./routes/blogRoutes');

const app = express();

app.enable('trust proxy');

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body and set Limit
app.use(
  express.json({
    limit: '10kb',
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb',
  })
);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Cookie parser
app.use(cookieParser());
app.use(optionsMiddleware.setHeaders);

// // Routes
app.use('/api/users', userRouter);
app.use('/api/blogs', blogRouter);

app.all('*', (req, res, next) => {  
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

app.use((req, res, next) => {
  res.status(404).send('<h1>Page not found<h1>');
})

module.exports = app;
