/**
 * Delta-correct times
 *
 * Allows time calculations that are calculated against
 * the FPS. This means that you can use things like
 * "100ms" and it will be accurate.
 */

var Time = window.Time || {};
(function() {
	// Holds a list of type/conversion functions
	var timeConversion = {
		"s": function(fps) { return fps; },
		"ms": function(fps) { return fps / 1000; },
		"f": function(fps) { return 1; }
	};
	
	// Represents a 'segment' that has a specific type
	function TimeSegment(str) {
		this.isNegative = false;
		
		var parsedNumber = parseFloat(str);
		if (isNaN(parsedNumber)) throw new Error("The time specified is not in an acceptable format: " + str);
		
		this.number = parsedNumber;
		if (typeof str === "string") {
				numberLength = String(parsedNumber).length;
				numberType = str.slice(numberLength);
			
			if (!(numberType in timeConversion)) throw new Error("The time type specified does not exist: " + numberType);
			
			this.type = numberType;
		} else {
			this.type = "ms";
		}
	}
	
	// Negates the segment
	TimeSegment.prototype.negate = function() {
		this.number *= -1;
	}
	
	// Converts the segment to a number of frames
	TimeSegment.prototype.toFrames = function(fps) {
		var multiplier = timeConversion[this.type](fps);
		return this.number * multiplier;
	}
	
	// Allows for comparisons using normal Javascript (e.g. a > b, etc)
	TimeSegment.prototype.valueOf = TimeSegment.prototype.toFrames;
	
	// Represents an amount of time
	Time = function(str) {
		this.pieces = [];
		
		if (typeof str !== "undefined") {
			if (str instanceof Time) {
				this.pieces = str.pieces.slice(0);
			} else this.add(str);
		}
	}
	
	// Adds an amount of time, different types are supported
	Time.prototype.add = function(str) {
		this.pieces.push(new TimeSegment(str));
	}
	
	// Subtracts an amount of time, different types are supported
	Time.prototype.subtract = function(str) {
		this.pieces.push((new TimeSegment(str)).negate());
	}
	
	// Multiplies the time by a certain number
	Time.prototype.multiply = function(val) {
		for (var i in this.pieces) {
			this.pieces[i].number *= val;
		}
	}
	
	// Divides the time by a certain number
	Time.prototype.divide = function(val) {
		for (var i in this.pieces) {
			this.pieces[i].number /= val;
		}
	}
	
	// Converts the time to a frame count
	Time.prototype.toFrames = function(fps) {
		if (typeof fps === "undefined") fps = Game.FPS;
		
		var result = 0;
		for (var i in this.pieces) {
			result += this.pieces[i].toFrames(fps);
		}
		return result;
	}
	
	// Allows comparisons using normal Javascript (e.g. a > b, etc)
	Time.prototype.valueOf = Time.prototype.toFrames;
	
	// Create comparison functions on the prototypes
	var comparisons = {
		"greaterThan": function(a, b) { return a > b; },
		"gte": function(a, b) { return a >= b; },
		"lessThan": function(a, b) { return a < b; },
		"lte": function(a, b) { return a <= b; },
		"equalTo": function(a, b) { return a === b; }
	};
	
	for (var name in comparisons) {
		var comparisonFunc = comparisons[name];
		Time.prototype[name] = function(othertime, fps) {
			othertime = new Time(othertime);
			
			var myframes = this.toFrames(fps),
				otherframes = othertime.toFrames(fps);
			
			return comparisons[name](myframes, otherframes);
		}
	}
	
	Time.second = new Time("1s");
}());