
var wb = document.getElementById('wordbank');
var searchTerms;

var selectedSenElement;
var selectedSenName;
var selectedWord;

var clickedSentence = false;
var clickedWord = false;

var counterForNames = 0;
var counterForIds = 0;
var noOfSentences;

var clozeSentences = [];

var score = 0;

var count;




function main() {

	if (document.getElementById('sentences-per-word').value == "") {
		document.getElementById('alert').style.backgroundColor = 'yellow';
		document.getElementById('alert').innerHTML += '<br><b>Please enter a number for sentences per word/phrase!</b>';
		return;
	}

	document.getElementById('alert').style.backgroundColor = 'white';
	document.getElementById('alert').innerHTML = 'Sentences per word/phrase:';

	//clear everything from the previous search first:
	document.getElementById('sentences').innerHTML = '';
	document.getElementById('examples').innerHTML = '';
	document.getElementById('wordbank').innerHTML = '';
	document.getElementById('message').innerHTML = '';
	document.getElementById('start-button').innerHTML = 'Make Quiz';

	counterForNames = 0;
	counterForIds = 0;
	score = 0;
	clickedWord = false;
	clickedSentence = false;
	clozeSentences = [];

	wb.style.visibility = 'visible';

	//add the name line and directions
	document.getElementById('header').innerHTML = '<br><br><p><strong>Directions: Click a word and a sentence to make a match.</strong></p>';

	searchTerms = $('#search').val().replace(/,\s+/g,",").split(",");

	searchTerms = shuffle(searchTerms);
				
	getSentences(searchTerms);

};


function makeClozeSentence(sen, correctWord, id) {

	var sentenceDiv = document.createElement('div');
	sentenceDiv.innerHTML = sen + '<br><br>';
	sentenceDiv.className = 'row sentence';
	sentenceDiv.setAttribute('name', correctWord + "-" + id);

	sentenceDiv.addEventListener("click", function() {

		selectedSenElement = this;

		if (!clickedSentence) {

			//if no sentence was selected, select this one
			clickedSentence = true;
			this.style.backgroundColor = "lightgreen";
			selectedSenName = this.getAttribute('name');

			//If this matches a word that's been clicked
			if (clickedWord) {
				if (selectedSenName.split('-')[0] == selectedWord.split('-')[0]) {	
					correctAnswer();
				}
				//if it doesn't match
				else {
					this.style.backgroundColor = "white";
					wrongAnswer();
				}
			}

		}

		// if this sentence was already selected, unselect it
		else if (selectedSenName == this.getAttribute('name')) {
			clickedSentence = false;
			this.style.backgroundColor = "white";
			selectedSenName = null;
		}

		//if another sentence was selected, change the selection to this sentence
		else {
			document.getElementsByName(selectedSenName)[0].style.backgroundColor = "white";
			this.style.backgroundColor = "lightgreen";
			selectedSenName = this.getAttribute('name');
		}
	})

	clozeSentences.push(sentenceDiv);

	count ++;  
}



function win() {
	alert("You win!");
	resetSelected();
}


function correctAnswer() {

	//fill the word into the blank:
	selectedSenElement.innerHTML = selectedSenElement.innerHTML.replace("_______", "<b>" + selectedWord.split('-')[0] + "</b>");
	selectedSenElement.style.pointerEvents = 'none';
	wb.style.backgroundColor = 'lightgreen';
	score ++;
	if (score == noOfSentences) { 
		win();
		return;
	}
	else {setTimeout(resetSelected, 500)};
}

function wrongAnswer() {
	document.getElementById(selectedWord).style.backgroundColor = "white";
	document.getElementsByName(selectedSenName)[0].style.backgroundColor = "white";
	wb.style.backgroundColor = 'red';
	setTimeout(resetSelected, 500);
}

function resetSelected() {
	clickedWord = false;
	clickedSentence = false;
	selectedSenName = null;
	selectedWord = null;	
	wb.style.backgroundColor = 'white';
	document.getElementById('sentences').style.backgroundColor = 'white';
	$(".sentence").css("background-color", "white");
	$(".word-div").css("background-color", "white");
}



