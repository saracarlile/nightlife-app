// server.js

var express = require('express');
var mongoose = require('mongoose');
var app = express();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var httpServer = require("http").createServer(app);
//var cors = require('cors');


// config files
var db = require('./config/db');

// set our port
var port = process.env.PORT || 3000;

// connect to  mongoDB  
mongoose.connect(db.url);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// parse application/json 
app.use(bodyParser.json());

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));

//set the public folder of the app
app.use(express.static(__dirname + '/public'));



//load basic route for server
require('./server/routes/basic')(app);
require('./server/routes/auth')(app);
require('./server/routes/yelp3')(app);

// startup our app at http://localhost:3000
httpServer.listen(port);


// shoutout to the user                     
console.log('Server available at' + port);

// expose app           
exports = module.exports = app;