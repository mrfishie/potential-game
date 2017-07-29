/**
 * Start state
 *
 * Starts the game
 */

(function() {
	var background, backgroundImage, titleText, modeListText, selectModeText, tapToPlayText, instructionsText, forecolor, 
		titleTextSize = new Size(537, 96), selectModeSize = new Size(282, 300), modeListSize = new Size(173, 113), tapToPlaySize = new Size(375, 27),
		instructionsSize = new Size(524, 36), mode = 1, isChangingMode = false, hasPressedExit = false, isRunning;
	
	// Add the death state
	States.add("start", {
		"setup": function() {
			isFadingOut = false;
			hasPressedExit = false;
			isRunning = true;
			
			Renderer.add(background = new Primitives.colorCycle({
				"length": 1000,
			}));
			Renderer.add(backgroundImage = new Primitives.sprite({
				"image": "images/background.png"
			}));
			Renderer.add(titleText = new Primitives.sprite({
				"image": "images/text/title.png",
				"size": titleTextSize
			}));
			Renderer.add(modeListText = new Primitives.sprite({
				"image": "images/text/mode_list.png",
				"size": modeListSize
			}));
			Renderer.add(selectModeText = new Primitives.sprite({
				"image": "images/text/select_mode.png",
				"size": selectModeSize
			}));
			Renderer.add(tapToPlayText = new Primitives.sprite({
				"image": "images/text/tap_to_play.png",
				"size": tapToPlaySize
			}));
			Renderer.add(instructionsText = new Primitives.sprite({
				"image": "images/text/instructions.png",
				"size": instructionsSize
			}));
			Renderer.add(forecolor = new Primitives.rect({
				"alpha": 0
			}));
			
			// Animate tap to play in/out
			var animateTapToPlay = function() {
				if (!isRunning) return;
				
				Tweener.to(1, 0.2, "100ms", function(v) {
					tapToPlayText.alpha = v;
				}, function() {
					if (!isRunning) return;
					
					Tweener.to(0.2, 1, "100ms", function(v) {
						tapToPlayText.alpha = v;
					}, animateTapToPlay);
				});
			}
			animateTapToPlay();
			
			Sound.play("menu_1", true);
		},
		"update": function(delta) {
			background.size = forecolor.size = new Size(Game.width, Game.height);
			titleText.position = new Position(Game.width / 2 - titleTextSize.width / 2, (Game.height / 2 - titleTextSize.height / 2) - 200);
			selectModeText.position = new Position(Game.width / 2 - selectModeSize.width / 2, Game.height / 2 - selectModeSize.height / 2);
			modeListText.position = new Position(Game.width / 2 - modeListSize.width / 2, (Game.height / 2 - modeListSize.height / 2) - 10 - (45 * (mode - 2)));
			tapToPlayText.position = new Position(Game.width / 2 - tapToPlaySize.width / 2, (Game.height / 2 - tapToPlaySize.height / 2) + 200);
			instructionsText.position = new Position(Game.width / 2 - instructionsSize.width / 2, (Game.height / 2 - instructionsSize.height / 2) + 300);
			
			// Move mode list up or down
			if ((Keyboard.pressed(38) || Keyboard.pressed('W') || Keyboard.pressed('w')) && mode > 0) {
				if (!isChangingMode) {
					isChangingMode = true;
					Tweener.to(modeListText.position.y, modeListText.position.y + 45, "20ms", function(v) {
						modeListText.position.y = v;
					}, function() { isChangingMode = false; });
					mode--;
					Sound.play("beep");
				}
			} else if ((Keyboard.pressed(40) || Keyboard.pressed('S') || Keyboard.pressed('s')) && mode < 2) {
				if (!isChangingMode) {
					isChangingMode = true;
					Tweener.to(modeListText.position.y, modeListText.position.y - 45, "20ms", function(v) {
						modeListText.position.y = v;
					}, function() { isChangingMode = false; });
					mode++;
					Sound.play("beep");
				}
			}
			
			// Change to the game state if the user tapped or pressed space
			if (Keyboard.pressed(32) || Keyboard.pressed(13) || Mouse.pressed) hasPressedExit = true;
			else if (hasPressedExit) {
				hasPressedExit = false;
				Renderer.globalAlpha = 1;
				
				Tweener.to(0, 1, "50ms", function(v) {
					forecolor.alpha = v;
				}, function() {
					GameStage.mode = mode;
					States.change("game");
					Sound.stop("menu_1");
					isRunning = false;
				});
				
				Sound.play("beep");
			}
		}
	});
}());