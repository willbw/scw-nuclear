console.log('Nuclear Plant server running')

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const MongoClient = require('mongodb').MongoClient
const session = require('express-session')
const exec = require('child_process').exec
var db

// List of valid reactors and actions
const reactors = ["Reactor 1", "Reactor 2", "Reactor 3"]
const actions = ["start", "shutdown", "suspend"]

app.use(bodyParser.urlencoded({extended: true}))
app.use(session({secret: 'top secret stuff!', resave: false, saveUninitialized: true}))
app.set('view engine', 'ejs')
// Makes user variable available to all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user
  next()
})

// Database containing data about administrators / the power plant
// Initiallity believed this would be required - seems not to be 
MongoClient.connect('mongodb://test:9AFjgVXYiJTmiirp@ds239587.mlab.com:39587/power-plant', (err, client) => {
  if (err) return console.log(err)
  db = client.db('power-plant')
  app.listen(3000, () => {
    console.log('listening on 3000')
  })
})

app.get('/', (req, res) => {
  console.log(req.session)
  if (req.session.user)
    res.redirect('/home')
  else
    res.redirect('/login')
})

app.get('/login', (req, res) => {
  let title = "Login"
  res.render('login.ejs', { title: title })
})

app.post('/auth', (req, res) => {
  db.collection('admins').findOne({ user: req.body.user }, function(err, result) {
    if (err) return console.log(err) 
    if (result.password === req.body.password) {
      req.session.user = req.body.user
      res.redirect('/home')
    }
    else
      res.send('Invalid Login.')
  })
})

app.get('/home', (req, res) => {
  let title = "Home"
  if (req.session.user)
    res.render('home.ejs', {title: title})
  else
    res.send('Not authorised')
})

app.get('/control', (req, res) => {
  let title = "Control Panel"
  res.render('control.ejs', {reactors: reactors, title: title})
})

app.post('/action', (req, res) => {
  let action = req.body.action
  let reactor = req.body.reactor
  let title = "Control Panel"

  if(reactors.indexOf(reactor) > -1 && actions.indexOf(action) > -1) {
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