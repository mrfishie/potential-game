/**
 * Event Manager system
 */

var Events = window.Events || {};
(function() {
	var itms = {};
	
	// Adds a new event
	Events.add = function(name, start) {
		var evt = new Event();
		evt.at(0, start);
		itms[name] = evt;
		return evt;
	}
	
	// Runs an event
	Events.play = function(name) {	
		var params = [].slice.call(arguments, 1),
			evt = itms[name];
		if (!evt) throw new Error("The specified event (" + name + ") does not exist");
		
		for (var i = 0; i < evt.cueList.length; i++) {
			evt.cueList[i].hasRun = false;
		}
		
		evt.currentTime = new Time(0);
		evt.run(params);
	}
	
	// Stops an event
	Events.stop = function(name) {
		var params = [].slice.call(arguments, 1),
			evt = itms[name];
		if (!evt) throw new Error("The specified event (" + name + ") does not exist");
		
		for (var i = 0; i < evt.cueList.length; i++) {
			evt.cueList[i].hasRun = true;
		}
	}
	
	// Represents an event object
	function Event() {
		this.cueList = [];
		this.onComplete = [];
		
		this.currentTime = new Time(0);
	}
	
	// Cues a function at a specific time
	Event.prototype.at = function(time, func) {
		time = new Time(time);
		
		this.cueList.push(new EventCue(func, time));
		return this;
	}
	
	// Cues a function a specific time after the previous one
	Event.prototype.then = function(time, func) {
		var prevTime = this.cueList[this.cueList.length - 1].time,
			waitTime = new Time(time);
		
		waitTime.add(prevTime);
		this.at(waitTime, func);
	}
	
	// Cues a function to run every so often
	Event.prototype.every = function(time, func) {	
		var ctime = new Time(0), enabled = true;
		Loops.addCallback("update", function(delta) {
			if (!enabled) return;
			ctime.add(delta);
			
			if (ctime > time) {
				var result = func.apply(this, arguments);
				if (result === false) enabled = false;
				ctime = new Time(0);
			}
		});
	}
	
	// Cues a function to be run when the cuelist ends
	Event.prototype.end = function(func) {
		this.onComplete.push(func);
	}
	
	// Runs the cuelist
	Event.prototype.run = function(params) {
		var self = this,
			cuelist = this.cueList,
			self = this;
		
		Loops.addCallback("update", function(delta) {
			if (Game.paused) return true;
			
			self.currentTime.add(delta);
			
			var anyLeft = false;
			for (var i = 0; i < cuelist.length; i++) {
				var cue = cuelist[i],
					cueTime = cue.time;
				
				if (!cue.hasRun && self.currentTime.valueOf() > cueTime.valueOf()) {
					cue.func.apply(self, params);
					
					cue.hasRun = true;
				}
				if (!cue.hasRun) anyLeft = true;
			}
			if (anyLeft) {
				return true;
			}
			return false;
		});
	}
	
	// Represents a cue in an event
	function EventCue(func, time) {
		this.time = new Time(time || 0);
		this.func = func;
		this.hasRun = false;
	}
}());