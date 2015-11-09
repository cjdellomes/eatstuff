var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var http = require('http');
var passport = require('passport');
var LocalStrategy = require('passport').Strategy;
var Schema = mongoose.Schema;
var http = require('http');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var session = require('express-session');
var sendgrid = require('sendgrid');
var braintree = require('braintree');
var brainapi = require('./brainapi.js');


app.use(bodyParser.json());
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/static'));
app.use(cookieParser());
app.use(session({
  secret: 'adfASF$$$5@#jdjfke##2!'
}));
app.use(passport.initialize());
app.use(passport.session());

var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

var gateway = braintree.connect({
	environment: braintree.Environment.Sandbox,
	merchantId: brainapi.Id,
	publickey: brainapi.publicKey,
	privatekey: brainapi.privateKey
});

mongoose.connect('mongodb://localhost/test');

require('./routes.js')(app);


app.listen(3000);
