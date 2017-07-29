/**
 * Death state
 *
 * Runs the game
 */

(function() {
	var background, backgroundImage, img, score, highscore, again, imgSize = new Size(563, 108), againSize = new Size(473, 33), pulsateDirection = 1,
		againAlphaMin = 0.2, againAlphaMax = 1, isPressing = false, totalTime = new Time(0);
	
	// Add the death state
	States.add("death", {		
		"setup": function() {
			if (Game.score > Game.highScore) {
				Game.highScore = Game.score;
				
				var num2text = {0: "zero", 1: "one", 2: "two"};
				Cookies.write("highscore" + num2text[GameStage.mode], Game.highScore, 9999999);
			}
			
			// Setup the death title image, score text, and play again image
			Renderer.add(background = new Primitives.colorCycle({
				"length": 500,
				"colors": [
					[1, 0, 0],
					[0, 0, 0]
				]
			}));
			Renderer.add(backgroundImage = new Primitives.sprite({
				"image": "images/background.png"
			}));
			Renderer.add(img = new Primitives.sprite({
				"image": "images/text/death.png",
				"size": imgSize,
			}));
			Renderer.add(score = new Primitives.text({
				"value": "Score: " + Math.floor(Game.score),
				"color": "white",
				"font": "40px Arial"
			}));
			Renderer.add(highscore = new Primitives.text({
				"value": "High score: " + Math.floor(Game.highScore),
				"color": "red",
				"font": "40px Arial"
			}));
			Renderer.add(again = new Primitives.sprite({
				"image": "images/text/playagain.png",
				"size": againSize,
				"alpha": againAlphaMin
			}));
			Renderer.globalAlpha = 0;
		},
		"update": function(delta) {
			// Update the positions of the items to keep them centered
			img.position = new Position(Game.width / 2 - imgSize.width / 2, Game.height / 2 - imgSize.height / 2 - 150);
			score.position = new Position(Game.width / 2 - 100, Game.height / 2);
			highscore.position = new Position(Game.width / 2 - (highscore.value.length * 9), Game.height / 2 + 50);
			again.position = new Position(Game.width / 2 - againSize.width / 2, Game.height / 2 - againSize.height / 2 + 150);
			background.size = new Size(Game.width, Game.height);
			
			// Fade in the whole screen
			if (Renderer.globalAlpha < 1) Renderer.globalAlpha += delta / 400;
			else {
				Renderer.globalAlpha = 1;
				
				// Pulsate the 'play again' text
				again.alpha += pulsateDirection * (delta / 1000);
				if (again.alpha < againAlphaMin) {
					pulsateDirection = 1;
					again.alpha = againAlphaMin;
				} else if (again.alpha > againAlphaMax) {
					pulsateDirection = -1;
					again.alpha = againAlphaMax;
				}
			}
			
			totalTime.add(delta + "ms");
			
			// Change to the game state if the user tapped or pressed space
			if (totalTime.valueOf() > Time.second.valueOf()) {
				if (Keyboard.pressed(32) || Mouse.pressed) isPressing = true;
				else if (isPressing) {
					States.change("start");
					isPressing = false;
					Sound.play("beep");
				}
			}
			
			Events.stop("gamesong");
			var $video = document.getElementById("video");
			$video.pause();
			$video.currentTime = 0;
			Sound.stop("game_2");
		}
	});
}());