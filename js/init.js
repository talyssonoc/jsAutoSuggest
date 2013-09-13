var words = ['Lorem', 
	'ipsum', 
	'dolor', 
	'sit', 
	'amet', 
	'consectetur', 
	'adipisicing', 
	'elit', 
	'sed', 
	'do', 
	'eiusmod', 
	'tempor', 
	'incididunt', 
	'ut', 
	'labore', 
	'et', 
	'dolore', 
	'magna', 
	'aliqua', 
	'Ut', 
	'enim', 
	'ad', 
	'minim', 
	'veniam', 
	'quis', 
	'nostrud', 
	'exercitation', 
	'ullamco', 
	'laboris', 
	'nisi', 
	'aliquip', 
	'ex', 
	'ea', 
	'commodo', 
	'consequat', 
	'Duis', 
	'aute', 
	'irure', 
	'in', 
	'reprehenderit', 
	'voluptate', 
	'velit', 
	'esse', 
	'cillum', 
	'eu', 
	'fugiat', 
	'nulla', 
	'pariatur', 
	'Excepteur', 
	'sint', 
	'occaecat', 
	'cupidatat', 
	'non', 
	'proident', 
	'sunt', 
	'culpa', 
	'qui', 
	'officia', 
	'deserunt', 
	'mollit', 
	'anim', 
	'id', 
	'est', 
	'laborum'];

var tree = new T9(words, {maxAmount : 15});
window.onload = function() {
	var field = document.getElementById('inField');
	var c = {
		select : function(w) {
			alert('You clicked at: ' + w);
		},
		suggestionClass : 'test',
		create : function(s) {
			// console.log(s.textContent);
			hideWhenChoose : false
		}
	};
	var autoSuggest = new jsAutoSuggest(field, tree, c);
	autoSuggest.init();
};