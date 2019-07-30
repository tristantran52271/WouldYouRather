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

let sortTitleReverse = false;

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
	document.getElementById("menuUsername").innerHTML = loggedUsername;
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

	if (pageNumber === statisticsPage) {
		FillTable(questionArray);
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

	let option1Amount = parseInt(questionArray[chosenUser][1][1][1][0]);
	let option2Amount = parseInt(questionArray[chosenUser][1][2][1][0]);

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
		option1 = option1 + " agree";
		option2 = option2 + " disagrees";
	} else {
		option1 = option1 + " disagrees";
		option2 = option2 + " agree";
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

function FillTable(content) {
	document.getElementById("tbody").innerHTML = '';
	var testRow = document.getElementById("tbody").insertRow(0);

	for (i = 0; i < content.length; i++) {
		let statisticsTable = document.getElementById("table");
		let row = statisticsTable.insertRow(statisticsTable.rows.length);
		let questionNameCell = row.insertCell(0);
		let questionResultsCell = row.insertCell(1);

		questionNameCell.innerHTML = content[i][1][0];

		option1Amount = parseInt(content[i][1][1][1][0]);
		option2Amount = parseInt(content[i][1][2][1][0]);

		let chosenTotal = option1Amount + option2Amount;

		let option1percentage = Math.round((option1Amount / chosenTotal) * 100);
		let option2percentage = Math.round((option2Amount / chosenTotal) * 100);

		questionResultsCell.innerHTML =
			"<font color='#007aed'>" + option1percentage + "%</font> | " +
			"<font color='#f56476'>" + option2percentage + "%</font>";
	}
}
function SortQuestionTitle() {
	if (sortTitleReverse === false) {
		SortQuestionArray();
		sortTitleReverse = true;
	} else {
		SortQuestionArray();
		sortTitleReverse = false;
	}
}
function SortQuestionArray() {
	let arrayToSort = questionArray;
	let numberOfQuestions = arrayToSort.length;
	let currentQuestion = 1;

	while (currentQuestion + 1 <= numberOfQuestions) {
		let currentQuestionData = arrayToSort[currentQuestion][1][0];
		let currentQuestionIndex = arrayToSort[currentQuestion];
		let comparison = 0;
		let finish = false;

		while (comparison < currentQuestion && finish === false) {
			if (currentQuestionData < arrayToSort[comparison][1][0]) {
				let shuffleQuesiton = currentQuestion;

				while (shuffleQuesiton > comparison) {
					arrayToSort[shuffleQuesiton] = arrayToSort[shuffleQuesiton - 1];
					shuffleQuesiton--;
				}
				arrayToSort[comparison] = currentQuestionIndex;
				finish = true;
			}
			comparison++;
		}
		currentQuestion++;
	}
	FillTable(arrayToSort);
}

function SortQuestionArrayForSearch() {
	let arrayToSort = questionArray;
	let numberOfQuestions = arrayToSort.length;
	let currentQuestion = 1;

	while (currentQuestion + 1 <= numberOfQuestions) {
		let currentQuestionData = arrayToSort[currentQuestion][1][0];
		let currentQuestionIndex = arrayToSort[currentQuestion];
		let comparison = 0;
		let finish = false;

		while (comparison < currentQuestion && finish === false) {
			if (currentQuestionData < arrayToSort[comparison][1][0]) {
				let shuffleQuesiton = currentQuestion;

				while (shuffleQuesiton > comparison) {
					arrayToSort[shuffleQuesiton] = arrayToSort[shuffleQuesiton - 1];
					shuffleQuesiton--;
				}
				arrayToSort[comparison] = currentQuestionIndex;
				finish = true;
			}
			comparison++;
		}
		currentQuestion++;
	}
	return arrayToSort;
}

function Search() {
	let search = document.getElementById("searchInput").value;
	if (search === "") {
		console.log("Empty search field");
		return;
	}

	BinarySearch(SortQuestionArrayForSearch(), search);
}

function BinarySearch(array, search) {
	let arrayToSearch = array;
	let low = 0;
	let high = array.length;
	let found = false;
	let itemToFind = search.toLowerCase();

	//let middle;

	while (high >= low && found === false) {
		let middle = parseInt((low + high) / 2);
		console.log(middle);
		if (middle === arrayToSearch.length) {
			break;
		}

		if (FoundItem(arrayToSearch, middle, itemToFind)) {
			found = true;
			break;
		}

		if (itemToFind < (arrayToSearch[middle][1][0]).toLowerCase()) {
			console.log("lower");
			high = middle - 1;
		} else {
			console.log("higer");
			low = middle + 1;
		}
	}
	if (found === true) {
		//console.log("Found: " + itemToFind + " in " + arrayToSearch[middle][1][0].toLowerCase());
	} else {
		console.log("Not Found: " + itemToFind);
	}
}

function FoundItem(array, index, itemToFind) {
	console.log(array[index][1][0] + " " + index + " " + itemToFind);

	let itemInArray = array[index][1][0].toLowerCase();

	//console.log(itemInArray + " " + itemToFind);

	if (itemInArray.includes(itemToFind)) {
		console.log("Found: " + itemToFind + " in " + itemInArray);
		return true;
	}

	return false;
}