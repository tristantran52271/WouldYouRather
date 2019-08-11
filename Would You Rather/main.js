// Sets up the first page for the user to enter and see
goToPage(menuPage);

// VARIABLES
let userArray = [];
var database = firebase.database();
// Set userArrayRef to the array from Firebase
let userArrayRef = database.ref('/userArray');
userArrayRef.once('value').then(reload);

let questionArray = [];
// Set questionArrayRef to the array from Firebase
let questionArrayRef = database.ref('/questionArray');
questionArrayRef.once('value').then(reloadQuestions);

var isLoggedIn = false;
let loggedUsername = "";

let chosenUser = 0;

let hasChosen = false;

let sortTitleReverse = false;

let searchArray;
let searchedItemsArray;

// This function reloads local array (userArrayRef) of to the array from Firebase
function reload(data) {
	//If there is no data in the online databse, it creates an array
	if (userArray == null) userArray = [];
	//Adding the incoming data into a object
	userArray = data.val();

	userArrayRef.update(userArray);
}

// Exactly the same function as reload, but it also removes any elements in the array that are undefined
// This prevents lots of errors that invove checking each element
function reloadQuestions(data) {
	//If there is no data in the online databse, it creates an array
	if (questionArray == null) questionArray = [];
	//Adding the incoming data into a object
	questionArray = data.val();

	// Loop throught the questionArray
	for (i = 0; i < questionArray.length; i++) {
		// Is there an undefined element?
		if (typeof questionArray[i] == 'undefined') {
			// Remove that element
			questionArray.splice(i, 1);
		}
	}

	// Update the Firebase array to the new array
	questionArrayRef.update(questionArray);
}

// Function that controls the create account process
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
		//console.log("Please fill all fields!");
		createAccountErrorText.innerHTML = "Please fill all fields";
		return;
	}

	// Checks if the username contains any spaces, if so exit the function
	let hasSpaces = createAccountUsernameInput.toString().includes(" ");
	if (hasSpaces) {
		//console.log("Please remove any spaces in the username");
		createAccountErrorText.innerHTML = "Please remove any spaces in the username";
		return;
	}

	// Checks if username already exists, if so exit the function
	for (i = 0; i < userArray.length; i++) {
		if (userArray[i][0] === createAccountUsernameInput) {
			//console.log("Username already exist!");
			createAccountErrorText.innerHTML = "Username already exists";
			return;
		}
	}

	// Add a new element to the array with the created account details
	userArray.push([createAccountUsernameInput, createAcconutPasswordInput]);
	// Update the Firebase array
	userArrayRef.update(userArray);

	// Send the user to the menu page
	goToPage(menuPage);
}

// Function that controls the process of logging into the application
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
			isLoggedIn = true;
			loggedUsername = userArray[i][0];

			// Send the user to the loggedInMenuPage and display their username
			goToPage(loggedInMenuPage);
			document.getElementById("menuUsername").innerHTML = loggedUsername;
			break;
		} else if (i === userArray.length) {
			// Otherwise, the user does not have an account
			// Display an error message to the user
			loginErrorText.innerHTML = "Incorrect username or password";
			return;
		} else {
			loginErrorText.innerHTML = "Incorrect username or password";
		}
	}
}

// Function that stops the user from entering the loggedInMenuPage if they havn't accutally logged in
function goToLoggedInMenu() {
	if (isLoggedIn === false) {
		alert("Please Log In");
		return;
	}
	// Display the username to the user
	document.getElementById("menuUsername").innerHTML = loggedUsername;
	// Send the user to the loggedInMenuPage
	goToPage(loggedInMenuPage);
}

// Function that controls changing and initialisation of pages for the user
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

	// Clear the inputs when the user enters the page
	if (pageNumber === createQuestionsPage) {
		document.getElementById("titleInput").value = "";
		document.getElementById("option1Input").value = "";
		document.getElementById("option2Input").value = "";
	}

	// If the user goes to the answerQuestionsPage, do the following function
	if (pageNumber === answerQuestionsPage) {
		AnswerQuestions();
	}

	// If the user goes to the statisticsPage, Fill the table with all the questions
	if (pageNumber === statisticsPage) {
		FillTable(questionArray);
	}

	// reveals required page
	pageNumber.hidden = false;
}

