/**
 * Map System
 */

var Map = window.Map || {};

(function() {
	var blockSize = new Size(64, 64);
	
	Map = function(position, size) {
		this.position = position || new Position(0, 0);
		this.size = size || new Size(Game.width, Game.height);
		this.blockSize = new Size(Math.ceil(this.size.width / blockSize.width) + 1, Math.ceil(this.size.height / blockSize.height) + 1);
		
		this.speed = 0.5;
		this.groupedMovement = 0;
		
		this.groups = [];
		
		this.currentGenerator = false;
		this.totalGenerationDistance = 0;
		this.currentGenerationDistance = 0;
		this.topGenerationPersistant = {};
		this.bottomGenerationPersistant = {};
		
		for (var i = 0; i < 2; i++) {
			this.groups[i] = [];
			for (var x = 0; x < this.blockSize.width; x++) {
				this.groups[i][x] = (new BlockColumn(this.blockSize.height, 0, 2, x * blockSize.width, 0, i === 1, i === 1 ? Blocks.flippedGrass : false, i === 1 ? Blocks.flippedDirt : false)).create();
			}
		}
	}
	
	Map.prototype.draw = function(ctx) {
		this.each(function(block) {
			block.draw(ctx);
		});
	}
	
	Map.prototype.generateRows = function(rows) {
		if (!this.currentGenerator || this.currentGeneratorDistance > this.totalGenerationDistance) {
			var generator = Map.pickGenerator();
			var length = randomInt(generator.minWidth, generator.maxWidth);
			this.currentGenerator = generator;
			this.currentGeneratorDistance = 0;
			this.totalGenerationDistance = length;
			this.topGenerationPersistant = {};
			this.bottomGenerationPersistant = {};
		}
		
		var maxGroupHeight = Math.ceil(this.blockSize.height / 2),
			groupHeight = Math.min(this.currentGenerator.maxHeight, maxGroupHeight);
		
		for (var i = 0; i < this.groups.length; i++) {
			var blocks = this.groups[i],
				lastColumn = blocks[blocks.length - 1];
				
			for (var x = 0; x < rows; x++) {
				if (lastColumn) {
					var newColumn = new BlockColumn(groupHeight, Math.max(this.currentGenerator.minHeight, 0), lastColumn.height, lastColumn.x + blockSize.width, (i === 1 ? 0 : this.blockSize.height - groupHeight - 1), i === 1);
					this.currentGenerator.onColumn.call(newColumn, this.currentGeneratorDistance + x, this.totalGenerationDistance, i === 1 ? this.topGenerationPersistant : this.bottomGenerationPersistant);
					newColumn.create();
					blocks.push(newColumn);
					lastColumn = newColumn;
				}
			}
		}
		this.currentGeneratorDistance += rows;
	}
	
	Map.prototype.update = function(delta) {
		if (Game.paused) return;
		
		var movement = delta * this.speed;
		this.groupedMovement += movement;
		
		for (var i = 0; i < this.groups.length; i++) {
			var blocks = this.groups[i];
			for (var x = 0; x < blocks.length; x++) {
				var blockGroup = blocks[x];
				blockGroup.x -= movement;
				blockGroup.update(delta);
			}
			
			// Add another column and remove the first one
			var firstGroup = blocks[0];
			if (firstGroup.x < -blockSize.width) {
				this.groups[i] = this.groups[i].slice(1);
				
				var lastColumn = this.groups[i][this.groups[i].length - 1],
					endDifference = Game.width - lastColumn.x,
					blocksRequired = Math.ceil(endDifference / blockSize.width);
				
				this.generateRows(blocksRequired);
				
				this.groupedMovement = 0;
			}
		}
	}
	
	Map.prototype.collidingWith = function(pos, size) {
		if (arguments.length === 1) {
			size = pos.size;
			pos = pos.position;
		}
		
		var isColliding = {"x": false, "y": false, "flags": {}};
		this.each(function(block) {
			var r = block.isColliding(pos, size);
			if (r.x !== false) isColliding.x = r.x;
			if (r.y !== false) isColliding.y = r.y;
			
			for (var i in r.flags) isColliding.flags[i] = r.flags[i];
		});
		
		return isColliding;
	}
	
	Map.prototype.each = function(func) {
		for (var i = 0; i < this.groups.length; i++) {
			var blocks = this.groups[i];
			for (var x = 0; x < blocks.length; x++) {
				var blockGroup = blocks[x].blocks;
				for (var y = 0; y < blockGroup.length; y++) {
					func(blockGroup[y], x, y);
				}
			}
		}
	}
	
	var generators = [], areSorted = true;
	Map.addGenerator = function(name, generator) {
		generator.name = name;
		generators.push(generator);
		areSorted = false;
	}
	
	Map.getGenerator = function(name) {
		for (var i = 0; i < generators.length; i++) {
			if (generators[i].name === name) return generators[i];
		}
		return false;
	}
	
	Map.sortGenerators = function() {
		if (areSorted) return;
		
		generators.sort(function(a, b) {
			return b.priority - a.priority;
		});
		areSorted = true;
	}
	
	Map.pickGenerator = function(forceLevel) {
		Map.sortGenerators();
		
		if (!forceLevel) forceLevel = Game.level;
		
		while (true) {
			for (var i = 0; i < generators.length; i++) {
				var generator = generators[i];
				if ((!generator.minLevel || forceLevel >= generator.minLevel) && (!generator.maxLevel || forceLevel <= generator.maxLevel) && Math.random() < generator.chance) return generator;
			}
		}
	}
	
	// Represents a column of blocks in a segment
	BlockColumn = function(maxHeight, minHeight, initialHeight, xPos, yPos, inverted, topBlock, fillBlock, airBlock) {
		this.maxHeight = maxHeight;
		this.minHeight = minHeight;
		this.height = initialHeight;
		
		this.topBlock = topBlock || (inverted ? Blocks.flippedGrass : Blocks.grass);
		this.fillBlock = fillBlock || (inverted ? Blocks.flippedDirt : Blocks.dirt);
		this.airBlock = airBlock || Blocks.air;
		
		this.inverted = inverted || false;
		
		this.x = xPos;
		this.y = yPos;
		this.preBlocks = [];
		this.blocks = [];
		
		this.rebuild();
	}
	
	BlockColumn.prototype.rebuild = function() {
		this.preBlocks = new Array(this.maxHeight);
		
		for (var i = 0; i <= this.height; i++) {
			this.preBlocks[i] = true;
		}
	}
	
	BlockColumn.prototype.erode = function(height) {
		this.height = Math.max(this.height - height, this.minHeight);
		this.rebuild();
	}
	
	BlockColumn.prototype.fill = function(height) {
		this.height = Math.min(this.height + height, this.maxHeight);
		this.rebuild();
	}
	
	BlockColumn.prototype.setTopBlock = function(block) {
		if (GameStage.mode !== 2 || (block.getProperties().name !== "Spike" && block.getProperties().name !== "FlippedSpike")) this.topBlock = block;
	}
	
	BlockColumn.prototype.setFillBlock = function(block) {
		this.fillBlock = block;
	}
	
	BlockColumn.prototype.create = function() {
		var result = [],
			isInverted = this.inverted, maxHeight = this.maxHeight,
			startpos = this.maxHeight - 1,
			direction = -1,
			check = function(i) { return i >= 0;},
			isFirst = true;
				
		for (var i = startpos; check(i); i += direction) {
			var isFilled = this.preBlocks[i],
				position = new Position(this.x, (this.y + (isInverted ? i : result.length)) * blockSize.height);
			
			if (isFilled && isFirst) {
				result.push(new this.topBlock(position));
				isFirst = false;
			} else if (isFilled) result.push(new this.fillBlock(position));
			else result.push(new this.airBlock(position));
		}
		
		this.blocks = result;
		return this;
	}
	
	BlockColumn.prototype.update = function() {
		if (!this.blocks) return;
		
		for (var i = 0; i < this.blocks.length; i++) {
			this.blocks[i].position.x = this.x;
			this.blocks[i].update();
		}
	}
}());