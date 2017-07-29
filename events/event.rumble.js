// Shakes the screen vertically
// Events.play("rumble", size, reduction, totalLength, wavelength)
Events.add("rumble", function(size, reduce, length, speed) {
	if (typeof size === "undefined") size = 20;
	if (typeof reduce === "undefined") reduce = 0.01;
	if (typeof speed === "undefined") speed = "100ms";
	
	this.currentSize = size;
	this.sizeDivisor = reduce + 1;
	this.direction = 1;
	this.length = length || 0;
	this.currentCount = 0;
	
	this.every(speed, function() {	
		var movement = this.currentSize * this.direction;
		if (this.length > 0 && this.currentCount > this.length) movement = 0;
		
		console.log("rumble");
		Renderer.offset.y = movement;
		
		if (movement < 0.1 && movement > -0.1) {
			Renderer.offset.y = 0;
			return false;
		}
		
		this.direction *= -1;
		this.currentSize /= this.sizeDivisor;
		this.currentCount++;
		return true;
	});
});