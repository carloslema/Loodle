// Set up =======================================================
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./app/routes/index');
var api = require('./app/routes/api');

var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
var i18n = require('i18n');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

// Configuration ===============================================
var database = require("./config/database");
database.init(function (err) {
  if (err) 
    console.log("Error initializing the database : ", err); 
});

require('./config/passport')(passport);

// required for passport
app.use(session({
    secret : 'masupersessionsecrete',
    saveUninitialized : true,
    resave : true
}));
app.use(passport.initialize());
app.use(passport.session());        // persistent login sessions
app.use(flash());                   // flash messages stored in session

// Internationalization
i18n.configure({
  locales: ['en', 'fr'],
  directory: __dirname + '/locales',
  cookie: 'mylanguage'
});

app.use(i18n.init);
app.use(function (req, res, next) {
  if (!req.cookies.mylanguage) {
    res.cookie('mylanguage', 'fr', { maxAge: 900000, httpOnly: false });
  }
  next();
});

// Routes ======================================================
app.use('/', routes);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
