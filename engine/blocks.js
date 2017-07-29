/**
 * //RUN Block List
 *
 * A set of blocks
 */

var Blocks = window.Blocks || {};

(function() {
	// Creates a block constructor with set properties
	Blocks.create = function(name) {	
		var img = new Image();
		img.src = "images/air.png";
		
		// Default properties
		var properties = {
			"name": name || false,
			"image": img,
			"enableCollision": false,
			"collisionMode": "normal",
			"size": new Size(64, 64)
		};
		var flags = {}, collisionFlags = {};
		
		// Constructor for the block
		var constructor = function(position) {
			this.position = position || new Position(0, 0);
			
			for (var name in flags) this[name] = flags[name];
			
			this.name = properties["name"];
			this.direction = new Position(0, 0);
			this.rotationSpeed = 0;
		}
		
		// Functions to process properties
		var propertyTypes = {
			"name": function(n) { return n; },
			"image": function(n) {
				var img = new Image();
				img.src = "images/" + n;
				return img;
			},
			"enableCollision": function() { return true; },
			"collisionMode": function(n) { return n; },
			"size": function(n) { return n; }
		};
		
		// Add functions for each property
		for (var pn in propertyTypes) { (function() {
			var propertyName = pn,
				propertyGetter = propertyTypes[propertyName];
			
			constructor[propertyName] = function(n) {
				properties[propertyName] = propertyGetter(n);
				return constructor;
			}
		}()); }
		
		// Sets a flag to be set on the new object
		constructor.setFlag = function(flag, value) {
			flags[flag] = value;
			return this;
		}
		
		// Sets a collision flag
		constructor.collisionFlag = function(flag, value) {
			collisionFlags[flag] = value;
			return this;
		}
		
		// Get properties assigned to the block constructor
		constructor.getProperties = function() { return properties; }
		
		// Render the block
		constructor.prototype.draw = function(ctx) {
			var pos = this.position.add(Renderer.offset);
			
			ctx.save();
			if (this.rotation) {
				ctx.translate(pos.x, pos.y);
				ctx.rotate(this.rotation * (Math.PI / 180));
				pos = new Position(-32, -32);
			}
			
			ctx.drawImage(properties["image"], pos.x, pos.y);
			ctx.restore();
		}
		
		// Update the block
		constructor.prototype.update = function(delta) {
			this.position.x += this.direction.x;
			this.position.y += this.direction.y;
			this.rotation += this.rotationSpeed;
		}
		
		// Find if the block is colliding with something
		constructor.prototype.isColliding = function(pos, size) {
			var result = {"x": false, "y": false, "flags": {}};
			if (!properties.enableCollision) return result;
			
			var eltTopLeftPos = pos,
				eltBottomRightPos = eltTopLeftPos.add(size.width, size.height),
				blockTopLeftPos = this.position,
				blockBottomRightPos = this.position.add(properties["size"].width, properties["size"].height);
			
			
			
			var firstPoint = blockTopLeftPos.x > eltTopLeftPos.x && blockTopLeftPos.y > eltTopLeftPos.y && blockTopLeftPos.x < eltBottomRightPos.x && blockTopLeftPos.y < eltBottomRightPos.y,
				secondPoint = blockBottomRightPos.x > eltTopLeftPos.x && blockBottomRightPos.y > eltTopLeftPos.y && blockBottomRightPos.x < eltBottomRightPos.x && blockBottomRightPos.y < eltBottomRightPos.y;
			
			if (!firstPoint && !secondPoint) return result;
			
			var bottomCollision = blockBottomRightPos.y - eltTopLeftPos.y,
				topCollision = eltBottomRightPos.y - blockTopLeftPos.y,
				leftCollision = eltBottomRightPos.x - blockTopLeftPos.x,
				rightCollision = blockBottomRightPos.x - eltTopLeftPos.x;
			
			if (topCollision < Math.min(bottomCollision, leftCollision, rightCollision) || bottomCollision < Math.min(topCollision, leftCollision, rightCollision)) {
				result.y = properties["collisionMode"] !== "flipped" ? blockTopLeftPos.y - size.height : blockBottomRightPos.y;
			} else if (leftCollision < Math.min(bottomCollision, topCollision, rightCollision)) result.x = blockTopLeftPos.x;
			
			result.flags = collisionFlags;
			
			return result;
		}
		
		// Return the constructor
		return constructor;
	}
	
	
	// BLOCK TYPES //	
	Blocks.air = Blocks.create("Air").image("air.png");
	Blocks.grass = Blocks.create("Grass").image("grass.png").enableCollision();
	Blocks.dirt = Blocks.create("Dirt").image("dirt.png").enableCollision();
	Blocks.spike = Blocks.create("Spike").image("spike.png").enableCollision().collisionFlag("dead", true);
	
	Blocks.flippedGrass = Blocks.create("FlippedGrass").image("flipped_grass.png").enableCollision().collisionMode("flipped");
	Blocks.flippedDirt = Blocks.create("FlippedDirt").image("flipped_dirt.png").enableCollision().collisionMode("flipped");
	Blocks.flippedSpike = Blocks.create("FlippedSpike").image("flipped_spike.png").enableCollision().collisionMode("flipped").collisionFlag("dead", true); 
}());