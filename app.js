const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const session = require('express-session')
const passport = require('passport')
const config = require('./config/database')

// MongoDB
const Article = require('./models/article')

mongoose.connect(config.database, { useNewUrlParser: true })
var db = mongoose.connection
db.once('open', () => console.log('connected to MongoDB.'))
db.on('error', console.error.bind(console, 'connection error:'))

// Express
var app = express()

// Set public path
app.use(express.static(path.join(__dirname, 'public')))

// Body-parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Express session
app.use(session({
  secret: config.secret,
  resave: true,
  saveUninitialized: true,
}))

// Express messages
app.use(require('connect-flash')())
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res)
  next()
})

// Express validator
app.use(expressValidator())

// Passport Config
require('./config/passport')(passport)
// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.get('*', (req, res, next) => {
  res.locals.user = req.user || null
  next()
})

app.get('/', (req, res) => {
  Article.find({}, (err, articles) => {
    if (err) console.error(err)
    else res.render('index', { title: 'Home', articles })
  })
})

// Routes
let articles = require('./routes/articles')
let users = require('./routes/users')
app.use('/articles', articles)
app.use('/users', users)

app.listen(3000, () => console.log('Your app is running on port 3000'))
