const express = require('express');
const router = express.Router();
const session = require('express-session');
const crypto = require('crypto');
const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require('uuid');
const { render } = require('ejs');

const prisma = new PrismaClient();

/* GET signup page. */
router.get('/signup', async function(req, res, next) {
  res.render('signup')
});

/* POST register page. */
router.post('/signup', async function(req, res, next) {
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
    res.redirect('/');
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).render('/signup', { title: 'Sign Up', error: 'Email already exists.' });
    } else {
      console.error(error);
      res.status(500).render('/signup', { title: 'Sign Up', error: 'Error. Please try again later.' });
    }
  }
});




module.exports = router;
