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

function login() {
	// Grabs the values from the HTML inputs
	let loginUsernameInput = document.getElementById("loginUsernameInput").value;
	let loginPasswordInput = document.getElementById("loginPasswordInput").value;

	// Checks the user database
	for (i = 0; i < userArray.length; i++) {
		// If the inputted username/password matches with a username/password on firebase 
		if (userArray[i][0] === loginUsernameInput && userArray[i][1] === loginPasswordInput) {
			// Login
			console.log("LOGIN!");
			break;
		} else {
			// Otherwise, the user does not have an account
			console.log("Account does not exist!")
			return;
		}
	}
	goToPage(loggedInMenuPage);
}

function goToPage(pageNumber) {
	// hides all pages with a class of 'pages'
	document.querySelectorAll('.pages').forEach((e) => e.hidden = true);

	// Clear the inputs when the user enters the page
	if (pageNumber === createAccountPage) {
		document.getElementById("createAccountUsernameInput").value = "";
		document.getElementById("createAccountPasswordInput").value = "";
	}

	// reveals required page
	pageNumber.hidden = false;
}