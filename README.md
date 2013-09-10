jsAutoSuggest
=============

Autosuggest JavaScript tool using [jsT9](https://github.com/talyssonoc/jsT9 "jsT9")

Usage
=====

1. Create a [jsT9](https://github.com/talyssonoc/jsT9 "jsT9") tree with the words
2. Create a new jsAutoSuggest object, passing the field from where the input will be taken and where the suggestion box will be appended, the tree, and a custom settings object if needed (the settings documentation is in the next section).
3. Run the method init() of jsAutoSuggest.

For more info, see the example.

Custom settings
===============

* `select`: A function (that receiva a word as argument) that runs after the user clicks an suggestion.
* `suggestionClass`: String with one or more classes (separated with spaces) to any of the options of the suggestion menu.
* `create`: Function (that receive a suggestion HTML element as argument) that will be applied to any of the suggestions of the menu.
* `hideWhenChoose`: Hides the suggestion menu when the user clicks on some of them. (Default: false).
* `hideWhenClickOutside`: Hides the suggestion menu when the user clicks out of it. (Default: true).

API
===

* `init`: Start the jsAutoSuggest use.
* `show(text)`: Show the list of suggestions for the given text. If text is not passed, it takes the current field value.
* `hide`: Hides the list of suggestions.