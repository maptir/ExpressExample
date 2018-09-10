const express = require('express')
const router = express.Router()

const Athlete = require('../models/athlete')
const User = require('../models/user')

// Access control
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next()
  req.flash('danger', 'Please login')
  res.redirect('/users/login')
}

router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('add_athlete', { name: 'Add Athlete' })
})

router.get('/:id', (req, res) => {
  Athlete.findById(req.params.id, (err, athlete) => {
    User.findById(athlete.author, (err, user) => {
      res.render('athlete', { athlete, author: user.name })
    })
  })
})

router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Athlete.findById(req.params.id, (err, athlete) => {
    if (athlete.author != req.user._id) {
      req.flash('danger', 'Not Authorized')
      return res.redirect('/')
    }
    res.render('edit_athlete', { name: 'Edit Athlete', athlete })
  })
})

router.post('/add', (req, res) => {
  req.checkBody('name', 'Title is required').notEmpty()
  req.checkBody('trophy', 'Body is required').notEmpty()
  req.checkBody('desc', 'Description is required').notEmpty()

  let errors = req.validationErrors()
  if (errors) res.render('add_athlete', { name: 'Add Athlete', errors })
  else {
    let athlete = new Athlete()
    athlete.author = req.user._id
    athlete.name = req.body.name
    athlete.trophy = req.body.trophy
    athlete.desc = req.body.desc
    athlete.save((err) => {
      if (err) return console.error(err)
      req.flash('success', athlete.name + ' Added')
      res.redirect('/')
    })
  }
})

router.post('/edit/:id', (req, res) => {
  req.checkBody('name', 'Title is required').notEmpty()
  req.checkBody('trophy', 'Body is required').notEmpty()
  req.checkBody('desc', 'Description is required').notEmpty()

  let errors = req.validationErrors()
  if (errors) {
    res.render('edit_athlete', {
      name: 'Edit Athlete',
      athlete: { _id: req.params.id, ...req.trophy },
      errors
    })
  }
  else {
    let athlete = {}
    athlete.name = req.body.name
    athlete.trophy = req.body.trophy
    athlete.desc = req.body.desc

    let query = { _id: req.params.id }
    Athlete.update(query, athlete, (err) => {
      if (err) return console.error(err)
      req.flash('success', athlete.name + ' Updated')
      res.redirect('/')
    })
  }
})

router.delete('/:id', (req, res) => {
  if (!req.user._id) res.status(500).send()

  let query = { _id: req.params.id }

  Athlete.findById(req.params.id, (err, athlete) => {
    if (athlete.author != req.user._id) res.status(500).send()
    Athlete.remove(query, (err) => {
      if (err) return console.error(err)
      req.flash('danger', athlete.name + ' has been deleted')
      res.send('Success')
    })
  })
})

module.exports = router