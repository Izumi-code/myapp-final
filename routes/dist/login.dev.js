"use strict";

var express = require('express');

var router = express.Router();

var session = require('express-session');

var _require = require("@prisma/client"),
    PrismaClient = _require.PrismaClient;

var crypto = require('crypto');

var prisma = new PrismaClient(); // Initialize the session middleware

router.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));
router.get('/', function (req, res) {
  // If user is already logged in, redirect to appropriate page
  if (req.session.user) {
    redirectToDashboard(req.session.user.usertype, res);
  } else {
    // Otherwise, render the login page
    res.render('login', {
      title: 'Login'
    });
  }
});
/* POST login. */

router.post('/login', function _callee(req, res) {
  var _req$body, email, password, user, encryptedPassword;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$body = req.body, email = _req$body.email, password = _req$body.password;
          _context.prev = 1;
          _context.next = 4;
          return regeneratorRuntime.awrap(prisma.user.findUnique({
            where: {
              email: email
            }
          }));

        case 4:
          user = _context.sent;

          if (user) {
            _context.next = 8;
            break;
          }

          res.status(401).send("Invalid email or password");
          return _context.abrupt("return");

        case 8:
          encryptedPassword = crypto.createHash('sha512').update(password).digest('hex');

          if (user.password === encryptedPassword) {
            req.session.user = user;
            redirectToDashboard(user.usertype, res);
          } else {
            res.status(401).send("Invalid email or password");
          }

          _context.next = 16;
          break;

        case 12:
          _context.prev = 12;
          _context.t0 = _context["catch"](1);
          console.error(_context.t0);
          res.status(500).send("Something went wrong");

        case 16:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 12]]);
});

function redirectToDashboard(usertype, res) {
  switch (usertype) {
    case "Admin":
      res.redirect("/adminview/admindashboard");
      break;

    case "Manager":
      res.redirect("/managerview/managerdashboard");
      break;

    case "User":
      res.redirect("/userview/userdashboard");
      break;

    default:
      res.status(400).send("Invalid userType");
  }
}

module.exports = router;