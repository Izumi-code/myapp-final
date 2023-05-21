const express = require('express');
const router = express.Router();
const session = require('express-session');
const { PrismaClient } = require("@prisma/client");
const crypto = require('crypto');
const app = express();
const prisma = new PrismaClient()

/* GET manager page. */
router.get('/managerview/managerdashboard', async function (req, res, next) {
    try {
      const user = req.session.user; // Fetch the user data from session
      if (!user || user.usertype !== 'Manager') {
        // If user is not logged in or not an admin, redirect to login page
        res.redirect('/login');
        return;
      }
  
      const query = req.query.q // Get the value of the 'q' parameter from the query string
      const users = await prisma.user.findMany()
      let filteredUsers = users.filter(user => user.usertype === 'Manager' || user.usertype === 'User')
  
      if (query) { // If a search query is provided, filter the results
        filteredUsers = filteredUsers.filter(user => {
          const fullName = `${user.firstname} ${user.middlename ? user.middlename + ' ' : ''}${user.lastname}`
          return fullName.toLowerCase().includes(query.toLowerCase()) || user.email.toLowerCase().includes(query.toLowerCase())
        })
      }
  
      res.render('managerview/managerdashboard', { title: 'Manager', users: filteredUsers, isEmpty: filteredUsers.length === 0, query: query });
    } catch (err) {
      console.error(err)
      next(err)
    }
  });

  /* GET manager records page. */
router.get('/managerview/managerRecord', async function(req, res, next) {
    try {
      const user = req.session.user; // Fetch the user data from session
      if (!user || user.usertype !== 'Manager') {
        // If user is not logged in or not an admin, redirect to login page
        res.redirect('/');
        return;
      }
      const query = req.query.q // Get the value of the 'q' parameter from the query string
      const users = await prisma.user.findMany()
      let filteredUsers = users.filter(user => user.usertype === 'Manager')
  
      if (query) { // If a search query is provided, filter the results
        filteredUsers = filteredUsers.filter(user => {
          const fullName = `${user.firstname} ${user.middlename ? user.middlename + ' ' : ''}${user.lastname}`
          return fullName.toLowerCase().includes(query.toLowerCase()) || user.email.toLowerCase().includes(query.toLowerCase())
        })
      }
  
      res.render('managerview/managerRecord', { title: 'Manager', users: filteredUsers, isEmpty: filteredUsers.length === 0, query: query });
    } catch (err) {
      console.error(err)
      next(err)
    }
  });

  /* GET user records page. */
router.get('/managerview/userRecord', async function(req, res, next) {
    try {
      const user = req.session.user; // Fetch the user data from session
      if (!user || user.usertype !== 'Manager') {
        // If user is not logged in or not an admin, redirect to login page
        res.redirect('/');
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
  
      res.render('managerview/userRecord', { title: 'User', users: filteredUsers, isEmpty: filteredUsers.length === 0, query: query });
    } catch (err) {
      console.error(err)
      next(err)
    }
  });

    /* GET manager profile page. */ 
router.get('/managerview/managerProfile', async function(req, res, next) {
    try {
      const user = req.session.user; // Fetch the user data from session
      if (!user || user.usertype !== 'Manager') {
        // If user is not logged in or not an admin, redirect to login page
        res.redirect('/');
        return;
      }
  
      res.render('managerview/managerProfile', { title: 'Manager Profile', user: user });
    } catch (err) {
      console.error(err)
      next(err)
    }
  });

  /* GET manager profile delete confirmation page. */ 
router.get('/managerview/deleteManagerProfile', async function(req, res, next) {
    try {
      const user = req.session.user; // Fetch the user data from session
      if (!user || user.usertype !== 'Manager') {
        // If user is not logged in or not an admin, redirect to login page
        res.redirect('/');
        return;
      }  
  
      res.render('managerview/deleteManagerProfile', { title: 'Delete Manager Profile', user: user });
    } catch (err) {
      console.error(err)
      next(err)
    }
  });

  /* POST admin profile delete confirmation page. */
  router.post('/managerview/managerprofiledeleteconfirm', async function(req, res, next) {
    try {
      const user = req.session.user; // Fetch the user data from session
  
      if (!user || user.usertype !== 'Manager') {
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
        return res.render('managerview/deleteManagerProfile', { title: 'Delete Manager Profile', user: user, error: 'Incorrect password. Deletion failed.' });
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