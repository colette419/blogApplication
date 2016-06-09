$(document).ready(function() {
            console.log("hello");

            $(".commentDropdown").hide();

            $("#magicButton").click(function() {
                var userNameInput = $("#userNameInput").val();
                var passwordInput = $("#passwordInput").val();
                if (userNameInput.length === 0 || passwordInput.length === 0) {
                    alert("Please enter a username AND password.");
                };
            });

            //Javascript prevent user from entering blank title or post in "Add Posts."

            $("#submitButton").click(function(event) {
                var titleInput = $("#postTitle").val();
                var bodyFormInput = $("#blogBody").val();
                if ($.trim(titleInput).length === 0 || $.trim(bodyFormInput).length === 0) {
                    event.preventDefault();
                    alert("Please enter a title AND post.");
                };
            });

            $("#registrationSubmit").click(function(event) {
                var passwordInput = $("#newPassword").val();
                var confirmPassword = $("#confirmPassword").val();
                if (passwordInput !== confirmPassword) {
                    event.preventDefault();
                    alert("Please make sure your passwords match.");
                };
            });

            $(".commentLink").click(function() {
                var selector = "#commentID_" + this.id;
                $(selector).slideToggle(300);
                if ($(this).text() == "+ click here for comments on this post") {
                    $(this).text("- click here to close comments")
                } else {
                    $(this).text("+ click here for comments on this post")
                };
            });



            $(".commentSubmitForm").on('submit', function(event) {
                //getting the number of the post from the closest ID; contained in "importantID"
                var postID = $(this).closest('.commentDropdown').attr('id');
                var parts = postID.split('_');
                var importantID = parts[parts.length - 1];
                //"colette" is the name of the div and ul that I want to refresh
                var colette = "#" + $(this).closest('.commentDropdown').attr('id') + " ul";
                var commentFormID = "#commentForm_" + importantID;
                event.preventDefault();
                $.post("/seePosts", $(this).serialize())
                    .done(function(data) {
                        var content = $(data).find(colette);
                        $(colette).empty().append(content);
                        $(commentFormID).trigger("reset");
                    });
            });

            $("#registerEmail").blur(function() {
                if ($(this).val().trim().length > 0) {
                    var mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                    if ($(this).val().trim().match(mailFormat)) {
                        return (true);
                    }
                    alert("You have entered an invalid email address!");
                    return (false);
                }
            });

            $("#registerForm").on('submit', function(event) {
                    if ($("#registerEmail").val().trim().length > 0) {
                        var mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                        if ($("#registerEmail").val().trim().match(mailFormat)) {
                            return (true);
                        }
                        event.preventDefault();
                        alert("You have entered an invalid email address!");
                        return (false);
                    };
            });

            $("#changeEmailInput").blur(function() {
                if ($(this).val().trim().length > 0) {
                    var mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                    if ($(this).val().trim().match(mailFormat)) {
                        return (true);
                    }
                    alert("You have entered an invalid email address!");
                    return (false);
                }
            });

            $("#changeEmailForm").on('submit', function(event) {
                    if ($("#changeEmailInput").val().trim().length > 0) {
                        var mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                        if ($("#changeEmailInput").val().trim().match(mailFormat)) {
                            return (true);
                        }
                        event.preventDefault();
                        alert("You have entered an invalid email address!");
                        return (false);
                    };
            });
});


        //validation for the editing submit button

        // $("#formToEdit").on('submit', function(event) {
        // //getting the number of the post from the closest ID; contained in "importantID"
        // var postID = $(this).closest('.commentDropdown').attr('id');
        // var parts = postID.split('_');
        // var importantID = parts[parts.length - 1];
        // //"colette" is the name of the div and ul that I want to refresh
        // var colette = "#" + $(this).closest('.commentDropdown').attr('id') + " ul";
        // var commentFormID = "#commentForm_" + importantID;
        // event.preventDefault();
        // $.post("/seePosts", $(this).serialize())
        //     .done(function(data) {
        //         var content = $(data).find(colette);
        //         $(colette).empty().append(content);
        //         $(commentFormID).trigger("reset");
        //     });


        // $(".commentSubmitForm").on("submit", function(event) {
        //     event.preventDefault();
        //     var data1 = $(this).serialize();
        //     var url = "/seePosts"; // the script where you handle the form input.
        //     $.ajax({
        //         type: "POST",
        //         url: url,
        //         data: data1, // serializes the form's elements.
        //         success: function(data) {
        //             console.log(data); // show response from the php script.
        //              $(".commentDropdown").load("/seePosts")
        //         }
        //     });
        //     return false; // avoid to execute the actual submit of the form.
        // });


        // $(".commentSubmitForm").on("submit", function(event) {
        //     event.preventDefault();
        //     var $this = $(this);
        //     var viewArr = $this.serializeArray();
        //     var view = {};
        //     for (var i in viewArr) {
        //         view[viewArr[i].name] = viewArr[i].value;
        //     }
        //     $.post("/seePosts", {
        //             userID: view.UserId,
        //             comment: view.commentBody,
        //             blogMessageId: view.blogMessageId
        //         });
        // });

        //     $(".commentSubmitForm").on("submit", function(event) {
        //         event.preventDefault();
        //         var data1 = $(this).serialize();
        //         var url = "/seePosts"; // the script where you handle the form input.
        //         $.ajax({
        //             type: "POST",
        //             url: url,
        //             data: data1, // serializes the form's elements.
        //             success: function(data) {
        //                 console.log(data); // show response from the php script.

        //             }
        //         });
        //         return false; // avoid to execute the actual submit of the form.
        //     });
        //     // $.post("demo_test_post.asp",
        //     // {
        //     //   userID: "Donald Duck",
        //     //   comment: "Duckburg",
        //     //   blogMessageId: ""
        //     // },
        //     // function(data,status){
        //     //     alert("Data: " + data + "\nStatus: " + status);
        //     // });
        //     // console.log($(this).serialize());
        // });


        //Javascript GET request to get comments for each post; commenting out for now, may need to use for immediate results when I post to the comments page

        // $(".commentLink").click(function() {
        //  var cid = this.id;
        //     $.get("/comments/" + this.id, function(data) {
        //      var sectionID = "#dropdown_" + cid;
        //         for (var i = 0; i < data.length; i++) {
        //             $(sectionID).append("<li>" + data[i].author + " " + data[i].comment + "</li>");
        //         };
        //     });
        // });