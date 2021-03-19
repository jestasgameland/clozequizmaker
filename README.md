Cloze Quiz Generator v1.2

An app for automating the creation of cloze (fill-in-the-blank) vocabulary activities.
Powered by the Tatoeba corpus.

DIRECTIONS:
- First unzip the "data.zip" file.  This is a set of JSON files each containing a chunk of the Tatoeba corpus.  Then the app can be run as normal.
- To make the loading even faster, "split_json.py" can be run on the entire list of sentences in the Tatoeba corpus (tatoeba.zip), specifying a number for "sentencesPerFile"

TO DO:
- option to create printable worksheet
- mobile support
- other languages support (Tatoeba corpus has multiple languages)
- increase loading speed of Tatoeba corpus (large JSON file of over 1,000,000 sentences currently takes up to 30s)
- Explore ways to fetch sentences as needed from an API, rather than iterate through a huge list to find a sentence with each target word
