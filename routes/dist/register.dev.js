"use strict";

var express = require('express');

var router = express.Router();

var session = require('express-session');

var crypto = require('crypto');

var _require = require("@prisma/client"),
    PrismaClient = _require.PrismaClient;

var _require2 = require('uuid'),
    uuidv4 = _require2.v4;

var prisma = new PrismaClient();
router.use(session({
  genid: function genid(req) {
    return uuidv4(); // Generate a unique session ID for each session
  },
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    // Set to true if using HTTPS
    httpOnly: true,
    // Restrict access to cookies to HTTP(S) requests
    maxAge: 24 * 60 * 60 * 1000 // Expiration time for the cookie (in milliseconds)

  }
}));
/* GET register page. */

router.get('/register', function _callee(req, res, next) {
  var users;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!req.session.user) {
            _context.next = 7;
            break;
          }

          _context.next = 3;
          return regeneratorRuntime.awrap(prisma.user.findMany());

        case 3:
          users = _context.sent;
          res.render('register', {
            title: 'Register'
          });
          _context.next = 8;
          break;

        case 7:
          res.redirect('/login');

        case 8:
        case "end":
          return _context.stop();
      }
    }
  });
});
/* POST register page. */

router.post('/register', function _callee2(req, res, next) {
  var _req$body, firstname, lastname, email, password, usertype, hash, encryptedPassword, user;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body = req.body, firstname = _req$body.firstname, lastname = _req$body.lastname, email = _req$body.email, password = _req$body.password, usertype = _req$body.usertype; //   Encrypt password using SHA256

          hash = crypto.createHash('sha512');
          hash.update(password);
          encryptedPassword = hash.digest('hex');
          _context2.prev = 4;
          _context2.next = 7;
          return regeneratorRuntime.awrap(prisma.user.create({
            data: {
              firstname: firstname,
              lastname: lastname,
              email: email,
              password: encryptedPassword,
              // Store encrypted password
              // password,
              usertype: usertype
            }
          }));

        case 7:
          user = _context2.sent;
          res.redirect('/adminview/admindashboard');
          _context2.next = 14;
          break;

        case 11:
          _context2.prev = 11;
          _context2.t0 = _context2["catch"](4);

          if (_context2.t0.code === 'P2002') {
            res.status(400).render('/register', {
              title: 'Register',
              error: 'Email already exists.'
            });
          } else {
            console.error(_context2.t0);
            res.status(500).render('/register', {
              title: 'Register',
              error: 'Something went wrong. Please try again later.'
            });
          }

        case 14:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[4, 11]]);
});
module.exports = router;