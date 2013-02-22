/* When a non-control, printable command is recieved the length is found and then used to update the editPoints array
	
	the command is spliced into the output and then the output is split and then the output array and updated editPoints array can be pushed onto the history array.
*/
var MyApp = (function () {
$(document).ready(function () {
	
	var output = []; //holds the current output.
	var editPoints = [0]; //holds the current editPoints
	
	var keyCodes = [
		 192, 49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 109, 107, 8,
		 9,	   81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 219, 221, 220,
		 20,    65, 83, 68, 70, 71, 72, 74, 75, 76, 59, 222, 13,
		 16,     90, 88, 67, 86, 66, 78, 77, 188, 190, 191,    16, 
		                           32,
	];
	
	var defaultKeyMap = ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', 'equals', 'Bksp',
						'tab', 'q', 'w', ['superscript'], 'r', 't', 'y', 'u', 'i', 'o', '\\pi ', '[', ']', '\\backslash',
						'caps', 'a', ['sin'], 'd', ['fraction'], 'g', 'h', 'j', 'k', 'l', ';', '\'', 'enter',
						'shift', 'z', 'x', 'c', 'v', 'b', 'n', '\\times', ',', '.', '/', 'shift',
						'\\:'];
	
	var alphabetKeyMap = ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Bksp',
						'tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\backslash',
						'caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', 'enter',
						'shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift',
						'\\:'];
						
	var uppercaseAlphabetKeyMap = ['~', '!', '@', '\\#', '\\$', '%', '^', '&', '*', '(', ')', '_', '+', 'Bksp',
								   'tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|',
								   'caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '\"', 'enter',
									'shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?', 'shift',
									'\\:'];
	
	var greekKeyMap  =['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Bksp',
						'tab', 'q', 'w', 'e', 'r', '\\theta', 'y', 'u', 'i', 'o', '\\rho', '[', ']', '\\backslash',
						'caps', '\\alpha', '\\sigma', '\\Delta', '\\phi', '\\gamma', 'h', 'j', 'k', 'l', ';', '\'', 'enter',
						'shift', '\\zeta','\\chi', '\\gamma', '\\nu', '\\beta', '\\eta','m', ',', '.', '/', 'shift',
						'\\:'];
	
	//contains objects representing latex functions such as fraction, superscript etc and their keyboard symbols.
	var latexFunctions = {
		fraction : {
			symbol : '$\\frac{x}{y}$',
			inputSymbol : '\\frac{x}{y}',
			editPoints : ['6','9'],
		},
		superscript : {
			symbol : '$x^{y}$',
			inputSymbol : 'x^{y}',
			editPoints : ['0','3'],
		},
		sin : {
			symbol : '$\\sin{x}$',
			inputSymbol : '\\sin{x}',
			editPoints : ['5'],
		},
	};
	
	//Create a binding between the LaTeX commands and the keyboard keyCodes
	var keyCodeBindings = {};
	var loadedKeyMap = null;
	
	// Function to bind keystrokes to different symbols and changes the html symbols displayed on the onscreen keys	
	function loadKeyMap(keyMap){
		$.each(keyCodes, function(index, value){
			
			keyCodeBindings[value] = keyMap[index];  // fill keyCodeBindings object with the correct Latex commands for the keyMap that is being loaded.
		});
		//The following block of code is responsible for displaying the symbols on the keys of the onscreen keyboard.
		var i = 0;
		$("#keyboard > li").each(function(){ //iterates through each list item in keyboard element.
			if(typeof(keyMap[i]) === typeof('string')){ // this is for the case when the entry in keyMap is just a string, ie not for the case when the symbol represents an object containing a function such as superscripting or fractions, matrices etc.
				if (keyMap[i].indexOf("\\") !== 0){   // if keyMap symbol doesnt start with backslashes then just display it on the key
					$(this).html(keyMap[i]);
				}
				else {
					$(this).html('$' + keyMap[i] + '$'); //if it does have backslashes then wrap it in dollar signs so mathjax will pick it up.
					MathJax.Hub.Queue(["Typeset", MathJax.Hub, "keyboard"]);
				};
			}
			else { //case for if the keyMap entry is a reference to a function for fractions, superscripting etc.
				var functionName = keyMap[i][0];
				$(this).html(latexFunctions[functionName].symbol);
			};
			i++;
		});
		loadedKeyMap = keyMap;
	}; // endof loadKeyMap function
	
	loadKeyMap(defaultKeyMap);
	
	//helper function
	var isDefaultArg = function(){
		var answer = false;
		if(typeof(editPoints[0]) === 'string'){
			answer = true;
		};
		return answer;
	};
		
	function displayOutput (outputString) {
		if (outputString === ''){
			outputString = ' ';
		};
		outputString = '$' + outputString + '$';
		$('.display').html(outputString); 
		MathJax.Hub.Queue(["Typeset",MathJax.Hub, "output"]);
	};
	
	//Processes keystrokes
	$(document).keydown(function(event) {
		event.preventDefault();
		var keyPressed = event.keyCode;
		console.log(keyPressed);
		var keyID = '#' + keyPressed;
		var command;
		if (keyPressed in keyCodeBindings && !event.shiftKey) {
			command = keyCodeBindings[keyPressed];
			$(keyID).addClass('keyPressColour');
			coreLogic.processInput(command);    // pass command to the main processing function
		};
		//Each press of the shift button toggles between upper and lower case of a keyMap. At the moment it is just implemented for the alphabet keymaps.
		if(event.shiftKey){
			if(loadedKeyMap === alphabetKeyMap){
				loadKeyMap(uppercaseAlphabetKeyMap);
			}
			else if(loadedKeyMap === uppercaseAlphabetKeyMap){
				loadKeyMap(alphabetKeyMap);
			};
		};
		// load default keymap
		if (keyPressed === 49 && event.shiftKey) { //if user presses 'shift + 1' then load the default keyMap
			loadKeyMap(defaultKeyMap);
		};
		// load alphabet keymap
		if (keyPressed === 50 && event.shiftKey) {
			loadKeyMap(alphabetKeyMap);
		};
		// load greek keymap
		if (keyPressed === 51 && event.shiftKey) {
			loadKeyMap(greekKeyMap);
		};
	}); //endof keydown function.
	
	// removes the css class for the html corresponding to the pressed button
	$(document).keyup(function(event) {
		var keyPressed = event.keyCode;
		var keyID = '#' + keyPressed;
		$(keyID).removeClass('keyPressColour');
	});
	
	// todo: Using keypress should improve cross browser compatibility
	$(document).keypress(function(event) {
		var x = String.fromCharCode(event.charCode);
		console.log(x);
	});
	
	
	//module for history of outputs. Used for deletions.
	var history = (function(){
		var outputHistory = [];
		var editPointsHistory = [];
		function save(){
			var i;  //for loop var
			if (typeof output === 'object'){
					output = output.join('');
				};
			outputHistory[outputHistory.length] = output;
			output = output.split('');
			editPointsHistory[editPointsHistory.length] = editPoints.slice(0);
			
		};
		function load(){
			if (outputHistory.length > 0){
				outputHistory.pop();
				editPointsHistory.pop();
				if (outputHistory.length > 0){
					output = outputHistory[outputHistory.length-1];
					output = output.split('');
					editPoints = editPointsHistory[editPointsHistory.length-1].slice(0);
				}
				else{
					output = '';
					output = output.split('');
					editPoints[0] = 0;
				};
			};
		};
		//public interface for module.
		return {	
			save : save,
			load : load,
		};
	})(); //endof history module
	
	//module for processing user commands, contains the rules for modifying the output and editPoints arrays. Passes results to displayOutput.
	var coreLogic = (function(){
		return{
			processInput : function(input){
				var i;
				var inputSymbol = input;
				var inputEditPoints = null;
				var lengthOfInput;
				if(typeof(input) !== 'string'){  //if input a latex function then copy the symbol and edit points
					inputSymbol = latexFunctions[input[0]].inputSymbol; 
					inputEditPoints = latexFunctions[input[0]].editPoints.slice(0);
				};
				if(input === 'Bksp'){  //deletions
					history.load();
				}
				if(input === 'enter'){
					//remove first edit point from editPoints array
					editPoints.shift();
					if(typeof(editPoints[0]) === 'undefined'){ //If editPoints is now empty then add new edit point to end of output string.
						editPoints[0] = output.length;
					};
					history.save();
				};
				if(input !== 'enter' && input !== 'Bksp'){
					
					lengthOfInput = inputSymbol.length;
					//console.log('lengthofInput = ' + lengthOfInput);
														
					if(typeof(input) === 'string'){        // if input is just a string...
																	
						if(isDefaultArg()){     //if edit point is occupied by a default character which should be overwritten by  user input...
							console.log('edit point is occupied by a default arg');
							output.splice(editPoints[0],1,inputSymbol); //insert input symbol into output
							
							editPoints[0] = parseInt(editPoints[0]);  //change the edit point to non default type (ie not a string)
							editPoints[0] = editPoints[0]+lengthOfInput; //move the edit point to where the newly spliced input symbol ends in the output.
							if(editPoints.length > 1){   //if more entries in the editPoints array then move them the correct amount (length of input symbol - length of replaced default arg (which at the mo is always '1')).
								for(i=1; i < editPoints.length; i++){
									if(typeof editPoints[i] === 'string'){
										editPoints[i] = parseInt(editPoints[i]) + lengthOfInput - 1;
										editPoints[i] = editPoints[i].toString();
									}
									else{
										editPoints[i] = editPoints[i] + lengthOfInput - 1;
									};
								};
							};
						}
						else{    //if edit point is not occupied by a default character
							console.log('not a default arg');
																
							output.splice(editPoints[0],0,inputSymbol);
							for(i=0; i < editPoints.length; i++){
								if(typeof editPoints[i] === 'string'){
										editPoints[i] = parseInt(editPoints[i]) + lengthOfInput;
										editPoints[i] = editPoints[i].toString();
								}
								else{
									console.log('pharp!');
									editPoints[i] = editPoints[i] + lengthOfInput;
								};
							};
							//editPoints[0] = parseInt(editPoints[0]); // what this for?
						};
						
					}
					else{                           // if input is a 'LaTeX function'...
						

						for(i=0; i < inputEditPoints.length; i++){ //convert input edit points from string to num so can do arithmetic to them.
							inputEditPoints[i] = parseInt(inputEditPoints[i]) + parseInt(editPoints[0]);
							inputEditPoints[i] = inputEditPoints[i].toString();
						};
						
						if(typeof(editPoints[0]) === 'string'){ //if edit point occupied by default character
							console.log('*default arg edit point!*');
							output.splice(editPoints[0],1,inputSymbol);  //insert input symbol into output, replace default character.
							//console.log(output);
							editPoints[0] = parseInt(editPoints[0]) + lengthOfInput;
							
							for(i = 1; i < editPoints.length; i++){
								if(typeof editPoints[i] === 'string'){
									editPoints[i] = parseInt(editPoints[i]) + lengthOfInput - 1;
									editPoints[i] = editPoints[i].toString();
								}
								else{
									editPoints[i] = editPoints[i] + lengthOfInput - 1;
								};
							};
						}
						else{                                       //if not occupied...
							output.splice(editPoints[0],0,inputSymbol);
							//console.log(output);
							for(i = 0; i < editPoints.length; i++){
								if(typeof editPoints[i] === 'string'){
									editPoints[i] = parseInt(editPoints[i]) + lengthOfInput;
									editPoints[i] = editPoints[i].toString();
								}
								else{
									editPoints[i] = editPoints[i] + lengthOfInput;
								};
							};
						}
						
						//editPoints.shift(); //remove existing 'active' edit point
						
						for(i=inputEditPoints.length-1; i >= 0; i--){ //tack the new edit points onto the start of the editPoints array..
							
							editPoints.unshift(inputEditPoints[i]);
							//console.log('typeof of editPoints[0] = ' + typeof(editPoints[0]));
						};
					};
					history.save();
				};
				
				output = output.join('');
				console.log('output = ' + output);
				//console.log(output);
				//console.log('         ' + loopy);
				console.log('editPoints = '+ editPoints); 
				var loopy = [];
				var hold;
				for(i=0; i<editPoints.length; i++){
					loopy.push(typeof editPoints[i]);
				};
				console.log(loopy);
				//console.log('The number of elements in the output array is :', output.length);
				displayOutput(output);
				output = output.split('');
				//console.log('final output on pass...');
				//console.log(output);
			}, //endof coreLogic.processInput function
		};	
			
	})();  //endof coreLogic object/namespace
	
	});  //endof $(document).ready function
})();

	