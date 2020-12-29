const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/register', (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.redirect('/register?message=missing_fields');

    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password], (err) => {
        if (err)
            return next(err);
        return res.redirect('/login?message=registration_successful');
    });
});

router.post('/login', (req, res, next) => {
  // Handle login
  const { username, password } = req.body; 

  if (!username || !password)
    res.send("missing username or password!");

  console.log(username, password);

  db.all('SELECT id, username, password FROM users WHERE username=? AND password=?', [username, password], (err, rows) => {
    if (err)
      next(err);
    else {
      if (rows.length > 0) {
        let user = rows[0];

        // Found a user, let's set the session
        const sessionId = req.session;
        // TODO: the session id might be invalid (doesnt exist in db)
        // probably need to check it first
        db.run('UPDATE sessions SET user_id=? WHERE id=?', [user.id, sessionId], (err) => {
          if (err)
            next(err);
          else
            return res.redirect('/profile');
        });
      } else {
        // No matching rows were found = invalid user or password
        return res.redirect('/login?message=login_failed');
      }
    }
  });
});

module.exports = router;