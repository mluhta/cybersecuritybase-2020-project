const express = require('express');
const router = express.Router();

const errorMessages = {
  login_failed: {
    message: 'Invalid username or password!',
    className: 'alert-danger'
  }, 
  missing_fields: {
    message: 'Missing required form fields!',
    className: 'alert-warning',
  },
  registration_successful: {
    message: 'Successfully registered an account, please log in!',
    className: 'alert-success',
  },
}
const db = require('../db');

router.get('/', function(req, res) {
  // Get "recently" uploaded videos
  db.all(`SELECT V.id, V.title, V.youtubeId FROM videos AS V
          LEFT JOIN users AS U ON V.user_id=U.id
          LIMIT 4`, (err, rows) => {
    if (err)
      next(err);
    else
      res.render('index', {user: req.user, videos: rows});
  });
});

router.get('/login', (req, res) => {
  if (!req.user)
    return res.render('login', {
      user: req.user,
      message: errorMessages[req.query.message],
    });
  return res.redirect("/profile?already_logged_in");
});

router.get('/register', (req, res) => {
  if (!req.user)
    return res.render('register', {
      user: req.user,
      message: errorMessages[req.query.message],
    });
  return res.redirect('/profile?already_logged_in');
});

function getUserVideos(userId) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT V.id, V.title, V.description, V.uploadDate, U.username
            FROM videos AS V LEFT JOIN users AS U ON V.user_id=U.id
            WHERE V.user_id=?`, [userId], (err, rows) => {
              if (err)
                return reject(err);
              return resolve(rows);
          });
  });
}

function getUserSessions(userId) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT S.id, S.active FROM sessions AS S
            LEFT JOIN users AS U ON S.user_id=U.id
            WHERE S.user_id=?`, [userId], (err, rows) => {
              if (err)
                return reject(err);
              return resolve(rows);
          });
  });
}

router.get('/profile', async (req, res, next) => {
  // Login required
  if (!req.user)
    res.redirect('/login');
  else {
    try {
      let videos = await getUserVideos(req.user.id);
      let sessions = await getUserSessions(req.user.id);
      return res.render('profile', {user: req.user, videos, sessions})
    } catch (error) {
      next(error);
    }
  }
});

router.get('/search', (req, res) => res.redirect('/'));

router.post('/search', (req, res, next) => {
  const query = req.body.query;
  const sql = `SELECT * FROM videos WHERE title LIKE '%${query}%'`;
  console.log(sql);

  db.all(sql, (err, rows) => {
    if (err) {
      next(err);
    } else {
      console.log(rows);
      res.render('search', {user: undefined, query, results: rows});
    }
  });
})

router.get('/videos/add', (req, res) => {
  if (!req.user)
    return res.redirect('/login');
  return res.render('videos-add', {
    user: req.user, message: errorMessages[req.query.message]});
});

router.post('/videos', (req, res, next) => {
  if (!req.user)
    return res.sendStatus(403);

  const {title, description, youtubeId} = req.body;

  if (!title || !description || !youtubeId)
    return res.redirect('/videos/add?message=missing_fields');
  
  db.run(`INSERT INTO videos
          (user_id, title, description, youtubeId, uploadDate)
          VALUES (?, ?, ?, ?, ?)`, [req.user.id, title, description, youtubeId, (+new Date())], function (err) {
            if (err)
              return next(err);
            return res.redirect(`/videos/${this.lastID}`)
          });
});

router.get('/videos/:videoId', (req, res) => {
  const videoId = req.params.videoId;

  db.all(`SELECT V.id, V.youtubeId, V.title, V.description, V.uploadDate, U.username FROM videos AS V
          LEFT JOIN users AS U ON V.user_id=U.id
          WHERE V.id=?`, [videoId], (err, rows) => {
    if (err)
      next(err);
    else
      if (rows.length > 0)
        return res.render('video', {user: req.user, video: rows[0]})
      return res.sendStatus(404);
  });
});

router.delete('/videos/:videoId', (req, res, next) => {
  const videoId = req.params.videoId;
  if (!req.user)
    res.sendStatus(403);
  else {
    db.run(`DELETE FROM videos WHERE id=?`, [videoId], (err) => {
      if (err)
        return next(err);
      return res.sendStatus(200);
    });
  };
})

module.exports = router;
