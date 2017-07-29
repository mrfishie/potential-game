/**
 * Player Component
 *
 * Represents a player in the game
 */

var Player = window.Player || {};

(function() {
	Player = function(map, position) {
		this.image = new Image();
		this.image.src = "images/character_1.png";
		this.map = map;
		
		this.size = new Size(65, 82);
		this.position = position || new Position(Game.width / 4, Math.floor(Game.height / 64) * 64 - 64 - this.size.height);
		
		this.momentum = new Position(0, 0);
		this.gravity = new Position(0, 0.05);
		
		this.maxMomentum = new Position(30, 30);
		
		this.jumpHeight = 15;
		
		this.inAir = false;
		this.isFlipped = false;
		this.isJumping = false;
		
		var im = this.image;
		im.onload = function() {
			im.loaded = true;
		}
		
		this.animateTime = new Time(0);
		this.animateState = false;
	}

	var cheatMode = false;

	// Updates the player
	Player.prototype.update = function(delta) {
		if (Game.paused || cheatMode) return;
		
		// Calculate momentum
		this.momentum = this.momentum.add(this.gravity.x * delta, this.gravity.y * delta);
		if (this.momentum.x > this.maxMomentum.x) this.momentum.x = this.maxMomentum.x;
		else if (this.momentum.x < -this.maxMomentum.x) this.momentum.x = -this.maxMomentum.x;
		
		if (this.momentum.y > this.maxMomentum.y) this.momentum.y = this.maxMomentum.y;
		else if (this.momentum.y < -this.maxMomentum.y) this.momentum.y = -this.maxMomentum.y;
		
		var newPosition = this.position.add(this.momentum);
		
		// Calculate collision
		var colliding = this.map.collidingWith(newPosition, this.size);
		if (colliding.y !== false) {
			this.momentum.y = 0;
			newPosition.y = colliding.y;
			this.inAir = false;
		} else this.inAir = true;
		
		if (colliding.x !== false) {
			this.momentum.x = 0;
			newPosition.x = colliding.x - this.size.width;
		}
		
		// Kill the player if the block has the dead flag
		if (colliding.flags.dead) States.change("death");
		
		// Update position
		this.position = newPosition;
		
		// Find if we are outside of the screen bounds
		if (GameStage.mode !== 2) {
			if (this.position.x < -this.size.width || this.position.x > Game.width || this.position.y < -this.size.height || this.position.y > Game.height) {
				States.change("death");
			}
		} else {
			if (this.position.x < -this.size.width) this.position.x = Game.width;
			else if (this.position.x > Game.width) this.position.x = -this.size.width;
			
			if (this.position.y < -this.size.height) this.position.y = Game.height;
			else if (this.position.y > Game.height) this.position.y = -this.size.height;
		}
		
		if (Keyboard.pressed(32) || Keyboard.pressed('w') || Keyboard.pressed('W') || (Mouse.pressed && Mouse.position.x > Game.width / 3 && Mouse.position.x < Game.width / 3 * 2)) {
			if (!this.isJumping) {
				this.flip();
				this.isJumping = true;
			}
		} else this.isJumping = false;
		
		// Animate player
		this.animateTime.add(delta);
		if (this.animateTime.valueOf() > Time.second.valueOf() / 4) {
			this.animateTime = new Time(0);
			this.animateState = !this.animateState;
			this.image.src = "images/character_" + (this.animateState ? 2 : 1) + (this.isFlipped ? "_flipped" : "") + ".png";
		}
		
		// Left/right movement
		var anythingPressed = false;
		if (Keyboard.pressed('A') || Keyboard.pressed('a') || (Mouse.pressed && Mouse.position.x < Game.width / 3)) {
			this.momentum.x = -10;
			anythingPressed = true;
		}
		if (Keyboard.pressed('D') || Keyboard.pressed('d') || (Mouse.pressed && Mouse.position.x > Game.width / 3 * 2)) {
			this.momentum.x = 10;
			anythingPressed = true;
		}
		
		// Slow down X momentum
		if (!anythingPressed) {
			if (this.momentum.x > 0.1 || this.momentum.x < -0.1) {
				this.momentum.x /= 5;
			} else this.momentum.x = 0;
		}
	}
	
	// Flips the player
	Player.prototype.flip = function() {
		this.gravity.y *= -1;
		this.isFlipped = !this.isFlipped;
		
		if (this.isFlipped) this.image.src = "images/character_1_flipped.png";
		else this.image.src = "images/character_1.png";
	}
	
	// Flips the player to a certain direction
	Player.prototype.flipTo = function(flip) {
		if (flip !== this.isFlipped) this.flip();
	}
	
	// Draws the player onscreen
	Player.prototype.draw = function(ctx) {
		if (this.image.loaded) ctx.drawImage(this.image, this.position.x + Renderer.offset.x, this.position.y + Renderer.offset.x);
	}
}());