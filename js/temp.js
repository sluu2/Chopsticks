//Code Used to reinitialize the food location as well as the max number of food to spawn
        if (this.keyboard.isDown(Phaser.Keyboard.P)) {
            this.food.destroy();
            this.food = this.add.group();
            this.food.enableBody = true;
            this.game.numFood = 10;
            this.game.maxFood = 10;
            this.initializeFood();
            console.log(this.game.numFood);
        }

/*bullets.forEachExists(function(bullet) {    if (bullet.timeLeft > 0) {      bullet.timeLeft--;    }    else {      bullet.exists = false;    }  });*/

 if (this.keyboard.isDown(Phaser.Keyboard.P)){
            this.drone.remove(this.drone1);
            this.drone.remove(this.drone2);
            this.drone.remove(this.drone3);
            this.drone.remove(this.drone4);
            this.drone.remove(this.drone5);
            //this.drone.destroy();
        }

/*
    - Create drones in a ambiguous group and then call on them to move independently using timers
    
    - Create drones individually from a declared group and call them to move independently using timers
    
    - Create individual drones from multiple groups and have each group move independently

*/

/*
GAME IDEA 1 (Adv Programming Revision Proj):
    OBJECTS:
        BLOCK AND ENEMY TYPES:
            GROUND TILES
                FLOOR
                ARROW (FORCE DIRECTION)
                HOLE
                TRAPHOLE ()
                BUTTON (OPENS DOOR OR MOVES PLATFORM)
                COLLECTIBLE
            SOLID TILES
                WALL
                MOVING WALL (PLATFORM)
                GATE
                EXIT
            AI
                PATROL
                LASER WIRE
    GAMEPLAY:
        PLAYER moves strictly cardinally to reach a certain goal. The player will reach the goal by making use of the solid walls certain ground tiles while avoid traps and enemy AI. Collectibles may or may not be mandatory to complete the level (Mandatory would mean collecting all will unlock something | Unmandatory would mean simply for score)
    CONTEXT;
        LEVEL BY LEVEL DESIGN
        Could be good for a mobile platform.
    DIFFICULTIES:
        
        
GAME IDEA 2 (SURVIVAL):
    OBJECTS:
        BLOCK AND ENEMY TYPES:
            GROUND TILES:
                SLOWING TILE
                GROUND TILE (FLOOR TILE)
                WATER VIA LAKE
                WATER VIA STREAM (MOVES PLAYER)
            SOLID TILES
                SOLID ROCKS
                FORTRESS WALL
                DOOR
            AI
                ZOMBIE
    GAMEPLAY:
        PLAYER tries to survive as long as possible by collecting resources outside of the fortress while avoid enemy AI.
    CONTEXT:
        PRECEDURALLY OR RANDOMLY GENERATED LEVELS
        Algorithm HEAVY
    DIFFICULTIES:
        LEVEL GENERATION ALGORITHM <-- WIP
        ZOMBIE CHASING ALGORITHM
        

*/