$(document).ready(function() {

			$("#magicButton").click(function() {
				var userNameInput = $("#userNameInput").val();
				var passwordInput = $("#passwordInput").val();
				if (userNameInput.length === 0 || passwordInput.length === 0) {
					alert("Please enter a username AND password.");
				};
			});

			$("#submitButton").click(function() {
				var titleInput = $("#title").val();
				var bodyFormInput = $("#bodyForm").val();
				if (titleInput.length === 0 || bodyFormInput.length === 0) {
					alert("Please enter a title AND post.");
				};
			});

			$.get("/seePosts/:id/commentsDisplay", function(response) {
				var blogComments = response;
				for (var i = 0; i < blogComments.length; i++) {
					$("#matchingComments").append("<li>" + blogComments[i].comment + " " + blogComments[i].author+ " " + "</li>");
				};

				// setting cookies (not necessary for this project)
				// if (Cookies.get('here b4?') !== undefined) {
				// 	alert("welcome back!!");
				// } else {
				// 	alert("welcome for the first time!!")
				// };
				// Cookies.set('here b4?', 'yes')



			});