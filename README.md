Cloze Quiz Generator v1.2

An app for automating the creation of cloze (fill-in-the-blank) vocabulary and grammar activities.
Powered by the Tatoeba corpus and Mecab tokenizer.

DIRECTIONS:
- First unzip the "data.zip" file.  This is a set of JSON files each containing a chunk of the Tatoeba corpus.  Then the app can be run as normal.
- To make the loading even faster, "split_json.py" can be run on the entire list of sentences in the Tatoeba corpus (tatoeba.zip), specifying a number for "sentencesPerFile"

RECENT UPDATES:
- increased loading speed by splitting Tatoeba corpus into sets of 33,333 sentences each.  Loading time went from ~30s to ~5s!
- mobile support added
- Japanese version added, using the Mecab tokenizer

TO DO:
- option to create printable worksheet
- other languages support (Tatoeba corpus has multiple languages)
- Explore ways to fetch sentences as needed from an API (Merriam Webster), rather than iterate through a huge list to find a sentence with each target word
