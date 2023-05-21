const express = require('express');
const router = express.Router();
const session = require('express-session');
const crypto = require('crypto');
const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require('uuid');
const { render } = require('ejs');

const prisma = new PrismaClient();

/* GET manager page. */
router.get('/userview/userdashboard', async function (req, res, next) {
    try {
      const user = req.session.user; // Fetch the user data from session
      if (!user || user.usertype !== 'User') {
        // If user is not logged in or not an admin, redirect to login page
        res.redirect('/login');
        return;
      }
  
      const query = req.query.q // Get the value of the 'q' parameter from the query string
      const users = await prisma.user.findMany()
      let filteredUsers = users.filter(user => user.usertype === 'User')
  
      if (query) { // If a search query is provided, filter the results
        filteredUsers = filteredUsers.filter(user => {
          const fullName = `${user.firstname} ${user.middlename ? user.middlename + ' ' : ''}${user.lastname}`
          return fullName.toLowerCase().includes(query.toLowerCase()) || user.email.toLowerCase().includes(query.toLowerCase())
        })
      }
  
      res.render('userview/userdashboard', { title: 'User', users: filteredUsers, isEmpty: filteredUsers.length === 0, query: query });
    } catch (err) {
      console.error(err)
      next(err)
    }
  });

    /* GET user profile page. */ 
router.get('/userview/userProfile', async function(req, res, next) {
    try {
      const user = req.session.user; // Fetch the user data from session
      if (!user || user.usertype !== 'User') {
        // If user is not logged in or not an admin, redirect to login page
        res.redirect('/');
        return;
      }
  
      res.render('userview/userProfile', { title: 'User Profile', user: user });
    } catch (err) {
      console.error(err)
      next(err)
    }
  });

   /* GET user profile delete confirmation page. */ 
router.get('/userview/deleteUserProfile', async function(req, res, next) {
    try {
      const user = req.session.user; // Fetch the user data from session
      if (!user || user.usertype !== 'User') {
        // If user is not logged in or not an admin, redirect to login page
        res.redirect('/');
        return;
      }  
  
      res.render('userview/deleteUserProfile', { title: 'Delete User Profile', user: user });
    } catch (err) {
      console.error(err)
      next(err)
    }
  });

  /* POST admin profile delete confirmation page. */
  router.post('/userview/userprofiledeleteconfirm', async function(req, res, next) {
    try {
      const user = req.session.user; // Fetch the user data from session
  
      if (!user || user.usertype !== 'User') {
        // If user is not logged in or not an admin, redirect to login page
        res.redirect('/');
        return;
      }
  
      const password = req.body.password; // Get the password from the request body
  
      // Retrieve the hashed password from the database
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      const storedPassword = dbUser.password;
  
      // Hash the entered password using SHA256
      const hash = crypto.createHash('sha512');
      hash.update(password);
      const enteredPassword = hash.digest('hex');
  
      // Check if the entered password matches the stored password
      if (enteredPassword !== storedPassword) {
        // If passwords don't match, render the delete confirmation page with an error message
        return res.render('userview/deleteUserProfile', { title: 'Delete User Profile', user: user, error: 'Password is incorrect. Account cannot be deleted.' });
      }
  
      // Delete the user account from the database
      if (enteredPassword == storedPassword) {
        await prisma.user.delete({
            where: { id: user.id }
          });
      }
  
      // Clear the user data from the session and redirect to login page
      req.session.user = null;
      res.redirect('/');
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

  module.exports = router;
