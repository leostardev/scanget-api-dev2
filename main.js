require('dotenv').config();
let express = require('express');
let path = require('path');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let database = require('@common/database');
let cors = require('cors');
const Sentry = require('@sentry/node');

let app = express();
if (process.env.AWS_ENV) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: 'sng-api'
  });
  app.use(Sentry.Handlers.requestHandler());
}
database.connect();
// view engine setup
app.set(`views`, path.join(__dirname, `views`));
app.set(`view engine`, `jade`);
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, `public`, `favicon.ico`)));
app.use(cors());
app.use(logger(`dev`));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, `public`)));

//Setup Passport.js for token based user auth
// require('@common/auth');

module.exports = app;
