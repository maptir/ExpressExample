const express = require('express')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const router = express.Router()

const User = require('../models/user')

router.get('/register', (req, res) => {
  res.render('register')
})

router.post('/register', (req, res) => {
  req.checkBody('name', 'Name is required').notEmpty()
  req.checkBody('email', 'Email is required').notEmpty()
  req.checkBody('email', 'Email is not valid').isEmail()
  req.checkBody('username', 'Username is required').notEmpty()
  req.checkBody('password', 'Password is required').notEmpty()
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password)

  let errors = req.validationErrors()
  if (errors) res.render('register', { errors })
  else {
    let newUser = new User({
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    })

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) console.error(err)
        newUser.password = hash
        newUser.save((err) => {
          if (err) console.error()
          req.flash('success', 'You\'re now registered and can log in')
          res.redirect('/users/login')
        })
      })
    })
  }
})

router.get('/login', (req, res) => {
  res.render('login')
})

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next)
})

router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success', 'You\'re logged out')
  res.redirect('/users/login')
})

module.exports = router