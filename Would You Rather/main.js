goToPage(menuPage);

let userArray = [];
var database = firebase.database();
let userArrayRef = database.ref('/userArray');

userArrayRef.once('value').then(reload);

let questionArray = [];
let questionArrayRef = database.ref('/questionArray');
questionArrayRef.once('value').then(reloadQuestions);

var isLoggedIn = false;
let loggedUsername = "";

let chosenUser = 0;

let hasChosen = false;

function reload(data) {
	//If there is no data in the online databse, it creates an array
	if (userArray == null) userArray = [];
	//Adding the incoming data into a object
	userArray = data.val();

	userArrayRef.update(userArray);
	console.log(data.val());
}

function reloadQuestions(data) {
	//If there is no data in the online databse, it creates an array
	if (questionArray == null) questionArray = [];
	//Adding the incoming data into a object
	questionArray = data.val();

	//questionArray = [["User", ["Title", [["Content"], ["ChosenAmount"]], [["Content"], ["ChosenAmount"]]]]];
	//questionArrayRef.update(questionArray);

	for (i = 0; i < questionArray.length; i++) {
		if (typeof questionArray[i] == 'undefined') {
			questionArray.splice(i, 1);
		}
	}

	questionArrayRef.update(questionArray);
	console.log(questionArray);
	console.log(questionArray[0][1][1][0][0]);
}

function createAccount() {
	// Grabs the values from the HTML inputs
	let createAccountUsernameInput = document.getElementById("createAccountUsernameInput").value;
	let createAcconutPasswordInput = document.getElementById("createAccountPasswordInput").value;
	let createAccountErrorText = document.getElementById("createAccountErrorText");

	// Checks if the user is connected to the internet, if not, exit the function
	let isOnline = window.navigator.onLine;
	if (isOnline) {
		//console.log("online");
	} else {
		//console.log("No internet connection");
		createAccountErrorText.innerHTML = "No internet connection";
		return;
	}

	// Checks whether or not there are any inputted values, if so exit the function
	if (createAccountUsernameInput === "" || createAcconutPasswordInput === "") {
		console.log("Please fill all fields!");
		createAccountErrorText.innerHTML = "Please fill all fields";
		return;
	}

	// Checks if the username contains any spaces, if so exit the function
	let hasSpaces = createAccountUsernameInput.toString().includes(" ");
	if (hasSpaces) {
		console.log("Please remove any spaces in the username");
		createAccountErrorText.innerHTML = "Please remove any spaces in the username";
		return;
	}

	// Checks if username already exists, if so exit the function
	for (i = 0; i < userArray.length; i++) {
		if (userArray[i][0] === createAccountUsernameInput) {
			console.log("Username already exist!");
			createAccountErrorText.innerHTML = "Username already exists";
			return;
		}
	}

	// Update the array
	userArray.push([createAccountUsernameInput, createAcconutPasswordInput]);
	userArrayRef.update(userArray);

	// Send the user to the menu page
	goToPage(menuPage);
}

function login() {
	// Grabs the values from the HTML inputs
	let loginUsernameInput = document.getElementById("loginUsernameInput").value;
	let loginPasswordInput = document.getElementById("loginPasswordInput").value;
	let loginErrorText = document.getElementById("loginErrorText");

	// Checks if the user is connected to the internet, if not, exit the function
	let isOnline = window.navigator.onLine;
	if (isOnline) {
		//console.log("online");
	} else {
		//console.log("No internet connection");
		loginErrorText.innerHTML = "No internet connection";
		return;
	}

	// Checks the user database
	for (i = 0; i < userArray.length; i++) {
		// If the inputted username/password matches with a username/password on firebase 
		if ((userArray[i][0] === loginUsernameInput) && (userArray[i][1] === loginPasswordInput)) {
			// Login
			//console.log("LOGIN!");
			isLoggedIn = true;
			loggedUsername = userArray[i][0];
			goToPage(loggedInMenuPage);
			document.getElementById("menuUsername").innerHTML = loggedUsername;
			break;
		} else if (i === userArray.length) {
			// Otherwise, the user does not have an account
			loginErrorText.innerHTML = "Incorrect username or password";
			return;
		} else {
			loginErrorText.innerHTML = "Incorrect username or password";
		}
	}
}

function goToLoggedInMenu() {
	if (isLoggedIn === false) {
		alert("Please Log In");
		return;
	}
	document.getElementById("username").innerHTML = loggedUsername;
	goToPage(loggedInMenuPage);
}

