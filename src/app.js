var express = require('express');
var app = express();
var pg = require('pg');
var bodyParser = require('body-parser');
var session = require('express-session');
var Promise = require('promise');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var Sequelize = require('sequelize');
var async = require('async');
var nodemailer = require('nodemailer');
var randtoken = require('rand-token');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');




var sequelize = new Sequelize('bulletinboard', 'WebDevelopment', null, {
    host: 'localhost',
    dialect: 'postgres'
});

// sequelize = new Sequelize(process.env.DATABASE_URL, {
//   logging: false,
//   dialectOptions: {
//     ssl: true /* for SSL config since Heroku gives you this out of the box */
//   }
// });

app.set('view engine', 'jade');
app.set('views', './public/views');

app.use(session({ // this is how you manage sessions
    secret: 'oh wow very secret much security',
    resave: true,
    saveUninitialized: false
}));
app.use(flash());
app.use(cookieParser('secret'));
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
    password: Sequelize.STRING,
    resetPasswordToken: Sequelize.STRING,
    resetPasswordExpires: Sequelize.DATE
});

var Post = sequelize.define('blogMessage', { // defines the Post model
    posttitle: Sequelize.STRING,
    postbody: Sequelize.TEXT
});

var Comment = sequelize.define('comment', { // defines the comment model
    comment: Sequelize.TEXT // input
});

//connecting the tables

User.hasMany(Post);
Post.belongsTo(User);

Post.hasMany(Comment);
Comment.belongsTo(Post);

User.hasMany(Comment);
Comment.belongsTo(User);


//**********************************************************************************************
// PAGES: Login
// **********************************************************************************************
app.get('/', function(req, res) {
    message: req.query.message,
    res.render('login', {
        message: req.query.message,
        user: req.session.user,
        passwordMessage: req.flash('info')
    });
});

// where: { sequelize.where(sequelize.fn('lower', sequelize.col('firstname')), sequelize.fn('lower', 'somename'))
// Db.models.Person.findAll(where: sequelize.where(sequelize.fn('lower', sequelize.col('firstname')), sequelize.fn('lower', 'somename'));
// Db.models.Person.findAll(where: sequelize.where(sequelize.fn('lower', sequelize.col('firstname')), sequelize.fn('lower', 'somename'));


app.post('/', function(request, response) {
    if (request.body.email.length === 0 || request.body.password === 0) {
        response.redirect('/?message=' + encodeURIComponent("Please enter a username and password."));
        return;
    } else {
        User.findOne({
            where: sequelize.where(sequelize.fn('lower', sequelize.col('email')), sequelize.fn('lower', request.body.email))
        }).then(function(user) {
            if (user !== null) {
                bcrypt.compare(request.body.password, user.password, function(err, result) {
                    if (err !== undefined) {
                        console.log(err);
                    } else {
                        var matchin = result;
                    }
                    if (matchin === true) {
                        request.session.user = user;
                        response.redirect('/profile');
                    } else {
                        request.flash('info', 'Invalid email or password.')
                        response.redirect('/');
                    }
                });
            } else {
                request.flash('info', 'Invalid email or password.')
                response.redirect('/');
            };
        });
    };
});

//**********************************************************************************************
// PAGES: See ALL Posts
// **********************************************************************************************


app.get('/seePosts', function(req, res) { //renders the page to see list of ALL post titles; must send an object containing the correct posts to that page
    var user = req.session.user;
    if (user === undefined) {
        Post.findAll({
            include: [
                User, {
                    model: Comment,
                    include: [User]
                }
            ]
        }).then(function(lines) {
            var columnData = lines.map(function(row) {
                return {
                    id: row.dataValues.id,
                    user: row.dataValues.user,
                    title: row.dataValues.posttitle,
                    body: row.dataValues.postbody,
                    comments: row.dataValues.comments,
                }
            });
            res.render('seePosts', {
                message: columnData,
                headingMessage: "Viewing User Posts as a Guest."
            });
        })
    } else {
        Post.findAll({
            include: [
                User, {
                    model: Comment,
                    include: [User]
                }
            ]
        }).then(function(lines) {
            var columnData = lines.map(function(row) {
                return {
                    id: row.dataValues.id,
                    user: row.dataValues.user,
                    title: row.dataValues.posttitle,
                    body: row.dataValues.postbody,
                    comments: row.dataValues.comments,
                }
            });
            res.render('seePosts', {
                user: user.username,
                message: columnData,
                headingMessage: "All User Posts"
            });
        });
    };
});




