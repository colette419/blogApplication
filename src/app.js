var express = require('express');
var app = express();
var pg = require('pg');
var bodyParser = require('body-parser');
var session = require('express-session');
var Promise = require('promise');
var bcrypt = require('bcrypt');
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

var Comment = sequelize.define('comment', { // defines the comment model
	userID: Sequelize.STRING, // this will be the user's username
	comment: Sequelize.TEXT // input
});

//connecting the post and comments tables

Post.hasMany(Comment);
Comment.belongsTo(Post);


app.use(session({ // this is how you manage sessions
	secret: 'oh wow very secret much security',
	resave: true,
	saveUninitialized: false
}));


app.get('/', function(req, res) {
	message: req.query.message,
	res.render('login', {
		message: req.query.message,
		user: req.session.user
	});
});



app.get('/seePosts', function(req, res) { //renders the page to see list of ALL post titles; must send an object containing the correct posts to that page
	Post.findAll().then(function(lines) {
		var columnData = lines.map(function(row) {
			return {
				id: row.dataValues.id,
				user: row.dataValues.userID,
				title: row.dataValues.posttitle,
				body: row.dataValues.postbody,
			}
		});
		console.log("columnData is " + columnData);
		res.render('seePosts', {
			message: columnData,
		});
	});
});

//renders the page to see each individual post. Add comments box to the jade file. 

app.get('/seePosts/:id', function(request, response) {
	var user = request.session.user;
	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("Please log in to comment on messages."));
	} else {
		Post.findById(request.params.id, {
			include: [Comment]
		}).then(function(post) {
			var indPost = {
				title: post.dataValues.posttitle,
				body: post.dataValues.postbody,
				id: post.dataValues.id
			}
			Comment.findAll({
				where: {
					blogMessageId: request.params.id
				}
			}).then(function(lines) {
				var commentBlob = lines.map(function(row) {
					return {
						id: row.dataValues.id,
						author: row.dataValues.userID,
						comment: row.dataValues.comment
					}
				});

				response.render('comment', {
					post: indPost,
					alert: request.query.alert,
					comments: commentBlob
				});
			});
		});
	};
});


app.post('/seePosts/:id', function(request, response) { //add if statement so you can't add nothing comments with nothing.
	if (request.body.commentBody.length === 0) {
		response.redirect('/seePosts/' + request.params.id + '?alert=' + encodeURIComponent("!!!You must submit text to post a comment!!!"));
	} else {
		var user = request.session.user;
		Comment.create({
			userID: user.username,
			comment: request.body.commentBody,
			blogMessageId: request.params.id
		});
		response.redirect('/profile?message=' + encodeURIComponent("You've just successfully posted your brilliance. What next?"));
	}
});

app.get('/seeMyPosts', function(req, res) { //renders the page to see list of USER'S post titles
	var user = req.session.user;
	if (user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in to view messages."));
	} else {
		Post.findAll({
			where: {
				userID: user.username
			}
		}).then(function(lines) {
			var columnData = lines.map(function(row) {
				return {
					id: row.dataValues.id,
					title: row.dataValues.posttitle,
					body: row.dataValues.postbody,
				}
			});
			console.log("columnData is " + columnData);
			res.render('seeMyPosts', {
				message: columnData,
			});
		});
	}
});


//***********************************************************

app.post('/', function(request, response) {
	User.findOne({
		where: {
			username: request.body.username
		}
	}).then(function(user) {
		bcrypt.compare(request.body.password, user.password, function(err, result) {
			if (err !== undefined) {
				console.log(err);
			} else {
				var matchin = result;
			}
		if (user !== null && matchin === true) {
			request.session.user = user;
			response.redirect('/profile');
		} else {
			response.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
		}
		});
	}, function(error) {
		response.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
	});
});

//***********************************************************

app.get('/profile', function(request, response) {
	var user = request.session.user; // says which user it is
	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
	} else {
		response.render('profile', {
			message: request.query.message,
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
	Post.create({
		userID: user.username,
		posttitle: req.body.blogTitle,
		postbody: req.body.blogBody
	});
	res.redirect('/profile?message=' + encodeURIComponent("You've just successfully posted your brilliance. What next?"));
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
			bcrypt.hash((req.body.password), 8, function(err, hash) {
				if (err !== undefined) {
					console.log(err);
				} else {
					var hashPassword = hash;
				}
				User.create({
					firstname: req.body.firstName,
					lastname: req.body.lastName,
					email: req.body.email,
					username: req.body.username,
					password: hashPassword,
				});
			});
			res.send("Registration was successful!");
		} else {
			res.send("This is not a unique user; please try registering again with a different email address or username.")
		}
	});
});

sequelize.sync().then(function() {
	app.listen(3000, function() {
		console.log('Example app listening on port 3000!');
	});
});