/**
 * TODO:
 * Max number of options to show
 * Case-insensitive
 */


/**
 * jsAutoSuggest constructor
 * @constructor
 * @param  {Element} _field 	The field to where the list will be attached
 * @param  {Array} _tree jsT9 		Tree with the words
 * @param {Object} _cofig Object with custom settings
 */
var jsAutoSuggest = function(_field, _tree, _config) {
	
	var KB = {
		ESC : 27
	}

	var _ = this;

	var optionsList;

	var tree = _tree;
	
	//Check if the given field is a jQuery object,
	//if so, gets the plain object inside it.
	var field = (typeof _field.jquery !== 'undefined' ? _field.get(0) : _field);

	var config = {
		suggestionClass : '',
		hideWhenChoose : false,
		hideWhenClickOutside : true,

		// callbacks
		select : function(){},
		create : function(){}
	};


	// Extends the config options
	(function(destination, source) {
		for (var property in source) {
			destination[property] = source[property];
		}
		return destination;
	})(config, _config);


	this.init = function() {
		var rootElement = document.body.childNodes[0];
		optionsList =  document.createElement('div');
		optionsList.id = 'jsAutoSuggestList';
		document.body.insertBefore(optionsList, rootElement);

		// _positionList();

		field.addEventListener('keyup', _keydown, false);
		field.addEventListener('change', _keydown, false);
	
		if (config.hideWhenClickOutside) {
			document.addEventListener('click', _.hide, false);
		}

	};


	this.show = function(text) {
		optionsList.innerHTML = '';
		_.hide();

		// If the input was not changed,
		// uses the current value on the field,
		// otherwise uses the new value
		if (typeof text === 'undefined') {
			text = field.value;
		} else {
			field.value = text;
		}

		if (text !== '') {
			var result = tree.predict(text);

			if (result.length > 0) {
				optionsList.appendChild(_createSuggestionList(result));
				_show();
			}
		}	
	};


	this.hide = function() {
		optionsList.style.display = 'none';
	};


	/**
	 * Creates the list of suggestions
	 * @param  {Array} predictions 	The words that got to be part of the list
	 * @return {Element}            Element with clickable options
	 */
	var _createSuggestionList = function(predictions) {
		var optionsContent = document.createElement('div');

		for (var _op_ in predictions) {
			var op = predictions[_op_];

			var option = _createSuggestion(op);
			optionsContent.appendChild(option);
			config.create(option);
		}

		return optionsContent;
	};


	/**
	 * Creates one option for the suggestion list
	 * @param  {String} word  The content of the option
	 * @return {Element}       Clickable option
	 */
	var _createSuggestion = function(term) {
		var option = document.createElement('div');
		option.className = 'jsAutoSuggestOption';
		option.className += ' ' + config.suggestionClass;

		option.textContent = term;
		option.addEventListener('mousedown', function(e) {
			config.select(term);

			field.value = this.textContent;

			if (config.hideWhenChoose) {
				_.hide();
			} else {
				_.show(field.value);
			}

			// Pauses the click propagation,
			// so it doesn't close when clicks on some option
			e.stopPropagation();
		}, false);

		return option;
	};


	var _positionList = function() {
		var element = field;
		var offsetTop = 0, offsetLeft = 0;
		
		// Gets the top and left position of where the list should be
		do {
			offsetTop  += element.offsetTop  || 0;
			offsetLeft += element.offsetLeft || 0;
			element = element.offsetParent;
		} while (element);

		optionsList.style.left  = offsetLeft + 'px';
		optionsList.style.top   = (offsetTop + field.offsetHeight + 1) + 'px';
		optionsList.style.width = field.offsetWidth + 'px';
	};


	var _show = function() {
		_positionList();

		optionsList.style.display = 'block';
		optionsList.style.marginRight  = -optionsList.offsetWidth  + 'px';
		optionsList.style.marginBottom = -optionsList.offsetHeight + 'px';
	};
	

	/**
	 * Reacts to keydown into the field
	 * @param  {Event} e The event of the keyboard
	 */
	var _keydown = function(e) {
		var key = e.keyCode || e.charCode;

		if (key == KB.ESC) {
			_.hide();
		} else {
			_.show(field.value);
		}
	};

	return this;
}
