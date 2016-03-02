var express = require('express');
var app = express();
var pg = require('pg');
var bodyParser = require('body-parser');
var session = require('express-session');
var Promise = require('promise');
var Sequelize = require('sequelize');
var sequelize = new Sequelize('bulletinboard', 'WebDevelopment', null, {
	host: 'localhost',
	dialect: 'postgres'
});

app.set('view engine', 'jade');
app.set('views', './public/views');

app.use(express.static('public/css'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
	extended: true
}));

//models

var User = sequelize.define('user', { // defines the User model 
	firstname: Sequelize.STRING,
	lastname: Sequelize.STRING,
	email: Sequelize.STRING,
	username: Sequelize.STRING,
	password: Sequelize.STRING
});

var Post = sequelize.define('blogMessage', { // defines the Post model
	userID: Sequelize.STRING, // this will be the user's username
	posttitle: Sequelize.STRING,
	postbody: Sequelize.TEXT
});


app.use(session({ // this is how you manage sessions
	secret: 'oh wow very secret much security',
	resave: true,
	saveUninitialized: false
}));


app.get('/', function(req, res) {
	message: req.query.message,
	res.render('login', {
		message: req.query.message
	});
});


app.post('/', function(request, response) {
	User.findOne({
		where: {
			username: request.body.username
		}
	}).then(function(user) {
		if (user !== null && request.body.password === user.password) {
			request.session.user = user;
			response.redirect('/profile');
		} else {
			response.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
		}
	}, function(error) {
		response.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
	});
});

app.get('/profile', function(request, response) {
	var user = request.session.user; // says which user it is
	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
	} else {
		response.render('profile', {
			user: user
		});
	}
});

app.get('/addPost', function(req, res) {
	var user = req.session.user;
	if (user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in to post messages."))
	} else {
		res.render('addPost')
	} // will eventually pass parameters in here to display the titles of each post
});

app.post('/addPost', function(req, res) {
	var user = req.session.user;
	sequelize.sync().then(function() {
		Post.create({
			userID: user.username,
			posttitle: req.body.blogTitle,
			postbody: req.body.blogBody
		});
		res.send("Post was successful!");
	});
});


app.get('/logout', function(request, response) { // route to end a session
	request.session.destroy(function(error) { // this is how you end a session. 
		if (error) {
			throw error;
		}
		response.redirect('/?message=' + encodeURIComponent("You have been successfully logged out."));
	})
});


app.get('/register', function(req, res) {
	res.render('register');
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

app.listen(3000, function() {
	console.log('Example app listening on port 3000!');
});