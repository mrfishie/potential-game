/**
 * A set of map generators
 */

var Generators = window.Generators || {};

(function() {
	Map.addGenerator("mostly flat", {
		"minLevel": 1,
		"maxLevel": 1,
		"priority": 1,
		"chance": 1,
		"minWidth": 1,
		"maxWidth": 1,
		"maxHeight": 3,
		"minHeight": 1,
		"onColumn": function(index, lastIndex, persistant) {
			var shouldFill = Math.random() >= 0.8;
			
			if (shouldFill) this.fill(Math.random() * 2);
			else this.erode(Math.random() * 2);
		}
	});
	
	Map.addGenerator("one sided", {
		"minLevel": 4,
		"maxLevel": 4,
		"priority": 2,
		"chance": 1,
		"minWidth": 5,
		"maxWidth": 20,
		"maxHeight": 5,
		"minHeight": 0,
		"onColumn": function(index, lastIndex, persistant) {
			if (!persistant.generator) {
				do {
					persistant.generator = Map.pickGenerator(3);
				} while (persistant.generator.name === "one sided");
			}
			if (!("isTop" in persistant)) persistant.isTop = Math.random() > 0.5;
			
			if (persistant.isTop === this.inverted) persistant.generator.onColumn.apply(this, arguments);
			else {
				if (this.height === 0) this.setTopBlock(Blocks.air);
				else this.erode(Math.random() * 2);
			}
		}
	});
	
	Generators.default = {
		"level2Height": 1,
		"level3Height": 2,
		"erodeChance": 0.5
	};
	Map.addGenerator("default", {
		"minLevel": 2,
		"priority": 0,
		"chance": 1,
		"minWidth": 5,
		"maxWidth": 5,
		"maxHeight": 5,
		"minHeight": 1,
		"onColumn": function(index, lastIndex, persistant) {
			var shouldFill = Math.random() >= Generators.default.erodeChance;
			
			if (shouldFill) this.fill(Math.random() * (Game.level >= 3 ? Generators.default.level3Height : Generators.default.level2Height));
			else this.erode(Math.random() * (Game.level >= 3 ? Generators.default.level3Height : Generators.default.level2Height));
			
			if (persistant.isGeneratingClump) {
				if (persistant.clumpLength > 5) persistant.isGeneratingClump = false;
				else {
					this.setTopBlock(this.inverted ? Blocks.flippedSpike : Blocks.spike);
					this.fill(1);
					persistant.clumpLength++;
				}
			} else if (Game.level >= 3 && Math.random() > 0.95) {
				persistant.isGeneratingClump = true;
				persistant.clumpLength = 0;
			}
		}
	});
	
	Map.addGenerator("long spikes", {
		"minLevel": 3,
		"maxLevel": 5,
		"priority": 1,
		"chance": 0.05,
		"minWidth": 1,
		"maxWidth": 50,
		"maxHeight": 5,
		"minHeight": 0,
		"onColumn": function(index, lastIndex, persistant) {
			if (Math.random() > 0.9) this.erode(1);
			else if (Math.random() < 0.1) this.fill(1);
			
			if (Math.random() < 0.5) this.setTopBlock(this.inverted ? Blocks.flippedSpike : Blocks.spike);
			else this.setTopBlock(this.inverted ? Blocks.flippedDirt : Blocks.dirt);
		}
	});
	
	Map.addGenerator("all spikes", {
		"minLevel": 7,
		"maxLevel": 7,
		"priority": 2,
		"chance": 1,
		"minWidth": 1,
		"maxWidth": 50,
		"maxHeight": 5,
		"minHeight": 0,
		"onColumn": function(index, lastIndex, persistant) {
			if (Math.random() > 0.9) this.erode(1);
			else if (Math.random() < 0.1) this.fill(1);
			
			this.setTopBlock(this.inverted ? Blocks.flippedSpike : Blocks.spike);
		}
	});
	
	Map.addGenerator("spike pit", {
		"minLevel": 3,
		"maxLevel": 5,
		"priority": 1,
		"chance": 0.1,
		"minWidth": 20,
		"maxWidth": 30,
		"maxHeight": 5,
		"minHeight": 1,
		"onColumn": function(index, lastIndex, persistant) {			
			persistant.currentMode = persistant.currentMode || "prebuild";
			if (typeof persistant.currentModeStart === "undefined") persistant.currentModeStart = 0;
			
			if (persistant.currentMode === "prebuild") {
				this.fill(1);
				if (index - persistant.currentModeStart > 3) {
					persistant.currentMode = "spikes";
					persistant.currentModeStart = index;
				}
			} else if (persistant.currentMode === "spikes") {
				var changeWidth = 5;
				if (index - persistant.currentModeStart < changeWidth) {
					this.erode((changeWidth - (index - persistant.currentModeStart)) / (changeWidth / 2) + (Math.random() * 2 - 1));
				} else if (index > lastIndex - changeWidth) {
					this.fill((index - lastIndex + changeWidth) / (changeWidth / 2) + (Math.random() * 2 - 1));
				} else {
					if (this.inverted) this.setTopBlock(Blocks.flippedSpike);
					else this.setTopBlock(Blocks.spike);
					
					if (Math.random() > 0.5) this.fill(Math.random());
					else this.erode(Math.random());
				}
			}
		}
	});
}());