// Function that controls the process of creating a question
function CreateQuestion() {
	let user = loggedUsername;
	// Retrieving the values from the HTML
	let title = document.getElementById("titleInput").value;
	let option1 = document.getElementById("option1Input").value;
	let option2 = document.getElementById("option2Input").value;

	//Checks whether any of the fields are empty
	if (title === "" || option1 === "" || option2 === "") {
		// Inform the user to fill the fields
		alert("Please fill out all fields");
		return;
	}

	// Add a new element to the questionArray for the new question
	questionArray.push([user, [title, [[option1], [0]], [[option2], [0]]]]);
	// Update the Firebase array
	questionArrayRef.update(questionArray);
	// Send the user back to the loggedInMenuPage
	goToPage(loggedInMenuPage);
}

function AnswerQuestions() {
	// Call the NewQuestion function
	NewQuestion();
}

// Function that is called when the user selects Option1
function Option1() {
	// If the user hasn't chosen an option, exit this function
	if (hasChosen) {
		return;
	}

	let chosenAmount;
	// Increment the total people who have selected this option by 1
	chosenAmount = parseInt(questionArray[chosenUser][1][1][1][0]) + 1;

	// Set the Option1 chosen amount element to the new chosenAmount
	questionArray[chosenUser][1][1][1][0] = chosenAmount;
	// Update the Firebase array
	questionArrayRef.update(questionArray);
	// Display Option1's results
	DisplayResults(true);
}

function Option2() {
	// If the user hasn't chosen an option, exit this function
	if (hasChosen) {
		return;
	}

	let chosenAmount;
	// Increment the total people who have selected this option by 1
	chosenAmount = parseInt(questionArray[chosenUser][1][2][1][0]) + 1;

	// Set the Option1 chosen amount element to the new chosenAmount
	questionArray[chosenUser][1][2][1][0] = chosenAmount;
	// Update the Firebase array
	questionArrayRef.update(questionArray);
	// Display Option1's results
	DisplayResults(false);
}

// Display the results for both buttons.
// parameter choseOption1 allows the function to edit the text base on which button it is
function DisplayResults(choseOption1) {
	hasChosen = true;


	let option1Amount = parseInt(questionArray[chosenUser][1][1][1][0]);
	let option2Amount = parseInt(questionArray[chosenUser][1][2][1][0]);

	// Change the value within the buttons to display the percentage and the total amount chosen
	let option1 = document.getElementById("option1").innerHTML;
	let option2 = document.getElementById("option2").innerHTML;

	// Total amount of people who have answered this question
	let chosenTotal = option1Amount + option2Amount;

	// Calculate the percentage of the people who chose option1 
	let option1percentage = Math.round((option1Amount / chosenTotal) * 100);
	// Set option1 to the percentage value with an '%' and the number of people who chose this option
	// The "<br>" is for the HTML to add a break for the option1Amount
	option1 = option1percentage + "%" + "<br>" + option1Amount;

	// Calculate the percentage of the people who chose option2
	let option2percentage = Math.round((option2Amount / chosenTotal) * 100);
	// Set option2 to the percentage value with an '%' and the number of people who chose this option
	// The "<br>" is for the HTML to add a break for the option2Amount
	option2 = option2percentage + "%" + "<br>" + option2Amount;

	// Based on the choseOption1 parameter, add an 'agree' or a 'disagree' to the corresponding button
	if (choseOption1) {
		// Add to the option1/option2 string whether or not other people agree/disagree
		option1 = option1 + " agree";
		option2 = option2 + " disagrees";
	} else {
		// Add to the option1/option2 string whether or not other people agree/disagree
		option1 = option1 + " disagrees";
		option2 = option2 + " agree";
	}

	// Display the final results to each button respectively
	document.getElementById("option1").innerHTML = option1;
	document.getElementById("option2").innerHTML = option2;
}

