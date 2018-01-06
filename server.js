console.log('Nuclear Plant server running')

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const MongoClient = require('mongodb').MongoClient
const session = require('express-session')
const exec = require('child_process').exec
const PORT = process.env.PORT || 3000
var db

// List of valid reactors, actions and files
const reactors = ['Reactor 1', 'Reactor 2', 'Reactor 3']
const actions = ['start', 'shutdown', 'suspend']
const files = ['report_1.txt', 'report_2.txt', 'report_3.txt']

app.use(bodyParser.urlencoded({extended: true}))
app.use(session({secret: 'top secret stuff!', resave: false, saveUninitialized: true}))
app.use(express.static('public'))
app.set('view engine', 'ejs')
// Makes user variable available to all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user
  next()
})

// Database containing data about administrators / the power plant
// Initiallity believed this would be required - currently just stores username and password
MongoClient.connect('mongodb://test:9AFjgVXYiJTmiirp@ds239587.mlab.com:39587/power-plant', (err, client) => {
  if (err) return console.log(err)
  db = client.db('power-plant')
  app.listen(PORT, () => {
    console.log('listening on 3000')
  })
})

// Index
// If user not logged in, redirect to login page
// else send user to the home page
app.get('/', (req, res) => {
  console.log(req.session)
  if (req.session.user)
    res.redirect('/home')
  else
    res.redirect('/login')
})

// Login
app.get('/login', (req, res) => {
  let title = 'Login'
  res.render('login.ejs', { title: title })
})

// Authorising login
app.post('/auth', (req, res) => {
  // Santise input from starting with $
  if (req.body.user.trimLeft().startsWith('$') || req.body.password.trimLeft().startsWith('$')) {
      res.send('No way, Jose.')
      return
  }
  // Try and find user in admins database and see if the password provided matches
  db.collection('admins').findOne({ user: req.body.user }, (err, result) => {
    if (err) return console.log(err) 
    if (result.password === req.body.password) {
      req.session.user = req.body.user
      res.redirect('/home')
    } else {
      res.send('Invalid Login.')
      return
    }
  })
})

// Home page
app.get('/home', (req, res) => {
  let title = "Home"
  if (req.session.user)
    res.render('home.ejs', {title: title})
  else
    res.send('Not authorised')
})

// Control Panel
app.get('/control', (req, res) => {
  if (!req.session.user) {
    res.send('Access denied')
    return
  }
  let title = 'Control Panel'
  res.render('control.ejs', {reactors: reactors, title: title})
})

// Processing actions
app.post('/action', (req, res) => {
  if (!req.session.user) {
    res.send('Access denied')
    return
  }
  let action = req.body.action
  let reactor = req.body.reactor
  let title = 'Control Panel'

  // Check that the reactor is in our list or reactors, and the action is in our
  // list of actions (that it has an index in the array)
  if(reactors.indexOf(reactor) > -1 && actions.indexOf(action) > -1) {
    // currently just console.log the output - not actually attempting to execute
    // exec('controlPanel.bat --action ' + action + ' --reactor ' + reactor)
    console.log('controlPanel.bat --action ' + action + ' --reactor ' + reactor)
    let title = "Control Panel"
    var message

    switch(action) {
      case 'start': {
        message = 'Startup sequence commenced on ' + reactor
        break
      }
      case 'shutdown': {
        message = 'Shutdown sequence commenced on ' + reactor
        break
      }
      case 'suspend': {
        message = 'Power generation activity suspended on ' + reactor
        break
      }
    }
    res.render('control.ejs', {reactors: reactors, title: title, messages: message})
  } else {
    res.send('Command not accepted.')
  }
})

app.get('/reports', (req, res) => {
  if (!req.session.user) {
    res.send('Access denied')
    return
  }
  let title = 'Reports'
  res.render('reports.ejs', {files: files, title: title})
})

app.get('/forgot', (req, res) => {
  let title = 'Forgotten Password'
  res.render('forgot.ejs', {title: title})
})

app.post('/test', (req, res) => {
  console.log(req.body)
  res.send('william')
})