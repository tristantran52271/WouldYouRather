goToPage(menuPage);

let userArray = [];
var database = firebase.database();
let userArrayRef = database.ref('/userArray');

userArrayRef.once('value').then(reload);

function reload(data) {
	if (userArray == null) userArray = []; //If there is no data in the online databse, it creates an array
	userArray = data.val();//Adding the incoming data into a object
	//console.log(userArray);
	userArrayRef.update(userArray);
	console.log(data.val());
}
//userArrayRef.update(userArray);

function createAccount() {
	let createAccountUsernameInput = document.getElementById("createAccountUsernameInput").value;
	let createAcconutPasswordInput = document.getElementById("createAccountPasswordInput").value;

	userArray.push([createAccountUsernameInput, createAcconutPasswordInput]);
	userArrayRef.update(userArray);
}

function goToPage(pageNumber) {
	//hides all pages with a class of pages
	document.querySelectorAll('.pages').forEach((e) => e.hidden = true);
	//shows page needed
	pageNumber.hidden = false;
}