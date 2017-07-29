/**
 * Game state
 *
 * Runs the game
 */

var GameStage = window.GameStage || {};

(function() {
	var background, backgroundImage, backgroundImageDouble, map, bottomShadow, topShadow, player, text, silhouette, forecolor, pause, countdown, countdownTimer, countdownNumber, isCountingDown, isPlaying, instructions,
		backgroundSize = new Size(1920, 1280), pauseSize = new Size(64, 64), countdownSize = new Size(330, 138), pausedSize = new Size(685, 73), instructionsSize = new Size(524, 36), isPressed = false;
	
	// Add the game state
	States.add("game", {		
		"setup": function() {
			Renderer.globalAlpha = 0;
			
			countdownTimer = new Time(0);
			countdownNumber = 3;
			isCountingDown = true;
			isPlaying = false;
			
			// Add all items to the renderer
			/*Renderer.add(videoBackground = new Primitives.video({
				"position": new Position(0, 0)
			}));*/
			Renderer.add(background = new Primitives.colorCycle({
				"alpha": 1
			}));
			Renderer.add(map = new Map());
			Renderer.add(player = new Player(map));
			Renderer.add(bottomShadow = new Primitives.sprite({
				"image": "images/bottom_shadow.png"
			}));
			Renderer.add(topShadow = new Primitives.sprite({
				"image": "images/top_shadow.png"
			}));
			Renderer.add(text = new Primitives.text({
				"value": "0",
				"color": "white",
				"font": "20px Arial",
				"position": new Position(10, 40)
			}));
			Renderer.add(silhouette = new Primitives.sprite({
				"image": "images/silhouette.png",
				"size": new Size(3840, 2560),
				"alpha": 0
			}));
			Renderer.add(forecolor = new Primitives.rect({
				"alpha": 1
			}));
			Renderer.add(pause = new Primitives.sprite({
				"image": "images/pause.png",
				"size": pauseSize,
			}));
			Renderer.add(countdown = new Primitives.sprite({
				"image": "images/text/three.png",
				"size": countdownSize,
				"alpha": 1
			}));
			Renderer.add(pausedText = new Primitives.sprite({
				"image": "images/text/paused.png",
				"size": pausedSize,
				"alpha": 0
			}));
			Renderer.add(instructions = new Primitives.sprite({
				"image": "images/text/instructions.png",
				"size": instructionsSize
			}));
			
			// Store some public accessors
			GameStage.background = background;
			GameStage.backgroundImage = backgroundImage;
			GameStage.backgroundImageDouble = backgroundImageDouble;
			GameStage.map = map;
			GameStage.player = player;
			GameStage.text = text;
			GameStage.silhouette = silhouette;
			GameStage.forecolor = forecolor;
			GameStage.pause = pause;
			
			Game.paused = true;
			
			Game.score = 0;
			var num2text = {0: "zero", 1: "one", 2: "two"};
			Game.highScore = Cookies.read("highscore" + num2text[GameStage.mode]) || 0;
			player.flipTo(false);
			
			if (GameStage.mode === 0 || GameStage.mode === 2) {
				Game.level = 3;
				background.speed = 2000;
				background.alpha = 0.5;
				Sound.play("start_beeps");
				Sound.play("game_2", true);
			} else if (GameStage.mode === 1) {
				isCountingDown = false;
				isPlaying = true;
				Game.paused = false;
				countdown.alpha = 0;
				Game.level = 1;
				silhouette.alpha = 1;
				background.alpha = 0;
				GameStage.map.speed = 0.2;
				Events.play("gamesong");
			}
			
			Tweener.to(1, 0, "100ms", function(v) {
				forecolor.alpha = v;
			});
			
			setTimeout(function() {
				Tweener.to(1, 0, "300ms", function(v) {
					instructions.alpha = v;
				});
			}, 5000);
		},
		"update": function(delta) {
			Renderer.globalAlpha = 1;
			
			background.size = forecolor.size = new Size(Game.width, Game.height);
			pausedText.position = new Position(Game.width / 2 - pausedSize.width / 2, Game.height / 2 - pausedSize.height / 2);
			countdown.position = new Position(Game.width / 2 - countdownSize.width / 2, Game.height / 2 - countdownSize.height / 2);
			silhouette.position = player.position.add(-1609, -1230);
			instructions.position = new Position(Game.width / 2 - instructionsSize.width / 2, Game.height - instructionsSize.height - 40)
			
			bottomShadow.position = new Position(0, Game.height - 200);
			bottomShadow.size = topShadow.size = new Size(Game.width, 200);
			
			/*if (isFadingIn || isCountingDown) {
				countdown.position = new Position(Game.width / 2 - countdownSize.width / 2, Game.height / 2 - countdownSize.height / 2);
			}
			
			if (isFadingIn) {
				var diff = 1 / (1000 / delta);
				Renderer.globalAlpha += diff;
				
				if (Renderer.globalAlpha >= 0.5) {
					Renderer.globalAlpha = 0.5;
					isFadingIn = false;
					isCountingDown = true;
				}
			}
			if (isCountingDown) {
				countdownTimer.add(delta + "ms");
				
				if (countdownTimer.valueOf() > (new Time("1s")).valueOf()) {
					countdownTimer = new Time(0);
					countdownNumber--;
					
					if (countdownNumber >= 0) {
						if (countdownNumber < 1) {
							Game.paused = false;
							isPlaying = true;
						}
						var num2text = {3: "three", 2: "two", 1: "one", 0: "go"};
						countdown.image = "images/text/" + num2text[countdownNumber] + ".png";
					} else {
						countdown.alpha = 0;
						isCountingDown = false;
						pause.alpha = 1;
					}
				}
				
				if (isCountingDown && countdownNumber < 1) {
					var diff = 1 / (1000 / delta);
					countdown.alpha -= diff;					
					if (countdown.alpha < 0) countdown.alpha = 0;
				}
				
			}*/
			
			if (isCountingDown) {
				countdownTimer.add(delta);
				
				if (countdownTimer.valueOf() > Time.second.valueOf()) {
					countdownTimer = new Time(0);
					countdownNumber--;
					
					if (countdownNumber >= 0) {
						if (countdownNumber === 0) {
							Game.paused = false;
							isPlaying = true;
							
							Tweener.to(1, 0, "100ms", function(v) {
								countdown.alpha = v;
							});
						}
						var num2text = {3: "three", 2: "two", 1: "one", 0: "go"};
						countdown.image = "images/text/" + num2text[countdownNumber] + ".png";
					} else isCountingDown = false;
				}
			}
			
			pause.position = new Position(Game.width - 10 - pauseSize.width, Game.height - 10 - pauseSize.height);
			
			if (isPlaying) {
				if (Keyboard.pressed(27) || Mouse.pressed && Mouse.position.x > pause.position.x && Mouse.position.y > pause.position.y) {
					isPressed = true;
				} else if (isPressed) {
					Sound.play("beep");
					Game.paused = !Game.paused;
					if (Game.paused) {
						pausedText.alpha = 1;
						if (GameStage.mode === 1) document.getElementById("video").pause();
					} else {
						pausedText.alpha = 0;
						if (GameStage.mode === 1) document.getElementById("video").play();
					}
					isPressed = false;
				}
				
				if (!Game.paused) {					
					// Update score
					Game.score += delta;
					text.value = String(Math.floor(Game.score));
				}
			}
		}
	});
}());