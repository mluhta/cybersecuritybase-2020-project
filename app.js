const express = require('express');
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const db = require('./db');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Generates a new session in the DB and set's the session cookie
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function newSession(req, res, next) {
  db.run('INSERT INTO sessions DEFAULT VALUES', function (err) {
    if (err)
      return next(err);
    res.cookie("my-session", this.lastID);
    req.session = this.lastID;
    return next();
  });
}

// Authentication middleware
app.use((req, res, next) => {
  const sessionId = req.cookies["my-session"];
  req.session = sessionId;

  if (sessionId) {
    // Session cookie exists, let's search for it
    db.all(`SELECT id FROM sessions WHERE id=?`, [sessionId], (err, rows) => {
      if (err)
        return next(err);
      if (rows.length) {
        // Session ID was found from the DB, check if it's logged in
        db.all(`SELECT U.id, U.username FROM sessions AS S
                LEFT JOIN users AS U ON S.user_id=U.id
                WHERE S.user_id IS NOT NULL AND S.id=? AND S.active=1`, [sessionId], (err, rows) => {
                  if (err)
                    return next(err);
                  if (rows.length)
                    req.user = rows[0];  // Logged in session found, set the user
                  return next();
                });
      } else {
        // Session ID was not found from the DB, create new session
        return newSession(req, res, next);
      }
    })
  } else
    return newSession(req, res, next); // Session cookie doesn't exist, create new session
});

app.use('/', require('./routes'));
app.use('/', require('./routes/auth'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = err;
  res.locals.environment = Object.keys(process.env).map(key => `${key}: ${process.env[key]}`).join(" \n");

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
