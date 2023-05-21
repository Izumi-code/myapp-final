const express = require('express');
const router = express.Router();
const session = require('express-session');
const crypto = require('crypto');
const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require('uuid');
const { render } = require('ejs');

const prisma = new PrismaClient();

router.use(session({
    genid: (req) => {
      return uuidv4(); // Generate a unique session ID for each session
    },
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Set to true if using HTTPS
      httpOnly: true, // Restrict access to cookies to HTTP(S) requests
      maxAge: 24 * 60 * 60 * 1000 // Expiration time for the cookie (in milliseconds)
    }
  }));

/* GET register page. */
router.get('/register', async function(req, res, next) {
  // Check if user is authenticated
  if (req.session.user) {
    var users = await prisma.user.findMany()
    res.render('register', { title: 'Register'});
  } else {
    res.redirect('/');
  }
});

/* POST register page. */
router.post('/register', async function(req, res, next) {
  const { firstname, lastname, gender, contactnumber, email, password, usertype } = req.body;

//   Encrypt password using SHA512
  const hash = crypto.createHash('sha512');
  hash.update(password);
  const encryptedPassword = hash.digest('hex');

  try { 
    const user = await prisma.user.create({
      data: {
        firstname, 
        lastname,
        gender,
        contactnumber, 
        email,
        password: encryptedPassword, // Store encrypted password
        // password,
        usertype
      },
    });
    res.redirect('/adminview/admindashboard');
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).render('/register', { title: 'Register', error: 'Email already exists.' });
    } else {
      console.error(error);
      res.status(500).render('/register', { title: 'Register', error: 'Error. Please try again later.' });
    }
  }
});




module.exports = router;