// Function called when the user presses 'Next' for the next/new question
function NewQuestion() {
	hasChosen = false;
	// Retrieve innerHTML for option1 and option2
	let option1 = document.getElementById("option1").innerHTML;
	let option2 = document.getElementById("option2").innerHTML;

	// Get a new user value to retreive their question
	let newChosenUser = Math.floor(Math.random() * questionArray.length);

	// If the new user value is the same as the current value, get a new value
	while (newChosenUser === chosenUser) {
		newChosenUser = Math.floor(Math.random() * questionArray.length);
	}
	// When the value is different, set the current value to the new one
	chosenUser = newChosenUser;

	// Set option1/option2 to the contents of the question from the array
	option1 = questionArray[chosenUser][1][1][0][0];
	option2 = questionArray[chosenUser][1][2][0][0];
	// Display the content to the user
	document.getElementById("option1").innerHTML = option1;
	document.getElementById("option2").innerHTML = option2;
}

// Function controls the process to fill the table in the Statistics page
// The parameter content is the array that will be used to fill the table
function FillTable(content) {
	// Set the table body to nothing (making sure it's empty)
	document.getElementById("tbody").innerHTML = '';
	var testRow = document.getElementById("tbody").insertRow(0);

	// Fill the table with the questions and results from the questionArray
	for (i = 0; i < content.length; i++) {
		// Get the table
		let statisticsTable = document.getElementById("table");
		// Set row to a new row
		let row = statisticsTable.insertRow(statisticsTable.rows.length);
		// Insert a nameCell to the new row
		let questionNameCell = row.insertCell(0);
		// Insert a resultsCell to the new row
		let questionResultsCell = row.insertCell(1);

		// Set the cell to the question name from te array
		questionNameCell.innerHTML = content[i][1][0];

		// Set optoin1Amount and option2Amount to the chosen amount with an integer datatype
		option1Amount = parseInt(content[i][1][1][1][0]);
		option2Amount = parseInt(content[i][1][2][1][0]);
		// Calculate the total chosen
		let chosenTotal = option1Amount + option2Amount;
		// Calculate the percentage for each option
		let option1percentage = Math.round((option1Amount / chosenTotal) * 100);
		let option2percentage = Math.round((option2Amount / chosenTotal) * 100);
		// Set the result cell to the percentages of each option as a string
		// String contatinates HTML of font and colour to display the percentages of different colour
		questionResultsCell.innerHTML =
			"<font color='#007aed'>" + option1percentage + "%</font> | " +
			"<font color='#f56476'>" + option2percentage + "%</font>";
	}
}

// Function controls the process of sorting the questions in alphabetical and reverse alphabetical order
// UNFINISHED
function SortQuestionTitle() {
	if (sortTitleReverse === false) {
		SortQuestionArray();
		sortTitleReverse = true;
	} else {
		SortQuestionArray();
		sortTitleReverse = false;
	}
}

// Function controls sorting the question array with Insertion Sort
function SortQuestionArray() {
	let arrayToSort = questionArray;
	let numberOfQuestions = arrayToSort.length;
	// This variable will act as an index for the Insertion sort
	let currentQuestion = 1;

	// If currentQuestion is less than the total number of questions...
	while (currentQuestion + 1 <= numberOfQuestions) {
		// Then...
		// Grab the question data
		let currentQuestionData = arrayToSort[currentQuestion][1][0];
		// Set the new index
		let currentQuestionIndex = arrayToSort[currentQuestion];
		// Set a comparison index
		let comparison = 0;
		let finish = false;

		// If the comparison index is less than the currentQuestion index...
		while (comparison < currentQuestion && finish === false) {
			// Then...
			// If the value of the currentQuestionData is less than the compared data...
			if (currentQuestionData < arrayToSort[comparison][1][0]) {
				let shuffleQuesiton = currentQuestion;

				while (shuffleQuesiton > comparison) {
					// Shuffle the questions so that they are in order
					arrayToSort[shuffleQuesiton] = arrayToSort[shuffleQuesiton - 1];
					shuffleQuesiton--;
				}
				// Set comparison to the new questionIndex
				arrayToSort[comparison] = currentQuestionIndex;
				finish = true;
			}
			comparison++;
		}
		currentQuestion++;
	}
	// Fill the table with the newly sorted array
	FillTable(arrayToSort);
}

