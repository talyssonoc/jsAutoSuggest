var jsT9 = function(_wordList, _config) {
	var self = this;
	var wordList;

	var config = {
		sort : function(wordA, wordB) {
			if(wordA.length < wordB.length)
				return -1;
			if(wordA.length > wordB.length)
				return 1;
			if(wordA <= wordB)
				return -1;
			else
				return 1;
		},
		maxAmount : Infinity,
		caseSentitive : true,
		dataSource : ''
	};

	// Extends the config options
	(function(destination, source) {
		for (var property in source) {
			destination[property] = source[property];
		}
		return destination;
	})(config, _config);

	
	//The root of the tree
	var root = {
		branches : []
	};

	/**
	 * Predict the words, given the initial word
	 * @param  {String} word The initial word
	 * @return {Array}      The array of Strings with the predicted words
	 */
	 this.predict = function(word, amount) {

	 	if(typeof word === 'undefined') {
	 		return [];
	 	}

	 	var currentBranch = root;
	 	var finishedWord = false;
	 	var baseWord = '';

		//Goes through the tree until it finds the branch from
		//where it will begin to predict
		
		while(!finishedWord) {
			var found = false;
			for(var i = 0; i < word.length && !found; i++) {
				var subString = word.substring(0, word.length - i);

				for(var branch in currentBranch.branches) {
					if(currentBranch.branches[branch].prefix.indexOf(subString) === 0) {
						baseWord += currentBranch.branches[branch].prefix;

						if(currentBranch.branches[branch].prefix === subString) {
							word = word.substring(word.length - i);
						}
						//In cases where it begins with the substring, but doesn't end with it
						//so it should just start the search from there
						else { 
							word = '';
						}

						currentBranch = currentBranch.branches[branch];
						found = true;
						break;
					}
				}
			}

			if(!found) {
				// console.log('No matches');
				return [];
			}

			if(word.length === 0) {
				finishedWord = true;
			}

		}

		if(currentBranch.$ === true)
			var currentWord = baseWord;

		var predictedList = _exploreBranch(baseWord, currentBranch);

		if(currentWord)
			predictedList.push(currentWord);

		predictedList.sort(config.sort);

		//If passes the amount as parameter, uses it
		//Otherwise, uses the custom maxAmount.
		if(typeof amount !== 'undefined') {
			return predictedList.slice(0, amount);
		}
		else {
			return predictedList.slice(0, config.maxAmount);
		}


	};

	/**
	 * Looks for the words that contain the word passed as parameter
	 * @param  {String} baseWord The base to look for
	 * @param  {Object} currentBranch   The begining branch
	 * @return {Array}          List of predicted words
	 */
	 var _exploreBranch = function(baseWord, currentBranch) {
	 	var predictedList = [];

		for(var b in currentBranch.branches) { //For each branch forking from the branch
			var prefix = currentBranch.branches[b].prefix; //Get the leading character of the current branch

			if(currentBranch.branches[b].$ === true) { //If the current leaf ends a word, puts the word on the list
				predictedList.push(baseWord + prefix);
			}

			//Recursively calls the function, passing the forking branches as parameter
			var predictedWords = _exploreBranch(baseWord + prefix, currentBranch.branches[b]);

			predictedList = predictedList.concat(predictedWords);

		}
		return predictedList;
	};

	/**
	 * Add a new word to the tree
	 * @param {String} word Word to be added to the tree
	 */
	 this.addWord = function(word) {
	 	
		//Cases:
		//	1: current node prefix == word to add
		//		
		//	2: word begins with current node prefix to add
		//		
		//	3: current node prefix begins with part of or whole word to add 
		//	
		//	4: current node prefix intersection with word == empty

		var branch = root;
		var stopSearchOnCurrentBranch = false;

		while(!stopSearchOnCurrentBranch) {
			var wordContainsThePrefix = false;
			var isCase3 = false;


			//Looks for how branch it should follow
			for(var b in branch.branches) {
				//Case 1:
				if(branch.branches[b].prefix === word) {
					branch.branches[b].$ = true;
					return;
				}

				//Case 2:
				//Cuts the word and goes to the next branch
				if(word.indexOf(branch.branches[b].prefix) === 0) {
					wordContainsThePrefix = true;
					word = word.substring(branch.branches[b].prefix.length);
					branch = branch.branches[b];
					break;
				}

				//Case 3
				for(var i = 0; i <= word.length - 1; i++) {
					//Cuts the word starting from the end,
					//so it "merges" words that just begin equal between them
					var cutWord = word.substring(0, word.length-i);

					var restPrefix = word.substring(word.length-i);

					if(branch.branches[b].prefix.indexOf(cutWord) === 0) {
						//The new node where the word is cut
						var newNode = {
							prefix : cutWord,
							branches : [],
							$ : (restPrefix.length === 0)
						};

						//The node that inherit the data from the old node
						//that was cut
						var inheritedNode = {
							prefix : branch.branches[b].prefix.substring(cutWord.length),
							branches : branch.branches[b].branches,
							$ : branch.branches[b].$
						};

						branch.branches[b] = newNode;
						branch.branches[b].branches.push(inheritedNode);

						//If the prefixes only begin equal, creates the new node
						//with the rest of the prefix
						if(restPrefix.length > 0) {
							var restNode = {
								prefix : restPrefix,
								branches : [],
								$ : true
							};

							branch.branches[b].branches.push(restNode);
						}

						stopSearchOnCurrentBranch = wordContainsThePrefix =  true;
						isCase3 = true;
						break;
					}
				}

				if(isCase3) {
					break;
				}


			}

			//Case 4:
			if(!wordContainsThePrefix) {
				var newNode = {
					prefix : word,
					branches : [],
					$ : true
				};

				branch.branches.push(newNode);
				stopSearchOnCurrentBranch = true;
			}
		}
	};

	/**
	 * Fetches the word list from an address
	 * @param  {String} path Path of a JSON file with an array called 'words' with the word list
	 * @return {Arrat}      Word list extracted from the given path
	 */
	var fetchWordList = function(path) {
		// var httpRequest = new XMLHttpRequest();
		var httpRequest;
		var words = [];

		try {
			// Firefox, Chrome, Opera, Safari
			httpRequest = new XMLHttpRequest();
		} catch (e){
			// Internet Explorer
			try {
				httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e) {
				try {
					httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
				} catch (e) {
					// The browser doesn't support AJAX
					return [];
				}
			}
		}

		httpRequest.onreadystatechange  = function(){
			if (httpRequest.readyState === 4) {

				var jsonData = JSON.parse(httpRequest.responseText);

				if(Array.isArray(jsonData.words)) {
					words = jsonData.words;
				}
				else {
					return [];
				}
				
			}
		}

		httpRequest.open('GET', path, false);
		httpRequest.send();

		return words;
	}

	/**
	 *	Starts the tree with the list of words
	 * 
	 * @constructor
	 */
	 var _init = function() {

	 	if(Array.isArray(_wordList)) {
			wordList = _wordList;
		}
		else if((typeof _wordList) === 'string') {
			wordList = fetchWordList(_wordList);
		}
		else {
			throw (typeof _wordList) + ' variable is not supported as data source';
		}

		// For each word in the list
		for(var _word_ in wordList) {

			var word = wordList[_word_]; //Get the current word to be added to the three

			self.addWord(word);
		}

	};

	//Calls the constructor
	_init();

	return this;
};