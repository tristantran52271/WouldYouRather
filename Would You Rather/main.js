goToPage(menuPage);

let userArray = [];
var database = firebase.database();
let userArrayRef = database.ref('/userArray');

userArrayRef.once('value').then(reload);

function reload(data) {
	//If there is no data in the online databse, it creates an array
	if (userArray == null) userArray = [];
	//Adding the incoming data into a object
	userArray = data.val();

	userArrayRef.update(userArray);
	console.log(data.val());
}
//userArrayRef.update(userArray);

function createAccount() {
	// Grabs the values from the HTML inputs
	let createAccountUsernameInput = document.getElementById("createAccountUsernameInput").value;
	let createAcconutPasswordInput = document.getElementById("createAccountPasswordInput").value;

	// Checks if the user is connected to the internet, if not, exit the function
	let isOnline = window.navigator.onLine;
	if (isOnline) {
		console.log("online");
	} else {
		console.log("No internet connection");
		return;
	}

	// Checks whether or not there are any inputted values, if so exit the function
	if (createAccountUsernameInput === "" || createAcconutPasswordInput === "") {
		console.log("Please fill all fields!");
		return;
	}

	// Checks if the username contains any spaces, if so exit the function
	let hasSpaces = createAccountUsernameInput.toString().includes(" ");
	if (hasSpaces) {
		console.log("Please remove any spaces in the username");
		return;
	}

	// Checks if username already exists, if so exit the function
	for (i = 0; i < userArray.length; i++) {
		if (userArray[i][0] === createAccountUsernameInput) {
			console.log("Username already exist!");
			return;
		}

	}

	userArray.push([createAccountUsernameInput, createAcconutPasswordInput]);
	userArrayRef.update(userArray);
}

function goToPage(pageNumber) {
	// hides all pages with a class of 'pages'
	document.querySelectorAll('.pages').forEach((e) => e.hidden = true);
	// reveals required page
	pageNumber.hidden = false;
}