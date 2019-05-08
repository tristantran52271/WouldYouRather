goToPage(answerQuestionsPage);

function goToPage(pageNumber) {
	//hides all pages with a class of pages
	document.querySelectorAll('.pages').forEach((e) => e.hidden = true);
	//shows page needed
	pageNumber.hidden = false;
}