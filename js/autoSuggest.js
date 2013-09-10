/**
 * TODO:
 * 		Max number of options to show
 * 		Case-insensitive
 */


/**
 * jsAutoSuggest constructor
 * @constructor
 * @param  {Element} inputField       The field to where the list will be attached
 * @param  {Array} words            jsT9 tree with the words
 * @param  {Function(word)} callbackFunction Callback function called when the user choses an option
 */
var jsAutoSuggest = function(inputField, words, _config) {
	var tree = words;

	//Tests if it's a jQuery object
	var field = (typeof inputField.jquery !== 'undefined' ? inputField.get(0) : inputField);

	var optionsList = document.createElement('div');
	optionsList.id = 'jsAutoSuggestList';


	var config = {
		callback : function(){},
		suggestionClass : '',
		applyToSuggestion : function(){},
		hideWhenChoose : false,
		hideWhenClickOutside : true
	};

	//Extends the config options
	(function(destination, source) {
		for (var property in source)
			destination[property] = source[property];
		return destination;
	})(config, _config);

	var _ = this;

	/**
	 * Show the list of suggestions
	 */
	 this.showSuggestions = function(newInput) {
	 	//Hides the list
	 	optionsList.style.display = 'none';

	 	//If the input was not changed, uses the current value on the field
	 	if(typeof newInput === 'undefined')
	 		newInput = field.value;
	 	else
	 		field.value = newInput; //Else, puts the new value in the field

	 	if(newInput !== '') {
	 		var predictions = tree.predict(newInput);

	 		if(predictions.length > 0) {

	 			optionsList.innerHTML = '';

	 			optionsList.appendChild(createSuggestionsList(predictions));

	 			showList();

	 		}
	 		else {
	 			//Remove all the list itens
	 			optionsList.innerHTML = '';
	 		}
	 	}
	 	else {
	 		//Remove all the list itens
	 		optionsList.innerHTML = '';
	 	}
	 		
	 };


	 /**
	  * Hide the list of suggestions
	  */
	 this.hideSuggestions = function() {
	 	optionsList.style.display = 'none';
	 };


	/**
	 * Creates the list of suggestions
	 * @param  {Array} predictions The words that got to be part of the list
	 * @return {Element}             Element with the clickable options
	 */
	 var createSuggestionsList = function(predictions) {
	 	var optionsContent = document.createElement('div');

	 	for(var _op_ in predictions) {
	 		var op = predictions[_op_];

	 		var option = createSingleOption(op);
	 		optionsContent.appendChild(option);
	 		config.applyToSuggestion(option);

	 	}

	 	return optionsContent;
	 };


	/**
	 * Creates one option for the suggestion list
	 * @param  {String} word  The content of the option
	 * @return {Element}       Clickable option
	 */
	 var createSingleOption = function(word) {
	 	var option = document.createElement('div');
	 	option.className = 'jsAutoSuggestOption';
	 	option.className += ' ' + config.suggestionClass;

	 	option.textContent = word;

	 	option.addEventListener('mousedown', function(e) {
	 		config.callback(word); //Calls the callback function

	 		field.value = this.textContent;

	 		if(config.hideWhenChoose)
	 			_.hideSuggestions();
	 		else
	 			_.showSuggestions(field.value);

	 		e.stopPropagation(); //Pauses the click propagation, so it doesn't close when clicks on some option
	 	}, false);

	 	return option;
	 };


	 /**
	  * Positions the list of suggestions
	  */
	  var positionList = function() {
	  	
	  	var element = field;

	  	var offsetTop = 0, offsetLeft = 0;
	    do { //Gets the top and left position of where the list should be
	        offsetTop += element.offsetTop  || 0;
	        offsetLeft += element.offsetLeft || 0;
	        element = element.offsetParent;
	    } while(element);


		optionsList.style.left = offsetLeft + 'px';
	  	optionsList.style.top = (offsetTop + field.offsetHeight + 1) + 'px';

	    optionsList.style.width = field.offsetWidth + 'px';
	  };


	 /**
	  * Shows the list of suggestions
	  */
	  var showList = function() {
	  	positionList();

	  	optionsList.style.display = 'block';
	  	optionsList.style.marginRight = -optionsList.offsetWidth + 'px';
	  	optionsList.style.marginBottom = -optionsList.offsetHeight + 'px';
	  };

	  /**
	   * Reacts to keydown into the field
	   * @param  {Event} e The event of the keyboard
	   */
	  var keyDown = function(e) {
			var key = e.keyCode || e.charCode;

			if(key == 27) //Hides if click Escape
				_.hideSuggestions();
			else {
				_.showSuggestions(field.value);
			}

			// //Backspace = 8
			// //Delete = 46
			// 		if(key == 8 || key == 46 || String.fromCharCode(event.keyCode).match(/\w/)) {
			// 	console.log("Chamar");

			// _.showSuggestions(field.value);
			// }

			// console.log(key);
	  };

	  /**
	 * Initiates the jsAutoSuggest in the inputField
	 */
	 this.init = function() {

	 	positionList();
	  	document.body.insertBefore(optionsList, document.body.childNodes[0]);

	 	field.addEventListener('keyup', keyDown, false);
	 	field.addEventListener('change', keyDown, false);
 	
 		if(config.hideWhenClickOutside)
	 		document.addEventListener('click', _.hideSuggestions, false);

	 };

	 return this;
}