const express = require('express');
const router = express.Router();
const session = require('express-session');
const { PrismaClient } = require("@prisma/client");
const crypto = require('crypto');
const prisma = new PrismaClient();

// Initialize the session middleware
router.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

router.get('/', function(req, res) {
    // If user is already logged in, redirect to appropriate page
    if (req.session.user) {
      redirectToDashboard(req.session.user.usertype, res);
    } else {
      // Otherwise, render the login page
      res.render('login', { title: 'Login' });
    }
  });
  
  /* POST login. */
  router.post('/login', async function(req, res) {
    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({
        where: { email: email }
      });
  
      if (!user) {
        res.status(401).send("Invalid email or password");
        return;
      }
  
      const encryptedPassword = crypto.createHash('sha512').update(password).digest('hex');
  
      if (user.password === encryptedPassword) {
        req.session.user = user;
        redirectToDashboard(user.usertype, res);
      } else {
        res.status(401).send("Invalid email or password");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Something went wrong");
    }
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
