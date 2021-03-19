# JSON Splitter
# Created by Brendon Albertson, 2021

import json

# create a dictionary (object)
oldData = {}

with open('sentences.json') as f:
        oldData = json.load(f)

sentences = len(oldData['sentences'])

sentencesPerFile = 33333
howManyFiles = int( len(oldData['sentences']) / sentencesPerFile )
remainder = (sentences/sentencesPerFile - (int(sentences/sentencesPerFile)) ) * sentencesPerFile

globalCount = 0


def makeFile(fileId):
        #need to "grab" the global variables before changing them inside the function:
        global globalCount
        newData = {'sentences':[]}  #reset
        i = 0
        while i<sentencesPerFile:
                newData['sentences'].append( oldData['sentences'][globalCount] )
                i+=1
                globalCount+=1

        #dump the remainder items into the last JSON file:

  

	# make a new file with these 100000 sentences:
        with open('sentences'+str(fileId)+'.json', 'w', encoding='utf-8') as jsonf:
                jsonf.write(json.dumps(newData, indent=4))


for n in range(howManyFiles):
        makeFile(n)


        




