/**
 * Keyboard Handler
 *
 * Handles key presses
 */

var Keyboard = window.Keyboard || {};
(function() {
	var presses = {};
	
	window.addEventListener('load', function() {
		// Find key presses
		document.addEventListener('keydown', function(e) {
			var press = e.key || e.which || e.keyCode;
			Keyboard.press(press);
		});
		document.addEventListener('keyup', function(e) {
			var press = e.key || e.which || e.keyCode;
			Keyboard.release(press);
		});
	});
	
	// Find if a key is pressed
	Keyboard.pressed = function(code) {
		code = toCode(code);
		
		if (!(code in presses)) return false;
		else return presses[code];
	};
	
	// 'Press' a key
	Keyboard.press = function(code) {
		code = toCode(code);
		presses[code] = true;
	};
	
	// 'Release' a key
	Keyboard.release = function(code) {
		code = toCode(code);
		presses[code] = false;
	};
	
	function toCode(code) {
		if (typeof code === 'string') return code.charCodeAt(0);
		return code;
	}
}());