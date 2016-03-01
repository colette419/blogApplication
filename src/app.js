var express = require('express');
var app = express();
var pg = require('pg');
var bodyParser = require('body-parser');
var Promise = require('promise');
var Sequelize = require('sequelize');
var sequelize = new Sequelize('bulletinboard', 'WebDevelopment', null, {
	host: 'localhost',
	dialect: 'postgres'
});

app.set('view engine', 'jade');
app.set('views', './public/views');

app.use(express.static('public/css'));
app.use(bodyParser.urlencoded({
	extended: true
}));

var User = sequelize.define('user', { // create a user from the registration page using a post request 
	firstname: Sequelize.STRING,
	lastname: Sequelize.STRING,
	email: Sequelize.STRING,
	username: Sequelize.STRING,
	password: Sequelize.STRING
});

app.post('/register', function(req, res) {
	var uniqueUser = true;
	User.findAll().then(function(users) {
		var data = users.map(function(user) { // ".map" iterates through all the items in an array. it is returning some values for each post in posts.
			return {
				email: user.dataValues.email,
				username: user.dataValues.username
			};
		});
		for (var i = 0; i < data.length; i++) {
			if (req.body.email === data[i].email || req.body.username === data[i].username) {
				uniqueUser = false;
			}

		}
		if (uniqueUser === true) {
			sequelize.sync().then(function() {
				User.create({
					firstname: req.body.firstName,
					lastname: req.body.lastName,
					email: req.body.email,
					username: req.body.username,
					password: req.body.password,
				});
				res.send("Registration was successful!");
			})
		} else {
			res.send("This is not a unique user; please try registering again with a different email address or username.")
		}
	});

});

app.get('/', function(req, res) {
	res.render('login');
});

app.get('/register', function(req, res) {
	res.render('register');
});

app.listen(3000, function() {
	console.log('Example app listening on port 3000!');
});