function goToPage(pageNumber) {
	// hides all pages with a class of 'pages'
	document.querySelectorAll('.pages').forEach((e) => e.hidden = true);

	// Clear the inputs when the user enters the page
	if (pageNumber === loginPage) {
		document.getElementById("loginErrorText").innerHTML = "";
		document.getElementById("loginUsernameInput").value = "";
		document.getElementById("loginPasswordInput").value = "";
	}

	// Clear the inputs when the user enters the page
	if (pageNumber === createAccountPage) {
		document.getElementById("createAccountErrorText").innerHTML = "";
		document.getElementById("createAccountUsernameInput").value = "";
		document.getElementById("createAccountPasswordInput").value = "";
	}

	if (pageNumber === createQuestionsPage) {
		document.getElementById("titleInput").value = "";
		document.getElementById("option1Input").value = "";
		document.getElementById("option2Input").value = "";
	}

	if (pageNumber === answerQuestionsPage) {
		AnswerQuestions();
	}

	// reveals required page
	pageNumber.hidden = false;
}

function CreateQuestion() {
	let user = loggedUsername;
	let title = document.getElementById("titleInput").value;
	let option1 = document.getElementById("option1Input").value;
	let option2 = document.getElementById("option2Input").value;

	if (title === "" || option1 === "" || option2 === "") {
		console.log("Please fill out all fields");
		return;
	}

	//console.log(user + ", submitted: " + title + " with the answers " + option1 + " and " + option2);
	//questionArray = [[user, [title, [[option1], [0]], [[option2], [0]]]]];

	questionArray.push([user, [title, [[option1], [0]], [[option2], [0]]]]);
	questionArrayRef.update(questionArray);

	goToPage(loggedInMenuPage);
}

function AnswerQuestions() {
	NewQuestion();
}

function Option1() {
	if (hasChosen) {
		return;
	}

	let chosenAmount;
	chosenAmount = parseInt(questionArray[chosenUser][1][1][1][0]) + 1;

	questionArray[chosenUser][1][1][1][0] = chosenAmount;
	questionArrayRef.update(questionArray);

	DisplayResults(true);
}

function Option2() {
	if (hasChosen) {
		return;
	}

	let chosenAmount;
	chosenAmount = parseInt(questionArray[chosenUser][1][2][1][0]) + 1;

	questionArray[chosenUser][1][2][1][0] = chosenAmount;
	questionArrayRef.update(questionArray);

	DisplayResults(false);
}

function DisplayResults(choseOption1) {
	hasChosen = true;

	option1Amount = parseInt(questionArray[chosenUser][1][1][1][0]);
	option2Amount = parseInt(questionArray[chosenUser][1][2][1][0]);

	// Change the value within the buttons to display the percentage and the total amount chosen
	let option1 = document.getElementById("option1").innerHTML;
	let option2 = document.getElementById("option2").innerHTML;

	let chosenTotal = option1Amount + option2Amount;

	let option1percentage = Math.round((option1Amount / chosenTotal) * 100);
	option1 = option1percentage + "%" + "<br>" + option1Amount;
	console.log("Option 1: " + option1percentage + "%" + " (" + option1Amount + ")");

	let option2percentage = Math.round((option2Amount / chosenTotal) * 100);
	option2 = option2percentage + "%" + "<br>" + option2Amount;
	console.log("Option 2: " + option2percentage + "%" + " (" + option2Amount + ")");

	if (choseOption1) {
		option1 = option1 + " agrees";
		option2 = option2 + " disagrees";
	} else {
		option1 = option1 + " disagrees";
		option2 = option2 + " agrees";
	}

	document.getElementById("option1").innerHTML = option1;
	document.getElementById("option2").innerHTML = option2;
}

function NewQuestion() {
	hasChosen = false;

	let option1 = document.getElementById("option1").innerHTML;
	let option2 = document.getElementById("option2").innerHTML;

	let newChosenUser = Math.floor(Math.random() * questionArray.length);

	while (newChosenUser === chosenUser) {
		newChosenUser = Math.floor(Math.random() * questionArray.length);
	}
	chosenUser = newChosenUser;

	option1 = questionArray[chosenUser][1][1][0][0];
	option2 = questionArray[chosenUser][1][2][0][0];

	document.getElementById("option1").innerHTML = option1;
	document.getElementById("option2").innerHTML = option2;
}