
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

var initialFileNo;
var fileNo;
var fileName;

var queryCount = 0;

var print = false;
var language;

var radios;
var fileSuffix = '.json';  //add language suffix to this (jp.json, ch.json, etc.  No suffix for English )


function main() {

	if (document.getElementById('sentences-per-word').value == "" || document.getElementById('sentences-per-word').value < 1) {
		document.getElementById('alert').style.backgroundColor = 'yellow';
		document.getElementById('alert').innerHTML += '<br><b>Please enter a number above 0 for sentences per word/phrase!</b>';
		return;
	}

	//check language setting::
	radios = document.getElementsByName('language');
	for (n in radios) {
		if (radios[n].checked == true) { language = radios[n].value }
	}

	if (language != 'en') {
		fileSuffix = language + '.json';
	} else {fileSuffix = '.json'}

	switch(language) {
		case 'en': initialFileNo = Math.floor(Math.random() * 31); break;
		case 'jp': initialFileNo = Math.floor(Math.random() * 5); break;
		default: break;
	}

	

	document.getElementById('alert').style.backgroundColor = 'white';
	document.getElementById('alert').innerHTML = 'Sentences per word/phrase:';

	//clear everything from the previous search first:
	document.getElementById('sentences').innerHTML = '';
	document.getElementById('tips').innerHTML = '';
	document.getElementById('wordbank').innerHTML = '';
	document.getElementById('message').innerHTML = '';
	document.getElementById('message').style.display = 'none';
	document.getElementById('start-button').innerHTML = 'Make Quiz';

	counterForNames = 0;
	counterForIds = 0;
	score = 0;
	clickedWord = false;
	clickedSentence = false;
	clozeSentences = [];
	queryCount = 0;
	
	fileNo = initialFileNo; // fileNo will be changed, but initialFileNo won't
	fileName = 'data/sentences' + initialFileNo + fileSuffix;


	wb.style.visibility = 'visible';

	//add the name line and directions
	document.getElementById('header').innerHTML = '<strong>Directions: Click a word and a sentence to make a match.</strong>';

	switch (language) {
		case 'en':
			searchTerms = $('#search').val().toLowerCase().replace(/,\s+/g,",").split(",");
			break;
		case 'jp':
			searchTerms = $('#search').val().replace(/、+/g,",");
			searchTerms = $('#search').val().replace(/,\s+/g,",");
			searchTerms = searchTerms.split(",");
			break;
		default: break;
	}

	searchTerms = shuffle(searchTerms);
				
	getSentences(searchTerms);

};


function makeClozeSentence(sen, correctWord, name) {

	if (correctWord == undefined) {return};
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
//	fileNo = 0;
//	fileName = 'data/sentences' + fileNo + fileSuffix ;
//	fileName = 'data/sentences' + initialFileNo + fileSuffix ;
}



function win() {
	alert("You win!  You can make another quiz by entering new settings.");
	resetSelected();
}


function correctAnswer() {

	//fill the word into the blank:
	selectedSenElement.innerHTML = selectedSenElement.innerHTML.replace("_______", "<u>" + selectedWord.split('-')[0] + "</u>");
	selectedSenElement.style.color = 'green';
	selectedSenElement.style.fontWeight = 'bold';
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
	
	document.getElementById('message').style.display = 'block';
	document.getElementById('message').innerHTML = "Loading...Please wait...";

	sentencesPerWord = document.getElementById('sentences-per-word').value;	
	var query;

	counterForIds ++;
	count = 0;
	foundWord = false;
	alreadyMadeWordDiv = false;

	loadCorpus(wordsArray[queryCount], fileName, searchCorpus);  //loads, then searches, the chunk of the corpus	
}



