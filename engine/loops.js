/**
 * Loop Manager
 * 
 * Manages different game loops
 */

var Loops = window.Loops || {};
(function() {
	var loops = {},
		loopTypes = {};
	
	// Add a loop
	Loops.add = function(p) {
		var callbacks = [];
		if (p.callbacks) callbacks = p.callbacks;
		else if (p.callback) callbacks = [p.callback];
		
		var props = {
			"name": p.name,
			"type": p.type || "interval",
			"wait": p.wait || 0,
			"callbacks": callbacks,
			"running": false
		};
		loops[props.name] = props;
	};
	
	// Adds a callback to a loop
	Loops.addCallback = function(loop, func) {
		if (typeof loop !== "object") loop = loops[loop];
		if (!loop) throw new Error("The loop '" + loop + "' does not exist");
		
		loop.callbacks.push(func);
	};
	
	// Add a type of loop
	Loops.addType = function(orig) {
		var props = {
			"name": orig.name,
			"continue": orig.continue || function() { },
			"cancel": orig.cancel || function() { }
		};
		props["start"] = orig.start || orig.continue;
		
		loopTypes[props.name] = props;
	};
	
	// Start a loop
	Loops.start = function(name) {
		var loop = loops[name];
		if (!loop) throw new Error("The loop '" + name + "' does not exist");
		if (loop.running) throw new Error("The loop '" + name + "' is already running");
		
		var loopType = loopTypes[loop.type];
		if (!loopType) throw new Error("The loop type '" + loop.type + "' does not exist");
		
		var previousTime = window.performance.now();
		var callback = function() {
			var currentTime = window.performance.now(),
				delta = currentTime - previousTime,
				cont = true;
			
			loop.delta = delta;
			
			for (var i = 0; i < loop.callbacks.length; i++) {
				if (loop.callbacks[i](delta, loop.name) === false) {
					loop.callbacks.splice(i, 1);
					i--;
				}
			}
			
			previousTime = currentTime;
			
			if (loop.running) loopType.continue(callback, loop.wait);
			else {
				loopType.cancel(callback);
				loop.running = false;
			}
		};
		loopType.start(callback, loop.wait);
		
		loop.running = true;
	};
	
	// Gets the FPS for a specific loop
	Loops.getFps = function(name) {
		var loop = loops[name];
		if (!loop) throw new Error("The loop '" + name + "' does not exist");
		
		var lastDelta = loop.delta;
		return 1000 / lastDelta;
	};
	
	// Stop a loop
	Loops.stop = function(name) {
		var l = loops[name];
		if (!l) throw new Error("The loop '" + name + "' does not exist");
		if (!l.running) throw new Error("The loop '" + name + "' is already running");
		l.running = false;
	};
	
	// Create functions that do tasks on all loops
	var allFuncs = {"startAll": "start", "stopAll": "stop", "addAll": "addCallback"};
	for (var newfunc in allFuncs) { (function() {
		var oldfunc = allFuncs[newfunc];
		Loops[newfunc] = function() {
			for (var loop in loops) {
				var params = [].slice.call(arguments, 0);
				params.unshift(loop);
				
				Loops[oldfunc].apply(Loops, params);
			}
		}
	}()); }
	
	var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	
	// Add default loop types
	Loops.addType({
		"name": "refresh",
		"continue": function(callback, wait) {
			if (wait !== 0) {
				setTimeout(function() {
					raf(callback);
				}, wait);
			} else raf(callback);
		}
	});
	Loops.addType({
		"name": "timeout",
		"continue": function(callback, wait) {
			setTimeout(callback, wait);
		}
	});
	Loops.addType({
		"name": "interval",
		"start": function(callback, wait) {
			callback.intervalId = setInterval(callback, wait);
		},
		"cancel": function(callback) {
			clearInterval(callback.intervalId);
		}
	});
}());