// Function controls the process to sort an array for a search
// Paramter array is for the array to be searched
function SortQuestionArrayForSearch(array) {
	let arrayToSort = array;
	let numberOfQuestions = arrayToSort.length;
	// This variable will act as an index for the Insertion sort
	let currentQuestion = 1;

	// If currentQuestion is less than the total number of questions...
	while (currentQuestion + 1 <= numberOfQuestions) {
		// Then...
		// Grab the question data
		let currentQuestionData = arrayToSort[currentQuestion][1][0];
		// Set the new index
		let currentQuestionIndex = arrayToSort[currentQuestion];
		// Set a comparison index
		let comparison = 0;
		let finish = false;

		// If the comparison index is less than the currentQuestion index...
		while (comparison < currentQuestion && finish === false) {
			// Then...
			// If the value of the currentQuestionData is less than the compared data...
			if (currentQuestionData < arrayToSort[comparison][1][0]) {
				let shuffleQuesiton = currentQuestion;

				while (shuffleQuesiton > comparison) {
					// Shuffle the questions so that they are in order
					arrayToSort[shuffleQuesiton] = arrayToSort[shuffleQuesiton - 1];
					shuffleQuesiton--;
				}
				// Set comparison to the new questionIndex
				arrayToSort[comparison] = currentQuestionIndex;
				finish = true;
			}
			comparison++;
		}
		currentQuestion++;
	}
	// Return the newly sorted array
	return arrayToSort;
}

// Function to initiate the search to find all similar values
function SearchAll(firstSearch) {
	if (firstSearch === true) {
		// Reload the local array
		questionArrayRef.once('value').then(reloadQuestions);
		// Set searchArray to the questionArray
		searchArray = questionArray;
		// Clear the searchedItemsArray
		searchedItemsArray = [];
	}

	// Initiate the Search function for the searchArray
	Search(searchArray);
}

// Search the array for values similar to the user's input
function Search(array) {
	// Get user's from the search bar
	let search = document.getElementById("searchInput").value;
	// If the bar is empty, exit the function.
	if (search === "") {
		alert("Empty search field");
		return;
	}
	// Otherwise, search through the sorted array for values similar to 'search'
	BinarySearch(SortQuestionArrayForSearch(array), search);
}

// Function that controls the process of searching an item
function BinarySearch(array, search) {
	let arrayToSearch = array;

	// High and Low are the bondaries of search within the array
	let low = 0;
	let high = array.length;

	let found = false;
	// Turing the searchInput to all lowercase so capped letters aren't a factor
	let itemToFind = search.toLowerCase();

	while (high >= low && found === false) {
		// Set middle to the middle int value between high and low
		let middle = parseInt((low + high) / 2);

		// If the middle value equals the array's length, exit the function
		if (middle === arrayToSearch.length) {
			break;
		}

		// If the itemToFind is equal to the middle index element...
		if (FoundItem(arrayToSearch, middle, itemToFind)) {
			// Then...
			// Set if we found the item to true
			found = true;
			// Exit the while loop
			break;
		}

		// If the itemToFind is alphabetically lower than the middle...
		if (itemToFind < (arrayToSearch[middle][1][0]).toLowerCase()) {
			// Then...
			// Set the high value to the middle
			high = middle - 1;
		} else {
			// Otherwise...
			// Set the low value to the middle
			low = middle + 1;
		}
	}
}

// Function that returns true/false whether or not it has found the item
// array : sorted array to search
// index : the element index within the array to compare to
// itemToFind : the user's searche item
function FoundItem(array, index, itemToFind) {
	// Turning the element content to lowercase so capped letters aren't a factor when comparing strings
	let itemInArray = array[index][1][0].toLowerCase();

	// If the compared item contains anything similar to the user's search...
	if (itemInArray.includes(itemToFind)) {
		// Then...
		// Add this element to the searchedItemsArray
		searchedItemsArray.push(array[index]);
		// Remove this item from the initial sorted array
		searchArray.splice(index, 1);
		// Fill the table with the searchedItemsArray
		FillTable(searchedItemsArray);

		// Recall the SearchAll function to see if there are any other similar values
		SearchAll(false);

		// return a true value for the function
		return true;
	}
	// Otherwise, return false
	return false;
}