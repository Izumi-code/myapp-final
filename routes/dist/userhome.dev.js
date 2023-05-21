"use strict";

var express = require('express');

var router = express.Router();

var _require = require("@prisma/client"),
    PrismaClient = _require.PrismaClient;

var prisma = new PrismaClient();
/* GET manager page. */

router.get('/userview/userdashboard', function _callee(req, res, next) {
  var user, query, users, filteredUsers;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          user = req.session.user; // Fetch the user data from session

          if (!(!user || user.usertype !== 'User')) {
            _context.next = 5;
            break;
          }

          // If user is not logged in or not an admin, redirect to login page
          res.redirect('/login');
          return _context.abrupt("return");

        case 5:
          query = req.query.q; // Get the value of the 'q' parameter from the query string

          _context.next = 8;
          return regeneratorRuntime.awrap(prisma.user.findMany());

        case 8:
          users = _context.sent;
          filteredUsers = users.filter(function (user) {
            return user.usertype === 'User';
          });

          if (query) {
            // If a search query is provided, filter the results
            filteredUsers = filteredUsers.filter(function (user) {
              var fullName = "".concat(user.firstname, " ").concat(user.middlename ? user.middlename + ' ' : '').concat(user.lastname);
              return fullName.toLowerCase().includes(query.toLowerCase()) || user.email.toLowerCase().includes(query.toLowerCase());
            });
          }

          res.render('userview/userdashboard', {
            title: 'User',
            users: filteredUsers,
            isEmpty: filteredUsers.length === 0,
            query: query
          });
          _context.next = 18;
          break;

        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](0);
          console.error(_context.t0);
          next(_context.t0);

        case 18:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 14]]);
});
module.exports = router;