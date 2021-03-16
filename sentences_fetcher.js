
var examplesArray = [];
var wb = document.getElementById('wordbank');
var searchTerms;
var sentenceNumber = 1;

var selectedSenElement;
var selectedSenName;
var selectedWord;

var clickedSentence = false;
var clickedWord = false;

var counterForNames = 0;
var counterForIds = 0;
var noOfSentences;

var score = 0;


function main() {

	//clear everything from the previous search first:
	document.getElementById('sentences').innerHTML = '';
	document.getElementById('examples').innerHTML = '';
	document.getElementById('wordbank').innerHTML = '';
	document.getElementById('message').innerHTML = '';
	examplesArray = [];
	counterForNames = 0;
	clickedWord = false;
	clickedSentence = false;
	sentenceNumber = 1;

	wb.style.visibility = 'visible';

	//add the name line and directions
	document.getElementById('header').innerHTML = '<br><br><p>Name: ________________________________________</p><p><strong>Directions: Write the correct word in each blank.  Use words from the box.</strong></p>';

	searchTerms = $('#search').val().replace(/,\s+/g,",").split(",");

	searchTerms = shuffle(searchTerms);
				
	getSentences(searchTerms);

};


function addClozeSentence(sen, correctWord, id) {

	var sentenceDiv = document.createElement('div');
	sentenceDiv.innerHTML = sentenceNumber + '.' + "&nbsp&nbsp&nbsp" + sen + '<br><br>';
	sentenceDiv.className = 'row sentence';
	sentenceDiv.setAttribute('name', correctWord + "-" + id);
	document.getElementById('sentences').appendChild(sentenceDiv);

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

	sentenceNumber ++;
	count ++;  
}



function resetGame() {
	resetSelected();
	document.getElementById('sentences').innerHTML = '';
	document.getElementById('header').innerHTML = '';
	wb.innerHTML = '';
	wb.style.visibility = 'hidden';
	examplesArray = [];
}


function win() {
	alert("You win!");
	resetGame();
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


	document.getElementById('sentences').innerHTML = "<h2>Loading...Please wait 10-20 seconds...</h2>"

	$.ajax({
	    type : "GET",
	    url : "sentences.json",
	    async : true,  
	    dataType : 'json',
	    success : function(response) {

	    	document.getElementById('sentences').innerHTML = "";

	    	var sentencesPerWord = document.getElementById('sentences-per-word').value;
	    	var word;
	    	var endWord;

	    	for (i=0; i<wordsArray.length; i++) {

	    		counterForIds ++;

	 	   		word = ' ' + wordsArray[i] + ' ';
	    		endWord = ' ' + wordsArray[i] + '.';

	    		//add to wordbank:
	    		var wordDiv = document.createElement('div');
	    		wordDiv.innerHTML = wordsArray[i];
	    		wordDiv.className = 'word-div';
	    		wordDiv.id = wordsArray[i] + "-" + counterForIds;
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


	    		count = 0;

	    		//search through the Tatoeba list of over 1,000,000 sentences:
		    	for (j=0; j<response.sentences.length; j++) {

					//if word is found in a sentence:
		    		if (response.sentences[j].includes(word)) {

		    			var sentence = response.sentences[j].replace(word, " _______ ");

		    			counterForNames++;

						addClozeSentence(sentence, wordsArray[i], counterForNames);
						
		    		};

		    		//if word found at END of sentence:
		    		if (response.sentences[j].includes(endWord)) {

		    			var sentence = response.sentences[j].replace(endWord, " _______.");

		    			counterForNames++;

		    			addClozeSentence(sentence, wordsArray[i], counterForNames);
		    		};

		    		//stop getting sentences after you've found enough!
		    		if (count == sentencesPerWord) { break };
		    	};
		    };

		    noOfSentences = counterForNames;
		}
	});
}




//run the search when user presses Enter
addEventListener('keydown', function(event) {

	if (event.keyCode == 13) {

		main();
	};
});
