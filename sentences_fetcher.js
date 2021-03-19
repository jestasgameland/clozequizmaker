
var wb = document.getElementById('wordbank');
var searchTerms;

var selectedSenElement;
var selectedSenName;
var selectedWord;
var sentencesPerWord;

var clickedSentence = false;
var clickedWord = false;

var counterForNames = 0;
var counterForIds = 0;
var noOfSentences;

var clozeSentences = [];

var score = 0;

var count;
var alreadyMadeWordDiv = false;
var foundWord = false;

var fileNo = 0;
var fileName = 'data/sentences' + fileNo + '.json' ;

var queryCount = 0;






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
	queryCount = 0;
	fileNo = 0;
	fileName = 'data/sentences0.json';

	wb.style.visibility = 'visible';

	//add the name line and directions
	document.getElementById('header').innerHTML = '<br><br><p><strong>Directions: Click a word and a sentence to make a match.</strong></p>';

	searchTerms = $('#search').val().replace(/,\s+/g,",").split(",");

	searchTerms = shuffle(searchTerms);
				
	getSentences(searchTerms);

};


function makeClozeSentence(sen, correctWord, name) {

	var sentenceDiv = document.createElement('div');
	sentenceDiv.innerHTML = sen + '<br><br>';
	sentenceDiv.className = 'row sentence';
	sentenceDiv.setAttribute('name', correctWord + "-" + name);

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

	//reset filename back to first 100,000 sentences:
	fileNo = 0;
	fileName = 'data/sentences' + fileNo + '.json' ;
}



function win() {
	alert("You win!  You can make another quiz by entering new settings.");
	resetSelected();
}


function correctAnswer() {

	//fill the word into the blank:
	selectedSenElement.innerHTML = selectedSenElement.innerHTML.replace("_______", "<b>" + selectedWord.split('-')[0] + "</b>");
	selectedSenElement.style.pointerEvents = 'none';
	wb.style.backgroundColor = 'lightgreen';
	score ++;
	if (score == clozeSentences.length) { 
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


function loadCorpus(query, fileId, doThisNext) {

	$.ajax({
	    type : "GET",
	    url : fileId,
	    async : true,  
	    dataType : 'json',
	    success : function(response) {
	    	doThisNext(query, response);
	    }
	});
}


function getSentences(wordsArray) {  //gets sentences with the target words from Tatoeba corpus JSON file
	
	document.getElementById('loading').innerHTML = "<h2>Loading...Please wait...</h2><br><br>";

	sentencesPerWord = document.getElementById('sentences-per-word').value;	
	var query;

	counterForIds ++;
	count = 0;
	foundWord = false;
	alreadyMadeWordDiv = false;

	loadCorpus(wordsArray[queryCount], fileName, searchCorpus);  //loads, then searches, the chunk of the corpus	
}



function searchCorpus(query, dataToSearch) {  //dataToSearch is the response from ajax (json object)
	var	word    = ' ' + query + ' ';
	var endWord = ' ' + query + '.';
	count = 0;
	alreadyMadeWordDiv = false;
	//	var wordWithComma = ' ' + wordsArray[i] + ',';
	//	var wordWithColon = ' ' + wordsArray[i] + ':';

	//search through 100,000 sentences of the Tatoeba corpus:
	for (j=0; j<dataToSearch.sentences.length; j++) {

		//if word is found in a sentence:
		if (dataToSearch.sentences[j].includes(word)) {

			if (!foundWord) {queryCount ++};  //only increase queryCount by 1 per word, not per sentence (sometimes multiple sentences per word)

			foundWord = true;
			
			//add the word to wordbank:
			if (!alreadyMadeWordDiv) { makeWordDiv(query) };  //prevents adding the words multiple times (if noOfSentences to get is > 1 )
			
			var sentence = dataToSearch.sentences[j].replace(word, " _______ ");

			counterForNames++;
			//make a cloze sentence and add it to the clozeSentences array:
			makeClozeSentence(sentence, query, counterForNames);

			
		}

		//if word found at END of sentence:
		else if (dataToSearch.sentences[j].includes(endWord)) {

			if (!foundWord) {queryCount ++};
			foundWord = true;

			//add the word to wordbank:
			if (!alreadyMadeWordDiv) { makeWordDiv(query) };

			var sentence = dataToSearch.sentences[j].replace(endWord, " _______.");

			counterForNames++;
			//make a cloze sentence and add it to the clozeSentences array:
			makeClozeSentence(sentence, query, counterForNames);
		}

		//stop getting sentences after you've found enough:
		if (count == sentencesPerWord) { break };  // (count is set by makeClozeSentence)
	}

	// if nothing found in these 100,000 sentences, so move to the next 100,000:
	if (!foundWord) {
		console.log("nothing found in first file, on to the next...");
		fileNo ++;
		fileName = 'data/sentences' + fileNo + '.json' ;
		loadCorpus(searchTerms[queryCount], fileName, searchCorpus);  
	}

	//if more words still remain, go on to search for the next word (this, rather than a for loop, is needed for async ajax)
	else if (queryCount < searchTerms.length) {
		console.log("on to the next word...");
		foundWord = false;
		fileNo = 0;
		fileName = 'data/sentences0.json' ;  //reset to first file
		loadCorpus(searchTerms[queryCount], fileName, searchCorpus);  
	}

	else{
		//done
		addClozeDivs();
		document.getElementById('loading').innerHTML = '';
	};
}


function makeWordDiv(wordToUse) {

	//add to wordbank:
	var wordDiv = document.createElement('div');
	wordDiv.innerHTML = wordToUse;
	wordDiv.className = 'word-div';
	wordDiv.id = wordToUse + "-" + counterForIds;
	wb.appendChild(wordDiv);

	alreadyMadeWordDiv = true;

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
	
	for (i=0; i<clozeSentences.length; i++) {
		//add the numbers:
		clozeSentences[i].innerHTML = (i+1) + '.' + "&nbsp&nbsp&nbsp" + clozeSentences[i].innerHTML;
		document.getElementById('sentences').appendChild(clozeSentences[i]);
    };
}


//run the search when user presses Enter
addEventListener('keydown', function(event) {

	if (event.keyCode == 13) {

		main();
	};
});