app.post('/seePosts', function(req, res) { //renders the page to see list of ALL post titles; must send an object containing the correct posts to that page
    var user = req.session.user;
    if (user === undefined) {
        res.redirect('/?message=' + encodeURIComponent("Please log in to comment."));
    } else {
        if (req.body.commentBody.length === 0) {
            res.redirect('/seePosts/' + request.params.id + '?alert=' + encodeURIComponent("!!!You must submit text to post a comment!!!"));
        } else {
            Comment.create({
                    userId: user.id,
                    comment: req.body.commentBody,
                    blogMessageId: req.body.blogMessageId
                })
                .then(function() {
                    res.redirect('/seePosts')
                });
        }
    }
});

//**********************************************************************************************
// PAGES: Depreciated to see each post individually
// **********************************************************************************************

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

//**********************************************************************************************
// PAGES: See MY POSTS ONLY
// **********************************************************************************************

app.get('/seeMyPosts', function(req, res) { //renders the page to see list of USER'S post titles
    var user = req.session.user;
    if (user === undefined) {
        res.redirect('/?message=' + encodeURIComponent("Please log in to view your messages."));
    } else {
        Post.findAll({
            where: { userId: user.id },
            include: [{
                model: Comment,
                include: [
                    User
                ]
            }]
        }).then(function(lines) {
            var columnData = lines.map(function(row) {
                return {
                    id: row.dataValues.id,
                    user: row.dataValues.user,
                    title: row.dataValues.posttitle,
                    body: row.dataValues.postbody,
                    comments: row.dataValues.comments,
                }
            });
            User.findOne({
                where: {
                    id: user.id
                }
            }).then(function(user) {
                res.render('seeMyPosts', {
                    message: columnData,
                    user: user
                });
            });
        });
    };
});

//**********************************************************************************************
// PAGES: PROFILE
// **********************************************************************************************


app.get('/profile', function(request, response) {
    var user = request.session.user; // says which user it is
    if (user === undefined) {
        response.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
    } else {
        User.findOne({
            where: {
                id: user.id
            }
        }).then(function(user) {
            response.render('profile', {
                message: request.query.message,
                user: user
            });
        });
    }
});

//**********************************************************************************************
// PAGES: ADD POST
// **********************************************************************************************

app.get('/addPost', function(req, res) {
    var user = req.session.user;
    if (user === undefined) {
        res.redirect('/?message=' + encodeURIComponent("Please log in to post messages."))
    } else {
        res.render('addPost')
    }
});


app.post('/addPost', function(req, res) {
    var user = req.session.user;
    Post.create({
            userId: user.id,
            posttitle: req.body.blogTitle,
            postbody: req.body.blogBody
        })
        .then(function() {
            req.flash('posted', "You've just successfully posted your brilliance. What next?")
            res.redirect('/seeMyPosts');
        });
});

//**********************************************************************************************
// PAGES: LOGOUT (Ends session)
// **********************************************************************************************

app.get('/logout', function(request, response) { // route to end a session
    request.session.destroy(function(error) { // this is how you end a session. 
        if (error) {
            throw error;
        }
        response.redirect('/?message=' + encodeURIComponent("You have been successfully logged out."));
    })
});

//**********************************************************************************************
// PAGES: REGISTER
// **********************************************************************************************


app.get('/register', function(req, res) {
    res.render('register', {
        message: req.query.message
    });
});



app.post('/register', function(req, res) {
    if (req.body.firstName.trim().length === 0 || req.body.lastName.trim().length === 0 ||
        req.body.email.trim().length === 0 || req.body.username.trim().length === 0 || req.body.password.trim().length === 0) {
        res.redirect('/register/?message=' + encodeURIComponent("All fields are required."));
    } else {
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
                        firstname: req.body.firstName.trim(),
                        lastname: req.body.lastName.trim(),
                        email: req.body.email.trim(),
                        username: req.body.username.trim(),
                        password: hashPassword,
                    }).then(function(user) {
                        req.session.user = user;
                        res.redirect('/profile?message=' + encodeURIComponent("You've just registered! See below for the new world of opportunity available ;)!"));
                    });
                })
            } else {
                res.redirect('/register/?message=' + encodeURIComponent("This is not a unique user; please try again with another username or password."));
            }
        });
    };
});

//**********************************************************************************************
// PAGES: FORGOT PASSWORD
// **********************************************************************************************

app.get('/forgot', function(req, res) {
    res.render('forgot', {
        user: req.session.user,
        passwordMessage: req.flash('info')
    });
});

