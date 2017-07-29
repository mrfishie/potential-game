/**
 * Game Renderer
 * 
 * A component-based renderer
 */

var Renderer = window.Renderer || {},
	Primitives = window.Primitives || {};

// Represents a size
var Size = function(width, height) {
	this.width = width;
	this.height = height;
};

// Represents a position
var Position = function(x, y) {
	this.x = x;
	this.y = y;
};

// Adds one position to another
Position.prototype.add = function(pos, y) {
	if (arguments.length > 1) pos = new Position(pos, y);
	return new Position(this.x + pos.x, this.y + pos.y);
};

// Multiplies a position by another
Position.prototype.multiply = function(pos, y) {
	if (arguments.length > 1) pos = new Position(pos, y);
	return new Position(this.x * pos.x, this.y * pos.y);
};

// Prepresents a color
var Color = function(red, green, blue) {
	this.red = red || 0;
	this.green = green || 0;
	this.blue = blue || 0;
};

Color.prototype.toString = function() {
	return "rgb(" + Math.floor(this.red * 255) + "," + Math.floor(this.green * 255) + "," + Math.floor(this.blue * 255) + ")";
};

(function() {
	var canvas = null,
		ctx = null,
		components = [[]],
		globalComponents = [];
	
	// Sets the canvas to render to
	Renderer.setCanvas = function(newcanvas) {
		canvas = newcanvas;
		ctx = canvas.getContext("2d");
	}
	
	// Adds a component state
	Renderer.pushState = function() {
		components.push([]);
	}
	
	// Removes a component state
	Renderer.popState = function() {
		components.pop();
	}
	
	// Sets up the renderer
	Renderer.setup = function() {
		Loops.addCallback("render", function(delta) {
			//canvas.width = canvas.width;
			canvas.width = Game.width;
			canvas.height = Game.height;
			
			ctx.globalAlpha = Renderer.globalAlpha;
			
			var cmpts = components[components.length - 1].concat(globalComponents);
			for (var i in cmpts) {
				ctx.save();
				if (typeof cmpts[i].alpha !== "undefined") ctx.globalAlpha = cmpts[i].alpha;
				cmpts[i].draw.call(cmpts[i], ctx, delta);
				ctx.restore();
			}
		});
		Loops.addCallback("update", function() {
			var cmpts = components[components.length - 1].concat(globalComponents);
			for (var i in cmpts) {
				cmpts[i].update.apply(cmpts[i], arguments);
			}
		});
	}
	
	// Adds a component
	Renderer.add = function(component) {
		var cmpts = components[components.length - 1];
		if (cmpts.indexOf(component) > -1) return false;
		
		cmpts.push(component);
		return true;
	}
	
	// Adds a 'global' component
	Renderer.addGlobal = function(component) {
		if (globalComponents.indexOf(component) > -1) return false;
		
		globalComponents.push(component);
		return true;
	}
	
	// Removes a component
	Renderer.remove = function(component) {
		var cmpts = components[components.length - 1];
		
		var index = cmpts.indexOf(component);
		if (index < 0) return false;
		
		cmpts.splice(index, 1);
		return true;
	}
	
	// Removes a global component
	Renderer.remove = function(component) {		
		var index = globalComponents.indexOf(component);
		if (index < 0) return false;
		
		globalComponents.splice(index, 1);
		return true;
	}
	
	// Sets an offset
	Renderer.offset = new Position(0, 0);
	
	// Sets the global alpha
	Renderer.alpha = 1;
	
	// Creates a generic primitive
	Primitives.createGenericPrimitive = function(draw, update) {
		var constructor = function(props, position, color, borderColor, borderSize, direction) {
			if (arguments.length > 1) {
				props = {
					"size": props,
					"position": position,
					"color": color,
					"borderColor": borderColor,
					"borderSize": borderSize,
					"direction": direction
				};
			}
			var defaults = {
				"size": new Size(0, 0),
				"position": new Position(0, 0),
				"color": new Color(),
				"borderColor": new Color(),
				"borderSize": 0,
				"direction": new Position(0, 0)
			};
			
			for (var prop in defaults) {
				this[prop] = defaults[prop];
			}
			for (var prop in props) {
				this[prop] = props[prop];
			}
			
			this.draw = draw || function(ctx) {
				ctx.fillStyle = this.color;
				ctx.fillRect(this.position.x + Renderer.offset.x, this.position.y + Renderer.offset.x, this.size.width, this.size.height);
				if (this.borderSize > 0) {
					ctx.strokeStyle = this.borderColor;
					ctx.lineWidth = this.borderSize;
					ctx.strokeRect(this.position.x + Renderer.offset.x, this.position.y + Renderer.offset.x, this.size.width, this.size.height);
				}
			}
			this.update = update || function() {
				this.position.x += this.direction.x;
				this.position.y += this.direction.y;
			}
		}
		
		return constructor;
	}
	
	// Rectangle primitive
	Primitives.rect = Primitives.createGenericPrimitive();
	
	// Circle primitive
	Primitives.circle = Primitives.createGenericPrimitive(function(ctx) {
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI, false);
		ctx.fillStyle = this.color;
		ctx.fill();
		if (this.borderSize > 0) {
			ctx.strokeStyle = this.borderColor;
			ctx.lineWidth = this.borderSize;
			ctx.stroke();
		}
		ctx.closePath();
	});
	
	// Sprite (image) primitive
	Primitives.sprite = Primitives.createGenericPrimitive(function(ctx) {
		if (!(this.image instanceof Image)) {
			var src = this.image;
			this.image = new Image();
			this.image.src = src;
		}
		if (!this.source) this.source = this.size;
		
		var pos = this.position.add(Renderer.offset);
		
		if (this.rotation && this.size && this.size.width !== 0 && this.size.height !== 0) {
			ctx.translate(pos.x, pos.y);
			ctx.rotate(this.rotation * (Math.PI / 180));
			pos = new Position(-(this.size.width / 2), -(this.size.height / 2));
		}
		
		var params = [pos.x, pos.y];
		
		if (this.size && this.size.width !== 0 && this.size.height !== 0) {
			params.push(this.size.width);
			params.push(this.size.height);
			
			if (this.offset) {
				params.push(this.offset.x);
				params.push(this.offset.y);
				params.push(this.source.width);
				params.push(this.source.height);
			}
		}
		
		// Flip the first four and last four parameters
		if (params.length === 8) {
			for (var i = 0; i < 4; i++) params.push(params.shift());
		}
		params.unshift(this.image);
		
		ctx.drawImage.apply(ctx, params);
	});
	
	// Sprite group primitive
	Primitives.spriteGroup = Primitives.createGenericPrimitive(function(ctx) {		
		if (!this.sizeCache || this.sizeCache.width !== this.size.width || this.sizeCache.height !== this.size.height) {
			var imageWidth = Math.ceil(this.size.width / this.spriteSize.width),
				imageHeight = Math.ceil(this.size.height / this.spriteSize.height);
			
			this.sprites = [];
			for (var y = 0; y < imageHeight; y++) {
				for (var x = 0; x < imageWidth; x++) {
					this.sprites.push(new Primitives.sprite({
						"image": this.image,
						"position": this.position.add(x * this.spriteSize.width, y * this.spriteSize.height),
						"size": this.spriteSize
					}));
				}
			}
			
			this.sizeCache = new Size(this.size.width, this.size.height);
		}
		
		for (var i = 0; i < this.sprites.length; i++) {
			ctx.save();
			this.sprites[i].draw(ctx);
			ctx.restore();
		}
	});
	
	// Text primitive
	Primitives.text = Primitives.createGenericPrimitive(function(ctx) {
		ctx.fillStyle = this.color;
		ctx.font = this.font || "11px Arial";
		ctx.fillText(this.value || "", this.position.x, this.position.y);
	});
	
	// Color cycle primitive
	Primitives.colorCycle = Primitives.createGenericPrimitive(null, function(delta) {
		if (!this.pulsateColor) {			
			if (typeof this.length === "undefined") this.length = 1000;
			if (typeof this.multiplier === "undefined") this.multiplier = 1;
			if (!this.colors) this.colors = Primitives.colorCycle.defaultColors;
			
			this.pulsateColor = this.pulsateDiff = new Color(0.5, 0.5);
		}
		
		if (Game.paused) return;
		
		var diff = 1 / (this.length / delta);
		
		this.color.red += this.pulsateDiff.red * diff;
		this.color.green += this.pulsateDiff.green * diff;
		this.color.blue += this.pulsateDiff.blue * diff;
					
		if ((this.color.red > this.pulsateColor.red && this.pulsateDiff.red > 0) 		|| (this.color.red < this.pulsateColor.red && this.pulsateDiff.red < 0) 		||
			(this.color.green > this.pulsateColor.green && this.pulsateDiff.green > 0) 	|| (this.color.green < this.pulsateColor.green && this.pulsateDiff.green < 0) 	||
			(this.color.blue > this.pulsateColor.blue && this.pulsateDiff.blue > 0) 	|| (this.color.blue < this.pulsateColor.blue && this.pulsateDiff.blue < 0)) 	{
							
			var oldPulsateColor = this.pulsateColor;
			do {
				var color = this.colors[Math.floor(Math.random() * this.colors.length)];
				this.pulsateColor = new Color(color[0] * this.multiplier, color[1] * this.multiplier, color[2] * this.multiplier);
				this.pulsateDiff = new Color(this.pulsateColor.red - this.color.red, this.pulsateColor.green - this.color.green, this.pulsateColor.blue - this.color.blue);
			} while (this.pulsateColor.red === oldPulsateColor.red && this.pulsateColor.green === oldPulsateColor.green && this.pulsateColor.blue === oldPulsateColor.blue);
		}
	});
	
	Primitives.colorCycle.defaultColors = [
		[0  ,1  ,1  ],
		[0  ,0  ,1  ],
		[1  ,0  ,1  ],
		//[0  ,0.5,0  ],
		[0  ,1  ,0  ],
		//[0.5,0  ,0  ],
		[0  ,0  ,0.5],
		[1  ,0.5,0  ],
		//[0.5,0  ,0.5],
		[1  ,0  ,0  ],
		//[0  ,0.5,0.5],
		[1  ,1  ,0  ]
	];
	
	// Video primitive
	Primitives.video = Primitives.createGenericPrimitive(function(ctx) {
		this.load();
		
		ctx.drawImage(this.element, this.position.x, this.position.y, this.size.width, this.size.height);
	});
	
	Primitives.video.prototype.load = function() {
		if ((this.sources || []) !== this.sourceCache) {
			var sources = this.sources || [],
				path = this.path || "";
			
			this.element = document.createElement('video');
			this.element.preload = true;
			
			for (var i = 0; i < sources.length; i++) {
				var source = sources[i],
					ext = (source === "ogg" ? "ogv" : source);
				
				var elt = document.createElement('source');
				elt.src = path + "." + ext;
				elt.type = "video/" + source;
				
				this.element.appendChild(elt);
			}
			
			this.sourceCache = sources;
		}
	}
	
	Primitives.video.prototype.play = function() {
		this.load();
		this.element.play();
	}
	
	Primitives.video.prototype.pause = function() {
		this.load();
		this.element.pause();
	}
	
	Primitives.video.prototype.stop = function() {
		this.load();
		this.element.pause();
		this.goto(0);
	}
	
	Primitives.video.prototype.goto = function(pos) {
		this.element.currentTime = pos;
	}
}());