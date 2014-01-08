/**
 * TODO:
 * Case-insensitive
 */


/**
 * jsAutoSuggest constructor
 * @constructor
 * @param  {Element} _field 	The field to where the list will be attached
 * @param  {jsT9 or String} _tree Tree with the words or String with the path of a JSON file (see jsT9 documentation)
 * @param {Object} _cofig Object with custom settings
 */
 var jsAutoSuggest = function(_field, _tree, _config) {

 	var KeyCode = {
 		Backspace : 8,
    Enter : 13,
 		Shift : 16,
 		Ctrl : 17,
 		Alt : 18,
 		CapsLock : 20,
 		Escape : 27,
 		PageUp : 33,
 		PageDown : 34,
 		End : 35,
 		Home : 36,
 		ArrowLeft : 37,
 		ArrowUp : 38,
 		ArrowRight : 39,
 		ArrowDown : 40,
 		Delete : 46,
 		charA : 65,
 		charC : 67
 	};

 	var self = this;

 	var optionsList;

 	var tree;

 	//Check if the given field is a jQuery object,
	//if so, gets the plain object inside it.
	var field = (typeof _field.jquery !== 'undefined' ? _field.get(0) : _field);

	var config = {
		suggestionClass : '',
		hideOnChoose : true,
		fillOnChoose : true,
		hideOnClickOutside : true,
		debounce : false,
		debounceTime : 500,
		treeOptions : {},

		// callbacks
		select : function(){},
		create : function(){},
		show : function(){}
	};

  var classUtils = {
    addClass : function(element, className) {
      element.className += ' ' + className;   
    },
    removeClass : function(element, className) {
      var newClassName = ' ' + element.className + ' ';

      while(newClassName.indexOf(' ' + className + ' ') != -1) {
        newClassName = newClassName.replace(' ' + className + ' ', '');
      }

      element.className = newClassName;
    }
  };


	// Extends the config options
	(function(destination, source) {
		for (var property in source) {
			destination[property] = source[property];
		}
		return destination;
	})(config, _config);


	this.init = function() {
    if(jsT9 === undefined || typeof jsT9 !== 'function') {
      throw 'You didn\'t imported jsT9';
    }

		if(_tree instanceof jsT9) {
	 		tree = _tree;
	 	}
	 	else if((typeof _tree) === 'string') {
	 		tree = new jsT9(_tree, config.treeOptions);
	 	}
	 	else {
	 		throw (typeof _tree) + ' is not supported as data source';
	 	}


		var rootElement = document.body.childNodes[0];
		optionsList =  document.createElement('div');
		optionsList.id = 'jsAutoSuggestList';
		document.body.insertBefore(optionsList, rootElement);

		field.addEventListener('keyup', _keydown, false);

		if (config.hideOnClickOutside) {
			document.addEventListener('click', self.hide, false);
		}

		//Creates the "debounced" version of the show method (not the callback)
		if (config.debounce) {

			this.show = (function(fn, delay) {

				var debouncedFn = function() {
					var args = arguments;
					var context = this;

					if(debouncedFn.timeout) {
						clearTimeout(debouncedFn.timeout);
					}

					debouncedFn.timeout = setTimeout(function() {
						fn.apply(context, args);
					}, delay);

				};

				return debouncedFn;

			})(this.show, config.debounceTime);
		}

	};

	/**
	 * Show the suggestions list for the passed text (if any) or the current content of the field.
	 * @param  {String} text Text that is going to be completed. If this parameter is ignored, it will be set as the current content of the field.
	 */
	 this.show = function(text) {
	 	optionsList.innerHTML = '';
	 	self.hide();

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
        var suggestionList = _createSuggestionList(result);
        var length = suggestionList.length;

        for(var i = 0; i < length; i++) {
          optionsList.appendChild(suggestionList[i]);
        }

				config.show();
				_show();
			}
		}
	};

	/**
	 * Hides the suggestions list
	 */
	 this.hide = function() {
	 	optionsList.style.display = 'none';
	 };


	/**
	 * Creates the list of suggestions
	 * @param  {Array} predictions 	The words that got to be part of the list
	 * @return {Array}              Array of options elements
	 */
	 var _createSuggestionList = function(predictions) {
    var options = [];

	 	for (var _op_ in predictions) {
	 		var op = predictions[_op_];

	 		var option = _createSuggestion(op, _op_);
	 		options.push(option);
	 		config.create(option);
	 	}

	 	return options;
	 };


	/**
	 * Creates one option for the suggestion list
	 * @param  {String} word  The content of the option
	 * @return {Element}       Clickable option
	 */
	 var _createSuggestion = function(term, index) {
	 	var option = document.createElement('div');
	 	option.className = 'jsAutoSuggestOption';
    classUtils.addClass(option, config.suggestionClass);

    option.setAttribute('data-index', index);

	 	option.textContent = term;
	 	option.addEventListener('mousedown', function(e) {
	 		_select(option);

			// Stops the click propagation,
			// so it doesn't close when clicks on some option
			e.stopPropagation();
		}, false);

    option.addEventListener('mouseover', function(e) {
      var selectedOption = optionsList.getElementsByClassName('selected')[0];
      if(!(selectedOption === undefined)) {
        classUtils.removeClass(selectedOption, 'selected');
      }

      classUtils.addClass(option, 'selected');

    }, false);

    option.addEventListener('mouseout', function(e) {
      classUtils.removeClass(option, 'selected');
    }, false);

	 	return option;
	 };

	/**
	 * Positions the list right below the field.
	 */
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
   * Reacts to selecting some option
   * @param  {Element} option The option selected
   */
  var _select = function(option) {
    config.select(option.textContent);

    if(config.fillOnChoose) {
      field.value = option.textContent;
    }

    if (config.hideOnChoose) {
      self.hide();
    } else {
      self.show(textContent);
    }
  }	

	/**
	 * Reacts to keydown into the field
	 * @param  {Event} e The event of the keyboard
	 */
	 var _keydown = function(e) {

	 	if(!field.value.length > 0) {
	 		self.hide();
      return;
    }

    var selectedOption;
    var key = e.keyCode || e.charCode;

		if (key == KeyCode.Escape) {
			self.hide();
		}
    else if(key === KeyCode.Enter) {
      //If there's some option selected, use it
      //Otherwise, let the default happen
      selectedOption = optionsList.getElementsByClassName('selected')[0];
      if(!(selectedOption === undefined)) {
        _select(selectedOption);
        e.preventDefault();
      }
    }
		else if((key === KeyCode.ArrowUp || key === KeyCode.ArrowDown) && optionsList.style.display !== 'none') {
      var direction = (key === KeyCode.ArrowUp ? -1 : 1);
			selectedOption = optionsList.getElementsByClassName('selected')[0];

      //If an option is already selected, moves the cursor
      //Otherwise, select the first option
      if(!(selectedOption === undefined)) {
        var options = optionsList.childNodes;

        var newSelectedIndex = ((parseInt(selectedOption.getAttribute('data-index')) + direction));
        newSelectedIndex = (newSelectedIndex >= 0 ? newSelectedIndex : options.length - 1);
        newSelectedIndex = newSelectedIndex % options.length;

        classUtils.removeClass(selectedOption, 'selected');
        classUtils.addClass(options[newSelectedIndex], 'selected');
      } else {
        classUtils.addClass(optionsList.getElementsByClassName('jsAutoSuggestOption')[0], 'selected');
      }
		}
		else if(!(key === KeyCode.Ctrl 
			|| key === KeyCode.Shift
			|| key === KeyCode.Alt
			|| key === KeyCode.CapsLock
			|| key === KeyCode.ArrowRight
			|| key === KeyCode.ArrowLeft
			|| key === KeyCode.PageDown
			|| key === KeyCode.PageUp
			|| key === KeyCode.Home
			|| key === KeyCode.End
			|| (e.ctrlKey && (key === KeyCode.charA || key === KeyCode.charC))
			)) {
			self.show(field.value);
		}
	};

	return this;
}