function searchCorpus(query, dataToSearch) {  //dataToSearch is the response from ajax (json object)

	if (language == 'jp' || language == 'cn') {
		var word = query;
	} else {
		var	word    = ' ' + query + ' ';
		var endWord = ' ' + query + '.';
	};
	//	var wordWithComma = ' ' + wordsArray[i] + ',';
	//	var wordWithColon = ' ' + wordsArray[i] + ':';
	count = 0;
	alreadyMadeWordDiv = false;

	var sentences = dataToSearch.sentences;

	//search through 100,000 sentences of the Tatoeba corpus:
	for (j=0; j<sentences.length; j++) {

		//if word is found in a sentence:
		if (sentences[j].includes(word)) {

			if (!foundWord) {queryCount ++};  //only increase queryCount by 1 per word, not per sentence (sometimes multiple sentences per word)

			foundWord = true;
			
			//add the word to wordbank:
			if (!alreadyMadeWordDiv && query!=undefined) { makeWordDiv(query) };  //prevents adding the words multiple times (if noOfSentences to get is > 1 )
			
			var sentence = sentences[j].replace(word, " _______ ");

			counterForNames++;
			//make a cloze sentence and add it to the clozeSentences array:
			makeClozeSentence(sentence, query, counterForNames);

			
		}

		//if word found at END of sentence:
		else if (sentences[j].includes(endWord)) {

			if (!foundWord) {queryCount ++};
			foundWord = true;

			//add the word to wordbank:
			if (!alreadyMadeWordDiv && query!=undefined) { makeWordDiv(query) };

			var sentence = sentences[j].replace(endWord, " _______.");

			counterForNames++;
			//make a cloze sentence and add it to the clozeSentences array:
			makeClozeSentence(sentence, query, counterForNames);
		}

		//stop getting sentences after you've found enough:
		if (count == sentencesPerWord && foundWord) { break };  // (count is set by makeClozeSentence)
	}

	// if nothing found in these 100,000 sentences, so move to the next 100,000:
	if (!foundWord) {
		console.log("nothing found in this file, on to the next...");
		document.getElementById('message').innerHTML += '//';
		fileNo++;
		if (fileNo == 31) { fileNo = 0 }; // end of files, back to beginning
		if (fileNo == 5 && language=='jp') { fileNo = 0 };

		//If nothing found in ALL files:
		if (!foundWord && fileNo == initialFileNo) { 
			alert ("Sorry, '" + query + "' could not be found among 1,000,000+ sentences!. Please check spelling and try again.");
			document.getElementById('sentences').innerHTML = '';
			document.getElementById('message').innerHTML = '';
			wb.innerHTML = '';
			return;
		}; 

		fileName = 'data/sentences' + fileNo + fileSuffix ;
		loadCorpus(searchTerms[queryCount], fileName, searchCorpus);  
	}

	//if more words still remain, go on to search for the next word (this, rather than a for loop, is needed for async ajax)
	else if (queryCount < searchTerms.length) {
		console.log("on to the next word...");
		foundWord = false;  //found a word, so reset this
		fileNo = initialFileNo;
		fileName = 'data/sentences' + initialFileNo + fileSuffix ;  //reset to first file
		loadCorpus(searchTerms[queryCount], fileName, searchCorpus);  
	}

	else{
		//done
		addClozeDivs();
		document.getElementById('worksheet').style.display = 'block';
		document.getElementById('message').style.display = 'block';
		document.getElementById('message').innerHTML = '';
		document.getElementById('message').innerHTML += "Don't like these sentences?  Click 'Make Quiz' again to get new sentences!";
		document.getElementsByTagName('footer')[0].style.display = 'none';
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




function toggleWorksheet() {

	if (!print) {

		print = true;

		document.getElementById('header').innerHTML = "Name: _______________________<br><br>" + document.getElementById('header').innerHTML;
		document.getElementById('directions').style.display = 'none';
		document.getElementById('activity').className = 'worksheet';  //this disables pointer events
		wb.style.border = 'solid black 1px';

		document.getElementById('back').style.display = 'block';
		document.getElementById('worksheet').style.display = 'none';

	}
	else {
		print = false;

		document.getElementById('header').innerHTML = '<strong>Directions: Click a word and a sentence to make a match.</strong>';
		document.getElementById('directions').style.display = 'block';
		document.getElementById('activity').className = '';  //this disables pointer events
		wb.style.border = 'solid lightblue 3px';

		document.getElementById('back').style.display = 'none';
		document.getElementById('worksheet').style.display = 'block';

	}
}





//run the search when user presses Enter
addEventListener('keydown', function(event) {

	if (event.keyCode == 13) {

		main();
	};
});
