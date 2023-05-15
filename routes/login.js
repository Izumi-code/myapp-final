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

router.get('/login', function(req, res, next) {
  // If user is already logged in, redirect to appropriate page
  if (req.session.user) {
    switch (req.session.user.usertype) {
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
    return;
  }

  // Otherwise, render the login page
  res.render('login', { title: 'Login' });
});
 
/* POST login. */
router.post('/login', async function(req, res, next) {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email: email }
    });
    
    if (!user) {
      res.status(401).send("Invalid email or password");
      return;
    }

    // Encrypt the password entered by the user
    const encryptedPassword = crypto.createHash('sha512').update(password).digest('hex');

    if (user.password === encryptedPassword) {
      // Save user data in session
      req.session.user = user;
      
      // Redirect user based on their userType
      switch (user.usertype) {
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
    } else {
      res.status(401).send("Invalid email or password");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});

module.exports = router;
