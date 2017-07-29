/**
 * Modifies the game settings according to the current time
 */

(function() {
    Events.add("gamesong", function() {        
        
        GameStage.background.colors = [
            [0  ,0  ,0.5],
            [0  ,0  ,0  ]
        ];
        
        this.at("22336ms", function() {
            // Black out
            Game.log("black out");
            
            GameStage.forecolor.color = new Color();
            
            Tweener.to(0, 1, "10ms", function(v) {
                GameStage.forecolor.alpha = v;
            }, function() {
                GameStage.silhouette.alpha = 0;
                GameStage.background.alpha = 1;
                
                GameStage.background.length = 2000;
            });
            
        }).at("22528ms", function() {
            // White flash, hide silhouette, next level
            Game.log("white flash, hide silhouette, next level");
            
			GameStage.map.speed = 0.3;
			
            Tweener.to(0, 1, "5ms", function(v) {
                GameStage.forecolor.color = new Color(v, v, v);
            }, function() {
                Game.level++;
                setTimeout(function() {
                    Tweener.to(1, 0, "50ms", function(v) {
                        GameStage.forecolor.alpha = v;
                    });
                }, 10);
            });
        }).at("33656ms", function() {
            // Start map closing in for 9607ms
            Game.log("start map closing in");
            
            /*Tweener.to(Generators.default.erodeChance, 0.4, "9607ms", function(v) {
                Generators.default.erodeChance = v;
            });*/
        }).at("43247ms", function() {
            // Blocks fall apart
            Game.log("blocks fall apart");
            
            var moveInDirection = function(dir) {
                for (var i = 0; i < GameStage.map.groups.length; i++) {
                    var mapGroup = GameStage.map.groups[i];
                    for (var x = 0; x < mapGroup.length; x++) {
                        var mapColumn = mapGroup[x];
                        
                        for (var y = 0; y < mapColumn.blocks.length; y++) {
                            var block = mapColumn.blocks[y];
                            
                            var isInverted = i === 0;
                            
                            if (block.currentMoveDirection !== dir) {
                                block.direction.y = (1 + (Math.random() * 0.5)) * (i === 1 ? -1 : 1) * dir;
                                block.currentMoveDirection = dir;
                                block.rotationSpeed = 5 + Math.random() * 5;
                            }
                        }
                    }
                }
            };
            
            Game.level++;
            
            GameStage.background.alpha = 0;
            
            // Tween all blocks downwards
            Tweener.to(0, 180, "200ms", function(v) {
                moveInDirection(1);
            });
        }).at("44592ms", function() {
            // Rainbow flash, next level
            Game.log("rainbow flash");
            
			GameStage.map.speed = 0.5;
			
            GameStage.background.colors = Primitives.colorCycle.defaultColors;
            GameStage.background.length = 1000;
        }).at("66528ms", function() {
            // Alternating one side, other side
            Game.log("alternating sides");
            
            GameStage.background.alpha = 0.5;
            Game.level++;
        }).at("77544ms", function() {
            // Rainbow background
            Game.log("rainbow background");
            
            Game.level++;
        }).at("87792ms", function() {
            // Fast background
            Game.log("fast background");
            
            GameStage.background.length = 50;
        }).at("87856ms", function() {
            // More basic generator, calm background
            Game.log("more basic generator, calm background");
            
            GameStage.background.colors = [
                [0  ,0  ,1  ],
                [0  ,0  ,0  ]
            ];
            GameStage.background.length = 1000;
            
            Game.level++;
        }).at("97431ms", function() {
            // Background speed up
            Game.log("background speed up");
            
            GameStage.background.length = 50;
        }).at("98408ms", function() {
            // Black out to 0.2 alpha
            Game.log("black out");
            
            GameStage.background.length = 1000;
            
            GameStage.forecolor.color = new Color(1, 1, 1);
            GameStage.forecolor.alpha = 0.9;
        }).at("98776ms", function() {
            // Fade in for 753ms
            Game.log("fade in");
            
            Tweener.to(0.8, 0, "100ms", function(v) {
                GameStage.forecolor.alpha = v;
            });
        }).at("99496ms", function() {
            // Very hard generator, dazzling colors
            Game.log("very hard, dazzling colors");
            
			GameStage.map.speed = 0.6;
			
            GameStage.background.colors = Primitives.colorCycle.defaultColors;
            GameStage.background.length = 100;
            
            Game.level--;
        }).at("120087ms", function() {
            // Generic generator, occasional spikes
            Game.log("generic, occasional spikes");
            
			GameStage.map.speed = 0.5;
            Game.level = 6;
            
            Tweener.to(GameStage.background.alpha, 0, "100ms", function(v) {
                GameStage.background.alpha = v;
            });
        }).at("131280ms", function() {
            // Slow down
			GameStage.map.speed = 0.2;
            Game.log("slow down");
        }).at("132496ms", function() {
            // Very, very fast and hard
            
			GameStage.map.speed = 0.7;
            Game.level = 7;
            GameStage.background.alpha = 0.5;
            GameStage.background.length = 50;
            
            Game.log("very very fast and hard");
        }).at("154352ms", function() {
            // White flash, slow down, just bottom, easy generator
            Game.log("white flash, slow down, just bottom, easy generator");
            
			GameStage.map.speed = 0.4;
            GameStage.background.alpha = 0;
            
            GameStage.forecolor.color = new Color(1, 1, 1);
            Tweener.to(0, 1, "5ms", function(v) {
                GameStage.forecolor.alpha = v;
            }, function() {
                setTimeout(function() {
                    Tweener.to(1, 0, "100ms", function(v) {
                        GameStage.forecolor.alpha = v;
                    });
                }, 10);
            });
            
            Game.level = 2;
        }).at("214690ms", function() {
            // Fade out for 23761ms, completely flat
            Game.log("slow fade out");
            
			GameStage.map.speed = 0.2;
            Game.level = 1;
            
            GameStage.forecolor.color = new Color();
            Tweener.to(0, 1, "500ms", function(v) {
                GameStage.forecolor.alpha = v;
            });
        }).at("224932ms", function() {
            Game.log("DONE");
			States.change("death");
        });
        
        var video = document.getElementById("video");
        video.currentTime = 0;
        video.play();
        //Sound.play("game_1", false);
    });
}());