app.post('/forgot', function(req, res) {
    var token = randtoken.generate(20);
    User.findOne({
            where: {
                email: req.body.email
            }
        })
        .then(function(user) {
            if (!user) {
                req.flash('info', 'Email not found in database; please try again with a different email address.')
                res.redirect('/forgot');
                return;
            }
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour (can change to 24 hrs??
            user.save();
            var smtpTransport = nodemailer.createTransport('SMTP', {
                service: 'SendGrid',
                auth: {
                    user: 'colette',
                    pass: 'password12'
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'hello@bierviet-schranz.com',
                subject: 'This Little Blog Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err, info) {
                if (err) {
                    return console.log(err);
                }
                console.log('Message sent: ' + JSON.stringify(info));
            });
            req.flash('info', 'PASSWORD RESET REQUESTED: Please check your email for further password reset instructions.')
            res.redirect('/');
        });
});

app.get('/reset/:token', function(req, res) {
    User.findOne({
        where: {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {
                $gt: Date.now()
            }
        }
    }).then(function(user) {
        if (!user) {
            req.flash('info', 'Password reset token is invalid or has expired. Please resubmit your email for a new token if you still wish to reset your password.')
            res.redirect('/forgot');
            return;
        }
        res.render('reset', {
            user: req.user
        });
    });
});

app.post('/reset/:token', function(req, res) {
    User.findOne({
        where: {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {
                $gt: Date.now()
            }
        }
    }).then(function(user) {
        if (!user) {
            return req.flash('info', 'Password reset token is invalid or has expired. Please resubmit your email for a new token if you still wish to reset your password.')
            res.redirect('/forgot');
        } else if (req.body.password !== req.body.confirm) {
            res.render('reset', {
                passwordMessage: 'Please make sure passwords match'
            })
        } else {
            bcrypt.hash((req.body.password), 8, function(err, hash) {
                if (err !== undefined) {
                    console.log(err);
                } else {
                    var hashPassword = hash;
                }
                user.password = hashPassword;
                user.resetPasswordToken = null;
                user.resetPasswordExpires = null;
                user.save();
                var smtpTransport = nodemailer.createTransport('SMTP', {
                    service: 'SendGrid',
                    auth: {
                        user: 'colette',
                        pass: 'password12'
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: 'hello@bierviet-schranz.com',
                    subject: 'Your password has been changed',
                    text: 'Hello,\n\n' +
                        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                };
                smtpTransport.sendMail(mailOptions, function(err, info) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log('Message sent: ' + JSON.stringify(info));
                });
            });
            req.flash('info', 'PASSWORD RESET: An email has been sent to your account with confirmation of your password reset.')
            res.redirect('/');
        };
    });
});

//**********************************************************************************************
// PAGES: EDIT PROFILE
// **********************************************************************************************
app.get('/edit', function(request, response) {
    var user = request.session.user;
    if (user === undefined) {
        response.redirect('/?message=' + encodeURIComponent("Please log in to edit your profile."));
    } else {
        User.findOne({
            where: {
                id: user.id
            }
        }).then(function(user) {
            response.render('editProfile', {
                user: user,
                userMessage: request.flash('noInput'),
                emailMessage: request.flash('emailMessage'),
                changesMessage: request.flash('changesMade')
            });
        });
    }
});


app.get('/changeFirstName', function(request, response) {
    var user = request.session.user;
    if (user === undefined) {
        response.redirect('/?message=' + encodeURIComponent("Please log in to edit your profile."));
    } else {
        User.findOne({
            where: {
                id: user.id
            }
        }).then(function(user) {
            response.render('editingTemplates/firstNameEdit', {
                user: user
            });
        });
    }
});

app.post('/changeFirstName', function(request, response) {
    var user = request.session.user;
    if (user === undefined) {
        response.redirect('/?message=' + encodeURIComponent("Please log in to edit your profile."));
    } else {
        if (request.body.firstName.trim().length > 0) {
            User.findOne({
                where: {
                    id: user.id
                }
            }).then(function(user) {
                user.firstname = request.body.firstName.trim();
                user.save();
                request.flash('changesMade', 'CHANGES MADE: Please check below to ensure information is correct.')
                response.redirect('/edit');
            })
        } else {
            request.flash('noInput', 'NO CHANGES MADE: You did not input any adjustments, so no changes were made to your user information.')
            response.redirect('/edit');
        }
    }
});

app.get('/changeLastName', function(request, response) {
    var user = request.session.user;
    if (user === undefined) {
        response.redirect('/?message=' + encodeURIComponent("Please log in to edit your profile."));
    } else {
        User.findOne({
            where: {
                id: user.id
            }
        }).then(function(user) {
            response.render('editingTemplates/lastNameEdit', {
                user: user
            });
        });
    }
});

app.post('/changeLastName', function(request, response) {
    var user = request.session.user;
    if (user === undefined) {
        response.redirect('/?message=' + encodeURIComponent("Please log in to edit your profile."));
    } else {
        if (request.body.lastName.trim().length > 0) {
            User.findOne({
                where: {
                    id: user.id
                }
            }).then(function(user) {
                user.lastname = request.body.lastName.trim();
                user.save();
                request.flash('changesMade', 'CHANGES MADE: Please check below to ensure information is correct.')
                response.redirect('/edit');
            })
        } else {
            request.flash('noInput', 'NO CHANGES MADE: You did not input any adjustments, so no changes were made to your user information.')
            response.redirect('/edit');
        }
    }
});

app.get('/changeEmail', function(request, response) {
    var user = request.session.user;
    if (user === undefined) {
        response.redirect('/?message=' + encodeURIComponent("Please log in to edit your profile."));
    } else {
        User.findOne({
            where: {
                id: user.id
            }
        }).then(function(user) {
            response.render('editingTemplates/emailEdit', {
                user: user
            });
        });
    }
});

app.post('/changeEmail', function(request, response) {
    var user = request.session.user;
    if (user === undefined) {
        response.redirect('/?message=' + encodeURIComponent("Please log in to edit your profile."));
    } else {
        if (request.body.email.trim().length > 0) {
            User.findOne({
                where: {
                    id: user.id
                }
            }).then(function(user) {
                bcrypt.compare(request.body.password, user.password, function(err, result) {
                    if (err !== undefined) {
                        console.log(err);
                    } else {
                        var matchin = result;
                        if (matchin === true) { // if Passwords match, now check that it is unique:
                            var uniqueUser1 = true;
                            User.findAll().then(function(users) {
                                var data = users.map(function(user) { // ".map" iterates through all the items in an array. it is returning some values for each post in posts.
                                    return {
                                        email: user.dataValues.email,
                                    };
                                });
                                for (var i = 0; i < data.length; i++) {
                                    if (request.body.email.trim() === data[i].email) {
                                        uniqueUser1 = false;
                                    }
                                }
                                if (uniqueUser1 === true) {
                                    user.email = request.body.email.trim();
                                    user.save();
                                    request.flash('changesMade', 'CHANGES MADE: Please check below to ensure information is correct.')
                                    response.redirect('/edit');
                                } else {
                                    request.flash('noInput', 'NO CHANGES MADE: Entered Email Address is already in use.')
                                    response.redirect('/edit');
                                }

                            })
                        } else {
                            request.flash('noInput', 'NO CHANGES MADE: Incorrect Password Entered.')
                            response.redirect('/edit');
                        }
                    }
                })
            })
        } else {
            request.flash('noInput', 'NO CHANGES MADE: You did not input any adjustments, so no changes were made to your user information.')
            response.redirect('/edit');
        }
    };
});

app.get('/changeUsername', function(request, response) {
    var user = request.session.user;
    if (user === undefined) {
        response.redirect('/?message=' + encodeURIComponent("Please log in to edit your profile."));
    } else {
        User.findOne({
            where: {
                id: user.id
            }
        }).then(function(user) {
            response.render('editingTemplates/usernameEdit', {
                user: user
            });
        });
    }
});

app.post('/changeUsername', function(request, response) {
    var user = request.session.user;
    if (user === undefined) {
        response.redirect('/?message=' + encodeURIComponent("Please log in to edit your profile."));
    } else {
        if (request.body.username.trim().length > 0) {
            User.findOne({
                where: {
                    id: user.id
                }
            }).then(function(user) {
                bcrypt.compare(request.body.password, user.password, function(err, result) {
                    if (err !== undefined) {
                        console.log(err);
                    } else {
                        var matchin = result;
                        if (matchin === true) { // if Passwords match, now check that it is unique:
                            var uniqueUser2 = true;
                            User.findAll().then(function(users) {
                                var data = users.map(function(user) { // ".map" iterates through all the items in an array. it is returning some values for each post in posts.
                                    return {
                                        username: user.dataValues.username,
                                    };
                                });
                                for (var i = 0; i < data.length; i++) {
                                    if (request.body.username.trim() === data[i].username) {
                                        uniqueUser2 = false;
                                    }
                                }
                                if (uniqueUser2 === true) {
                                    user.username = request.body.username.trim();
                                    user.save();
                                    request.flash('changesMade', 'CHANGES MADE: Please check below to ensure information is correct.')
                                    response.redirect('/edit');
                                } else {
                                    request.flash('noInput', 'NO CHANGES MADE: Entered Username is already in use.')
                                    response.redirect('/edit');
                                }

                            })
                        } else {
                            request.flash('noInput', 'NO CHANGES MADE: Incorrect Password Entered.')
                            response.redirect('/edit');
                        }
                    }
                })
            })
        } else {
            request.flash('noInput', 'NO CHANGES MADE: You did not input any adjustments, so no changes were made to your user information.')
            response.redirect('/edit');
        }
    };
});


sequelize.sync().then(function() {
    app.listen(process.env.PORT || 3000, function() {
        console.log('Example app listening on port 3000!');
    });
});