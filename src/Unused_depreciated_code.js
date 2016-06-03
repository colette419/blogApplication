// app.post('/edit', function(request, response) {
//     var user = request.session.user;
//     var arrayOfChanges = [];
//     if (user === undefined) {
//         response.redirect('/?message=' + encodeURIComponent("Please log in to edit your profile."));
//     } else {
//         if (request.body.firstName.trim().length > 0 || request.body.lastName.trim().length > 0 ||
//             request.body.email.trim().length > 0 || request.body.username.trim().length > 0) {
//             var messageOfChanges = null;
//             User.findOne({
//                     where: {
//                         id: user.id
//                     }
//                 }).then(function(user) {
//                     if (request.body.firstName.trim().length > 0) {
//                         user.firstname = request.body.firstName.trim();
//                         user.save();
//                     }
//                 })
//                 .then(function(user) {
//                     if (request.body.lastName.trim().length > 0) {
//                         user.lastname = request.body.lastName.trim();
//                         user.save();
//                     }
//                 })
//                 .then(function(user) {
//                     if (request.body.email.trim().length > 0) {
//                         var uniqueUser1 = true;
//                         User.findAll().then(function(users) {
//                             var data = users.map(function(user) { // ".map" iterates through all the items in an array. it is returning some values for each post in posts.
//                                 return {
//                                     email: user.dataValues.email,
//                                 };
//                             });
//                             for (var i = 0; i < data.length; i++) {
//                                 if (request.body.email.trim() === data[i].email) {
//                                     uniqueUser1 = false;
//                                     arrayOfChanges.push("nonUniqueEmail");
//                                 }
//                             }
//                             if (uniqueUser1 === true) {
//                                 user.email = request.body.email.trim();
//                                 user.save();
//                             }
//                         });
//                     }
//                 }).then(function(user) {
//                     if (request.body.username.trim().length > 0) {
//                         var uniqueUser2 = true;
//                         User.findAll().then(function(users) {
//                             var data = users.map(function(user) { // ".map" iterates through all the items in an array. it is returning some values for each post in posts.
//                                 return {
//                                     username: user.dataValues.username,
//                                 };
//                             });
//                             for (var i = 0; i < data.length; i++) {
//                                 if (request.body.username.trim() === data[i].username) {
//                                     uniqueUser2 = false;
//                                     arrayOfChanges.push("nonUniqueUsername");
//                                 }
//                             }
//                             if (uniqueUser2 === true) {
//                                 user.username = request.body.username.trim();
//                                 user.save();
//                             }
//                         });
//                     }
//                 }).then(function() {
//                     console.log(arrayOfChanges);
//                     request.flash('changesMade', 'CHANGES MADE: Please check below to ensure information is correct.')
//                     response.redirect('/edit');
//                 })
//         } else {
//             request.flash('noInput', 'NO CHANGES MADE: You did not input any adjustments, so no changes were made to your user information.')
//             response.redirect('/edit');
//         }

//     };
// });




//renders the page to see each individual post. Add comments box to the jade file. 

// app.get('/seePosts/:id', function(request, response) {
//  var user = request.session.user;
//  if (user === undefined) {
//      response.redirect('/?message=' + encodeURIComponent("Please log in to comment on messages."));
//  } else {
//      Post.findById(request.params.id, {
//          include: [Comment]
//      }).then(function(post) {
//          var indPost = {
//              title: post.dataValues.posttitle,
//              body: post.dataValues.postbody,
//              id: post.dataValues.id
//          }
//          Comment.findAll({
//              where: {
//                  blogMessageId: request.params.id
//              }
//          }).then(function(lines) {
//              var commentBlob = lines.map(function(row) {
//                  return {
//                      id: row.dataValues.id,
//                      author: row.dataValues.userID,
//                      comment: row.dataValues.comment
//                  }
//              });

//              response.render('comment', {
//                  post: indPost,
//                  alert: request.query.alert,
//                  comments: commentBlob
//              });
//          });
//      });
//  };
// });



// app.get('/comments/:id', function(request, response) {
//     Comment.findAll({
//         where: {
//             blogMessageId: request.params.id
//         }
//     }).then(function(lines) {
//         var commentBlob = lines.map(function(row) {
//             return {
//                 id: row.dataValues.id,
//                 author: row.dataValues.userID,
//                 comment: row.dataValues.comment
//             }
//         });

//         response.send(commentBlob);
//     });
// });

// app.get('/seePosts', function(req, res) { //renders the page to see list of ALL post titles; must send an object containing the correct posts to that page
//     var user = req.session.user;
//     if (user === undefined) {
//         res.redirect('/?message=' + encodeURIComponent("Please log in to view messages."));
//     } else {
//         Post.findAll({
//             include: [{
//                 model: Comment,
//             }]
//         }).then(function(lines) {
//             var columnData = lines.map(function(row) {
//                 return {
//                     id: row.dataValues.id,
//                     user: row.dataValues.userID,
//                     title: row.dataValues.posttitle,
//                     body: row.dataValues.postbody,
//                     comments: row.dataValues.comments,
//                 }
//             });
//             res.render('seePosts', {
//                 user: user.username,
//                 message: columnData, 
//                 headingMessage: "All User Posts"
//             });
//         });
//     };
// });