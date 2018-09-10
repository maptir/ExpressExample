const express = require('express')
const router = express.Router()

const Article = require('../models/article')
const User = require('../models/user')

// Access control
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next()
  req.flash('danger', 'Please login')
  res.redirect('/users/login')
}

router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('add_article', { title: 'Add Article' })
})

router.get('/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    User.findById(article.author, (err, user) => {
      res.render('article', { article, author: user.name })
    })
  })
})

router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      req.flash('danger', 'Not Authorized')
      return res.redirect('/')
    }
    res.render('edit_article', { title: 'Edit Article', article })
  })
})

router.post('/add', (req, res) => {
  req.checkBody('title', 'Title is required').notEmpty()
  req.checkBody('body', 'Body is required').notEmpty()

  let errors = req.validationErrors()
  if (errors) res.render('add_article', { title: 'Add Article', errors })
  else {
    let article = new Article()
    article.title = req.body.title
    article.author = req.user._id
    article.body = req.body.body
    article.save((err) => {
      if (err) return console.error(err)
      req.flash('success', article.title + ' Added')
      res.redirect('/')
    })
  }
})

router.post('/edit/:id', (req, res) => {
  req.checkBody('title', 'Title is required').notEmpty()
  req.checkBody('author', 'Author is required').notEmpty()
  req.checkBody('body', 'Body is required').notEmpty()

  let errors = req.validationErrors()
  if (errors) {
    res.render('edit_article', {
      title: 'Edit Article',
      article: { _id: req.params.id, ...req.body },
      errors
    })
  }
  else {
    let article = {}
    article.title = req.body.title
    article.author = req.user._id
    article.body = req.body.body

    let query = { _id: req.params.id }
    Article.update(query, article, (err) => {
      if (err) return console.error(err)
      req.flash('success', article.title + ' Updated')
      res.redirect('/')
    })
  }
})

router.delete('/:id', (req, res) => {
  if (!req.user._id) res.status(500).send()

  let query = { _id: req.params.id }

  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) res.status(500).send()
    Article.remove(query, (err) => {
      if (err) return console.error(err)
      req.flash('success', article.title + ' has been deleted')
      res.send('Success')
    })
  })
})

module.exports = router