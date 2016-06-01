




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