const express = require('express');
const router = express.Router();
const session = require('express-session');
const { PrismaClient } = require("@prisma/client");
const crypto = require('crypto');
const prisma = new PrismaClient();
const app = express();
const bcrypt = require('bcrypt');

app.set('view engine', 'ejs');

/* GET admin page. */
router.get('/adminview/admindashboard', async function (req, res, next) {
  try {
    const user = req.session.user; // Fetch the user data from session
    if (!user || user.usertype !== 'Admin') {
      // If user is not logged in or not an admin, redirect to login page
      res.redirect('/');
      return;
    }

    const query = req.query.q // Get the value of the 'q' parameter from the query string
    const users = await prisma.user.findMany()
    let filteredUsers = users.filter(user => user.usertype === 'Admin' || user.usertype === 'Manager' || user.usertype === 'User')

    if (query) { // If a search query is provided, filter the results
      filteredUsers = filteredUsers.filter(user => {
        const fullName = `${user.firstname} ${user.middlename ? user.middlename + ' ' : ''}${user.lastname}`
        return fullName.toLowerCase().includes(query.toLowerCase()) || user.email.toLowerCase().includes(query.toLowerCase())
      })
    }

    res.render('adminview/admindashboard', { title: 'Admin', users: filteredUsers, isEmpty: filteredUsers.length === 0, query: query });
  } catch (err) {
    console.error(err)
    next(err)
  }
});

/* GET manager records page. */
router.get('/adminview/managerRecord', async function(req, res, next) {
    try {
      const user = req.session.user; // Fetch the user data from session
      if (!user || user.usertype !== 'Admin') {
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
  
      res.render('adminview/managerRecord', { title: 'Manager', users: filteredUsers, isEmpty: filteredUsers.length === 0, query: query });
    } catch (err) {
      console.error(err)
      next(err)
    }
  });

  /* GET user records page. */
router.get('/adminview/userRecord', async function(req, res, next) {
    try {
      const user = req.session.user; // Fetch the user data from session
      if (!user || user.usertype !== 'Admin') {
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
  
      res.render('adminview/userRecord', { title: 'User', users: filteredUsers, isEmpty: filteredUsers.length === 0, query: query });
    } catch (err) {
      console.error(err)
      next(err)
    }
  });


/* GET logout */
router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
      if (err) {
        console.error(err);
      }
      res.redirect('/');
    });
  });

  /* GET admin records page. */
router.get('/adminview/adminRecord', async function(req, res, next) {
    try {
      const user = req.session.user; // Fetch the user data from session
      if (!user || user.usertype !== 'Admin') {
        // If user is not logged in or not an admin, redirect to login page
        res.redirect('/');
        return;
      }
      const query = req.query.q // Get the value of the 'q' parameter from the query string
      const users = await prisma.user.findMany()
      let filteredUsers = users.filter(user => user.usertype === 'Admin')
  
      if (query) { // If a search query is provided, filter the results
        filteredUsers = filteredUsers.filter(user => {
          const fullName = `${user.firstname} ${user.middlename ? user.middlename + ' ' : ''}${user.lastname}`
          return fullName.toLowerCase().includes(query.toLowerCase()) || user.email.toLowerCase().includes(query.toLowerCase())
        })
      }
  
      res.render('adminview/adminRecord', { title: 'User', users: filteredUsers, isEmpty: filteredUsers.length === 0, query: query });
    } catch (err) {
      console.error(err)
      next(err)
    }
  });

  /* GET admin profile page. */ 
router.get('/adminview/adminProfile', async function(req, res, next) {
    try {
      const user = req.session.user; // Fetch the user data from session
      if (!user || user.usertype !== 'Admin') {
        // If user is not logged in or not an admin, redirect to login page
        res.redirect('/');
        return;
      }
  
      res.render('adminview/adminProfile', { title: 'Admin Profile', user: user });
    } catch (err) {
      console.error(err)
      next(err)
    }
  });

/* GET admin profile delete confirmation page. */ 
router.get('/adminview/deleteAdminProfile', async function(req, res, next) {
    try {
      const user = req.session.user; // Fetch the user data from session
      if (!user || user.usertype !== 'Admin') {
        // If user is not logged in or not an admin, redirect to login page
        res.redirect('/');
        return;
      }  
  
      res.render('adminview/deleteAdminProfile', { title: 'Delete Admin Profile', user: user });
    } catch (err) {
      console.error(err)
      next(err)
    }
  });


  /* POST admin profile delete confirmation page. */
  router.post('/admin/adminProfileDeleteConfirm', async function(req, res, next) {
    try {
      const user = req.session.user; // Fetch the user data from session
  
      if (!user || user.usertype !== 'Admin') {
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
        return res.render('adminview/deleteAdminProfile', { title: 'Delete Admin Profile', user: user, error: 'Incorrect password. Deletion failed.' });
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

  // Delete a user
  router.post('/adminview/admindashboard/:id/delete', async (req, res) => {
    const userId = req.params.id;
    
    try {
      const deletedUser = await prisma.user.delete({
        where: { id: userId },
      });
      
      // Handle successful deletion (e.g., redirect to a success page)
      res.redirect('/adminview/admindashboard');
    } catch (error) {
      // Handle any errors
      console.error(error);
      res.status(500).send('Error deleting user.');
    }
  });

  // get edit page with certain user
  router.get('/adminview/:id/edituser', async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
  
      if (!user) {
        // User not found
        return res.status(404).send('User not found');
      }
  
      res.render('adminview/edituser', { user });
    } catch (error) {
      // Handle any errors that occur during the fetch
      console.error('Error fetching user:', error);
      res.status(500).send('Internal Server Error');
    }
  });

//   post the updated user details
  router.post('/adminview/admindashboard/updateuser/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      const { firstname, lastname, gender, contactnumber, email, password, usertype } = req.body;
  
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
  
      if (!user) {
        // User not found
        return res.status(404).send('User not found');
      }
  
      // Update the user details
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          firstname,
          lastname,
          gender,
          contactnumber,
          email,
          password: hashPassword(password), // Hash the new password
          usertype
        },
      });
  
      res.redirect('/adminview/admindashboard'); // Redirect to the appropriate page after updating
  
    } catch (error) {
      // Handle any errors that occur during the update
      console.error('Error updating user:', error);
      res.status(500).send('Internal Server Error');
    }
  });


  

// Helper function to hash the password
function hashPassword(password) {
    const hash = crypto.createHash('sha512');
    hash.update(password);
    return hash.digest('hex');
  }


  module.exports = router;