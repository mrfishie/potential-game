/**
 * Game Manager
 *
 * Manages the game
 */

var Game = window.Game || {};
(function() {
	// Starts the game
	Game.start = function() {
		States.setup();
		Renderer.setup();
		Loops.startAll();
		States.change(Game.defaultState);
	};
	
	Game.score = 0;
	Game.level = 1;
	Game.highScore = 0;
	Game.paused = false;
	
	Game.defaultState = "start";
	
	Game.updateFPS = 60;
	Game.friendlyFPSDelay = 10;
	
	Game.sounds = [
		"game_1",
		"game_2",
		"menu_1",
		
		"beep",
		"jump",
		"land",
		"start_beeps"
	];
	
	var friendlyFPSCounter = [];
	
	var logs = [], unshownLogs = 0;
	
	// Logs a message to the game log
	Game.log = function(msg) {
		logs.unshift(msg);
		
		if (logs.length > 40) {
			logs.pop();
			unshownLogs++;
		}
	};
	
	// Sets up the game
	Game.setup = function(canvas) {
		// Start loading sounds
		for (var i in Game.sounds) {
			var soundName = Game.sounds[i];
			Sound.add(soundName, "sounds/" + soundName);
		}
		
		Game.FPS = Game.updateFPS;
		Game.friendlyFPS = Game.updateFPS;
		
		for (var x = 0; x < Game.friendlyFPSDelay; x++) friendlyFPSCounter[x] = Game.updateFPS;
		
		Loops.add({
			"name": "update",
			"wait": 1000 / Game.updateFPS,
			"callback": function(delta) {
				Game.FPS = 1000 / delta;
				
				// Calculate 'friendly' FPS (a more stable FPS that can be displayed on-screen)
				friendlyFPSCounter.shift();
				friendlyFPSCounter.push(Game.FPS);
				
				var totalFPS = 0;
				for (var i = 0; i < friendlyFPSCounter.length; i++) {
					totalFPS += friendlyFPSCounter[i];
				}
				Game.friendlyFPS = totalFPS / friendlyFPSCounter.length;
			}
		});
		Loops.add({
			"name": "render",
			"type": "refresh"
		});
		
		Renderer.setCanvas(canvas);
		
		// Show game FPS
		Renderer.addGlobal({
			"draw": function(ctx, delta) {
				ctx.fillStyle = "white";
				ctx.font = "11px Arial";
				ctx.fillText("FPS: " + Game.FPS.toFixed(2) + "\n Render: " + (1000 / delta).toFixed(2) + "\n Level: " + Game.level, 10, 20);
				ctx.font = "15px Arial";
				/*for (var i = 0; i < logs.length; i++) {
					ctx.fillText(logs[i], 10, i * 20 + 60);
				}*/
				/*if (unshownLogs) {
					ctx.fillStyle = "red";
					ctx.fillText(unshownLogs + " unshown message(s)");
				}*/
			},
			"update": function() { }
		});
	}
}());

// Utility functions
function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}