function getSentences(wordsArray) {  //gets sentences with the target words from Tatoeba corpus JSON file


	document.getElementById('sentences').innerHTML = "<h2>Loading...Please wait up to 30 seconds...</h2><br><br>";


	$.ajax({
	    type : "GET",
	    url : "sentences.json",
	    async : true,  
	    dataType : 'json',
	    success : function(response) {

	    	document.getElementById('sentences').innerHTML = "";

	    	var sentencesPerWord = document.getElementById('sentences-per-word').value;
	    	
	    	var endWord;
	    	var word;

	    	//for every word entered...
	    	for (i=0; i<wordsArray.length; i++) {

	    		counterForIds ++;

	 	   		word = ' ' + wordsArray[i] + ' ';
	    		endWord = ' ' + wordsArray[i] + '.';

	    		//First, check that the word actually exists in the corpus of sentences:
	    		count = -1;

	    		//search through the Tatoeba list of over 1,000,000 sentences:
		    	for (j=0; j<response.sentences.length; j++) {

					//if word is found in a sentence:
		    		if (response.sentences[j].includes(word)) {

		    			//add the word to wordbank:
		    			makeWordDiv(wordsArray[i]);

		    			var sentence = response.sentences[j].replace(word, " _______ ");

		    			counterForNames++;
		    			//make a cloze sentence and add it to the clozeSentences array:
						makeClozeSentence(sentence, wordsArray[i], counterForNames);
						
		    		}

		    		//if word found at END of sentence:
		    		else if (response.sentences[j].includes(endWord)) {

		    			//add the word to wordbank:
		    			makeWordDiv(wordsArray[i]);

		    			var sentence = response.sentences[j].replace(endWord, " _______.");

		    			counterForNames++;
		    			//make a cloze sentence and add it to the clozeSentences array:
		    			makeClozeSentence(sentence, wordsArray[i], counterForNames);
		    		}

		    		//stop getting sentences after you've found enough:
		    		if (count == sentencesPerWord) { break };
		    	};	





	   




		    	noOfSentences = clozeSentences.length / 2;

			}

			addClozeDivs();
		}
	});
}


function makeWordDiv(wordToUse) {

	//add to wordbank:
	var wordDiv = document.createElement('div');
	wordDiv.innerHTML = wordToUse;
	wordDiv.className = 'word-div';
	wordDiv.id = wordToUse + "-" + counterForIds;
	wb.appendChild(wordDiv);

	wordDiv.addEventListener("click", function() {

		if (!clickedWord) {
			//if no sentence was selected, select this one
			clickedWord = true;
			this.style.backgroundColor = "lightgreen";
			selectedWord = this.getAttribute('id');

			//If this matches a word that's been clicked
			if (clickedSentence) {
				if(selectedSenName.split('-')[0] == selectedWord.split('-')[0]) {  //must use "includes" instead of equals, since the ids of the words and names of the sentences have numbers appended to them (sometimes more than one sentence per word)
					correctAnswer();
				}

				//if it doesn't match
				else {
					this.style.backgroundColor = "white";
					wrongAnswer();
				}
			}
		}

		// if this sentence was already selected, unselect it
		else if (selectedWord == this.getAttribute('id')) {
			clickedWord = false;
			this.style.backgroundColor = "white";
			selectedWord = null;
		}

		//if another sentence was selected, change the selection to this sentence
		else {
			document.getElementById(selectedWord).style.backgroundColor = "white";
			this.style.backgroundColor = "lightgreen";
			selectedWord = this.getAttribute('id');
		}
	}) ;

}


function addClozeDivs() {
	 // loop over clozeSentences to add the divs!
	shuffle(clozeSentences);
	
	var n = 1;
	for (i<0; i<clozeSentences.length; i++) {
		//add the numbers:
		clozeSentences[i].innerHTML = n + '.' + "&nbsp&nbsp&nbsp" + clozeSentences[i].innerHTML;
		document.getElementById('sentences').appendChild(clozeSentences[i]);
		n++;
    };
}


//run the search when user presses Enter
addEventListener('keydown', function(event) {

	if (event.keyCode == 13) {

		main();
	};
});
