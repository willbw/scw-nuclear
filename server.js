console.log('Nuclear Plant server running')

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const MongoClient = require('mongodb').MongoClient
const session = require('express-session')
const exec = require('child_process').exec
var db

let title = ""

app.use(bodyParser.urlencoded({extended: true}))
app.use(session({secret: 'top secret stuff!', resave: false, saveUninitialized: true}))
app.set('view engine', 'ejs')

MongoClient.connect('mongodb://test:9AFjgVXYiJTmiirp@ds239587.mlab.com:39587/power-plant', (err, client) => {
  if (err) return console.log(err)
  db = client.db('power-plant')
  app.listen(3000, () => {
    console.log('listening on 3000')
  })
})

app.get('/', (req, res) => {
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
    res.render('home.ejs', {user : req.session.user, title: title})
  else
    res.send('Not authorised')
})

app.get('/control', (req, res) => {
  let title = "Control Panel"
  const reactors = ["Reactor 1", "Reactor 2", "Reactor 3"]
  console.log(reactors)
  res.render('control.ejs', {reactors: reactors, title: title})
})

app.get('/action', (req, res) => {
  exec('controlPanel.bat --action ' + action + ' --reactor ' + reactor)

})