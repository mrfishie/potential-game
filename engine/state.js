/**
 * State system
 *
 * Integrates with the loop manager to
 * provide states to each loop
 */

var States = window.States || {};
(function() {
	var states = {},
		loopFuncs = {},
		currentState = null;
	
	// Adds a state, or a handler to a state
	States.add = function(name, funcs, callback) {
		if (arguments.length > 2) {
			name = funcs;
			funcs = {};
			funcs[name] = [callback];
		}
		
		if (!states[name]) states[name] = {};
		var state = states[name];
		
		for (var loopName in funcs) {
			if (!state[loopName]) state[loopName] = [];
			if (typeof funcs[loopName] !== "objct") funcs[loopName] = [funcs[loopName]];
			
			for (var i = 0; i < funcs[loopName].length; i++) {
				state[loopName].push(funcs[loopName][i]);
			}
		}
	}
	
	// Changes to the specified state
	States.change = function(name) {
		var state = states[name];
		if (!state) throw new Error("The specified state '" + name + "' does not exist");
		
		if (loopFuncs.teardown) for (var i in loopFuncs.teardown) loopFuncs.teardown.call(loopFuncs);
		
		Renderer.popState();
		Renderer.pushState();
		
		if (state.setup) for (var i in state.setup) state.setup[i].call(state);
		loopFuncs = state;
		currentState = name;
	}
	
	// Gets the current state
	States.current = function() {
		return currentState;
	}
	
	// Sets up all loops
	States.setup = function() {
		Loops.addAll(function(delta, loopName) {
			if (loopName in loopFuncs) {
				var loops = loopFuncs[loopName];
				for (var i = 0; i < loops.length; i++) {
					loops[i].call(this, delta);
				}
			}
		});
	}
}());