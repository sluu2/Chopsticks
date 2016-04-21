DA5Game.worldgen = function(game) {
    this.ready = false;
};

DA5Game.worldgen.prototype = {
	preload: function () {

	},

	create: function () {
        /* ------------------------------ GAME LOGIC VARIABLES ------------------------------ */
        
        /* Player Variables */
        this.game.speed;
        this.game.normal = 108;             // Player movement speed on non slowing tiles
        this.game.slow = 80;                // Player movement speed on slowing tiles
        this.game.stop = 0;                 // Stop player movement when interacting
        
        // Reset Player Statistics when new game has started
        if (this.game.playerHealth === 0 || this.game.playerHealth === undefined) {
            // Player stats reset
            this.game.playerMaxHealth = 3;
            this.game.playerMaxHunger = 3;
            this.game.playerMaxThirst = 3;
            this.game.playerHealth = 3;
            this.game.playerHunger = 3;
            this.game.playerThirst = 3;
            this.game.resourceCount = 500;
            
            // Player items reset
            this.game.slot1 = 0;
            this.game.slot2 = 0;
            this.game.medKit = 0;
            this.game.pulseRounds = 0;
            this.game.shieldCount = 0;
            this.game.hasShield = false;
            
            // Day/Event variable reset
            this.game.light = 1;
            this.game.day = 1;
            this.game.dayState = undefined;
            this.game.randomEvent1 = undefined;
            this.game.infrared = false;
        }
        
        // Drone Patrol Subgroup Move Times
        this.game.moveTime1 = this.rnd.integerInRange(0, 3) * Phaser.Timer.SECOND;
        this.game.moveTime2 = this.rnd.integerInRange(0, 3) * Phaser.Timer.SECOND;
        this.game.moveTime3 = this.rnd.integerInRange(0, 3) * Phaser.Timer.SECOND;
        this.game.moveTime4 = this.rnd.integerInRange(0, 3) * Phaser.Timer.SECOND;
        this.game.moveTime5 = this.rnd.integerInRange(0, 3) * Phaser.Timer.SECOND;
        
        /* STANDARD TIMERS */
        this.game.damageImmuneTime = 2 * Phaser.Timer.SECOND;       // Immunity duration before being able to be damaged by enemy
        this.game.healthDecay = 5 * Phaser.Timer.SECOND;            // Health Decay Rate if Hunger and/or Thirst is 0
        this.game.thirstRestoreL = 1 * Phaser.Timer.SECOND;         // Thirst Restore Rate (Lake)
        this.game.thirstRestoreR = 1.5 * Phaser.Timer.SECOND;       // Thirst Restore Rate (River)
        this.game.foodRespawn = 5 * Phaser.Timer.SECOND;            // Time before food respawns after inactivity
        this.game.eventLabelTimer = 4 * Phaser.Timer.SECOND;
        
        /* NON TUNABLE VARIABLES */
        this.game.losingHealth = false;     // Is the player losing health albeit has no hunger or thirst?
        this.game.interact = false;         // Is the player pressing the interact key?
        this.game.isSlowed = false;         // Is the player on a slowing tile?
        this.game.dayCycle = 16 * Phaser.Timer.SECOND;      // Time between each cycle
        this.game.pulseSpeed = 250
        this.game.stunDuration = 5 * Phaser.Timer.SECOND;
        
        if (this.game.dayState === undefined || this.game.dayState === 'night'){
            this.game.dayState = 'day';
            this.worldSeedCreate();
        }
        else
            this.game.dayState = 'night';
        
        this.setEvent();
        this.spawningArrayInitialization();
	},

	update: function () {
	   	this.ready = true;
        this.state.start('game');
	},
    
    setEvent: function() {
        console.log('Game Day: ' + this.game.day);
        
        if (this.game.randomEvent1 === 1 || this.game.randomEvent2 === 1) {         // ABUNDANCE
            this.game.maxFood = 10;
            this.game.numFood = 10;
        }
        else  if (this.game.randomEvent1 === 2 || this.game.randomEvent2 === 2) {   // FAMINE
            this.game.maxFood = 3;
            this.game.numFood = 3;
        }
        else {
            this.game.maxFood = 5;
            this.game.numFood = 5;
        }
        
        
        if (this.game.randomEvent1 === 3 || this.game.randomEvent2 === 3)           // SURPLUS
            this.game.maxResource = 10;
        else if (this.game.randomEvent1 === 4 || this.game.randomEvent2 === 4)      // SCARCITY
            this.game.maxResource = 3;
        else 
            this.game.maxResource = 5;
        
        
        if (this.game.randomEvent1 === 5 || this.game.randomEvent2 === 5)                       // QUENCH
            this.game.thirstDecay = 15 * Phaser.Timer.SECOND;
        else if (this.game.randomEvent1 === 6 || this.game.randomEvent2 === 6)                  // DEHYDRATION
            this.game.thirstDecay = 8 * Phaser.Timer.SECOND;
        else
            this.game.thirstDecay = 10 * Phaser.Timer.SECOND;
        
        
        if (this.game.randomEvent1 === 7 || this.game.randomEvent2 === 7)                           // SATIATION
            this.game.hungerDecay = 15 * Phaser.Timer.SECOND;
        else if (this.game.randomEvent1 === 8 || this.game.randomEvent2 === 8)                      // STARVATION
            this.game.hungerDecay = 8 * Phaser.Timer.SECOND;
        else
            this.game.hungerDecay = 10 * Phaser.Timer.SECOND;
        
        
        if (this.game.randomEvent1 === 9 || this.game.randomEvent2 === 9)               // LOW ALERT
            this.game.maxDrones = 5;
        else if (this.game.randomEvent1 === 10 || this.game.randomEvent2 === 10)        // HIGH ALERT
            this.game.maxDrones = 15;
        else
            this.game.maxDrones = 5;
        
        
        if (this.game.randomEvent1 === 11 || this.game.randomEvent2 === 11)             // AGILITY
            this.game.droneSpeed = 75;
        else
            this.game.droneSpeed = 50;
    },
    
    worldSeedCreate: function() {
        //POSITION MULTIPLIER TO BE ABLE TO MAP TILES FOR SPAWNING
        this.game.posMult = 32;
        this.game.map = this.game.add.tilemap('map');
        this.game.map.addTilesetImage('tiles','tiles');
        
        /* BASE GENERATION CONDITIONS*/
        this.game.riverDeco;
        this.game.riverDecoAlt;
        this.game.riverGenAlt =  0;
        this.game.multiRiv = this.rnd.integerInRange(0, 3);
        
        this.game.supGen = this.rnd.integerInRange(1, 2);
        this.game.lakeGen = this.rnd.integerInRange(0, 8);
        
        // Best method of changing the percentage change is by setting a range and using modulus:
        this.game.zone1Gen = this.rnd.integerInRange(1, 3);
        this.game.zone1Gen = this.game.zone1Gen % 2;
        this.game.zone2Gen = this.rnd.integerInRange(1, 3);
        this.game.zone2Gen = this.game.zone2Gen % 2;
        this.game.zone3Gen = this.rnd.integerInRange(1, 3);
        this.game.zone3Gen = this.game.zone3Gen % 2;
        this.game.zone4Gen = this.rnd.integerInRange(1, 3);
        this.game.zone4Gen = this.game.zone4Gen % 2;
        this.game.zone5Gen = this.rnd.integerInRange(1, 3);
        this.game.zone5Gen = this.game.zone5Gen % 2;
        this.game.zone6Gen = this.rnd.integerInRange(1, 3);
        this.game.zone6Gen = this.game.zone6Gen % 2;
        this.game.zone7Gen = this.rnd.integerInRange(1, 3);
        this.game.zone7Gen = this.game.zone7Gen % 2;
        
        this.game.riverDeco = this.rnd.integerInRange(1, 5);
        this.game.riverDeco = this.game.riverDeco % 2;
        this.game.riverDecoAlt = this.rnd.integerInRange(1, 5);
        this.game.riverDecoAlt = this.game.riverDecoAlt % 2;
        this.game.zone4Deco = this.rnd.integerInRange(1, 5);
        this.game.zone4Deco =  this.game.zone4Deco % 2;
        
        this.game.s1Deco = this.rnd.integerInRange(1, 3);
        this.game.s1Deco = this.game.s1Deco % 2;
        this.game.s2Deco = this.rnd.integerInRange(1, 3);
        this.game.s2Deco = this.game.s1Deco % 2;
        this.game.s3Deco = this.rnd.integerInRange(1, 3);
        this.game.s3Deco = this.game.s3Deco % 2;
        this.game.s4Deco = this.rnd.integerInRange(1, 3);
        this.game.s4Deco = this.game.s4Deco % 2;
        
        /*
        RIVER GENERATION ALGORITHMS
        KEY
            1 = River1a
            2 = River1b
            3 = River2b
            4 = River2a
        */
        switch (this.game.lakeGen){
            case 1:
            case 2:
                this.game.riverGen = this.rnd.integerInRange(3, 4);
                break;
            case 3:
            case 4:
                if (this.game.multiRiv != 0)
                    this.game.riverGen = this.rnd.integerInRange(2, 4);
                else{
                    this.game.riverGen = this.rnd.integerInRange(3, 4); 
                    this.game.riverGenAlt = 2;
                }
                break;
            case 5:
            case 6:
                this.game.riverGen = this.rnd.integerInRange(1, 2);
                break;
            case 7:
            case 8:
                if (this.game.multiRiv != 0)
                    this.game.riverGen = this.rnd.integerInRange(1, 3);
                else {
                    this.game.riverGen = this.rnd.integerInRange(1, 2); 
                    this.game.riverGenAlt = 3;
                }  
                break;
            default:
                this.game.riverGen = this.rnd.integerInRange(1, 2);
                this.game.riverGenAlt = this.rnd.integerInRange(3, 4);
                break;
        }
    },
    
    spawningArrayInitialization: function() {
        /* SPAWNING ARRAYS */
        this.game.spawnExclX = [];
        this.game.spawnExclY = [];
        //Supply Exclusion
        for (i = 15; i <= 19; i++){
            for (j = 0; j <= 4; j++){
                this.game.spawnExclX.push(i);
                this.game.spawnExclY.push(j);
            }
        }
        //Spawn Exclusion
        for (k = 0; k <= 6; k++){
            for (l = 13; l <= 19; l++){
                this.game.spawnExclX.push(k);
                this.game.spawnExclY.push(l);
            }
        }
        this.game.sup1X = [16, 15, 16, 15, 16, 17, 18, 16, 17];
        this.game.sup1Y = [1, 2, 2, 3, 3, 3, 3, 4, 4];
        this.game.sup2X = [15, 16, 16, 15, 18, 19, 15, 16, 19];
        this.game.sup2Y = [0, 0, 1, 3, 3, 3, 4, 4, 4];
        
        this.game.zone1rX = [0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 0, 1, 0, 1, 0];
        this.game.zone1rY = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 3, 4];
        this.game.zone2rX = [10, 11, 9, 10, 11, 12, 13, 8, 9, 10, 11, 12, 13, 10, 11, 12];
        this.game.zone2rY = [2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5];
        this.game.zone3rX = [2, 4, 5, 2, 3, 4, 5, 1, 2, 3, 4, 2, 3, 4, 3, 4];
        this.game.zone3rY = [7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11];
        this.game.zone4rX = [9, 8, 9, 10, 11, 8, 9, 10, 11, 7, 8, 9, 10, 11, 8, 9];
        this.game.zone4rY = [8, 9, 9, 9, 9, 10, 10, 10, 10, 11, 11, 11, 11, 11, 12, 12];
        this.game.zone5rX = [15, 16, 15, 16, 14, 15, 16, 17, 14, 15, 16, 17, 14, 15, 16, 15];
        this.game.zone5rY = [6, 6, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11];
        this.game.zone6rX = [12, 11, 12, 13, 9, 10, 11, 12, 10, 11, 12, 10, 11, 12, 10, 11];
        this.game.zone6rY = [14, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19];
        this.game.zone7rX = [19, 19, 18, 19, 17, 18, 19, 16, 17, 18, 19, 15, 16, 17, 18, 19];
        this.game.zone7rY = [14, 15, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 19];
        this.game.deco1arX = [3, 6, 7, 11, 13];
        this.game.deco1arY = [5, 4, 6, 0, 1];
        this.game.deco1brX = [0, 1, 0, 2, 5];
        this.game.deco1brY = [6, 9, 12, 13, 13];
        this.game.deco2arX = [15, 16, 18, 19, 18];
        this.game.deco2arY = [15, 13, 12, 10, 6];
        this.game.deco2brX = [6, 8, 9, 12, 13];
        this.game.deco2brY = [15, 18, 14, 19, 12];
        this.game.decoCrX = [8, 11, 12];
        this.game.decoCrY = [6, 7, 7];
        this.game.decoS1rX = [3, 4, 6, 8, 13];
        this.game.decoS1rY = [5, 3, 4, 1, 1];
        this.game.decoS2rX = [5, 1, 0, 2, 5];
        this.game.decoS2rY = [9, 9, 12, 13, 13];
        this.game.decoS3rX = [6, 8, 9, 12, 11];
        this.game.decoS3rY = [15, 18, 14, 10, 14];
        this.game.decoS4rX = [15, 16, 18, 18, 19];
        this.game.decoS4rY = [16, 13, 11, 9, 6];
        
        this.game.zone1sX = [3, 4, 5, 6, 2, 3, 4, 5, 0, 1, 2, 3, 0, 1, 2, 0];
        this.game.zone1sY = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4];
        this.game.zone2sX = [12, 11, 12, 13, 10, 11, 12, 13, 14, 8, 9, 10, 11, 12, 9, 10];
        this.game.zone2sY = [1, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5];
        this.game.zone3sX = [2, 3, 4, 5, 3, 4, 5, 2, 3, 4, 1, 2, 3, 4, 1, 2];
        this.game.zone3sY = [7, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10, 10, 11, 11];
        this.game.zone4sX = [9, 10, 8, 9, 10, 11, 8, 9, 10, 11, 7, 8, 9, 10, 8, 9];
        this.game.zone4sY = [8, 8, 9, 9, 9, 9, 10, 10, 10, 10, 11, 11, 11, 11, 12, 12];
        this.game.zone5sX = [15, 16, 14, 15, 16, 17, 14, 15, 16, 17, 14, 15, 16, 15, 16, 15];
        this.game.zone5sY = [6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 10, 10, 11];
        this.game.zone6sX = [12, 11, 12, 13, 9, 10, 11, 12, 10, 11, 12, 10, 11, 12, 10, 11];
        this.game.zone6sY = [14, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19];
        this.game.zone7sX = [19, 18, 19, 18, 19, 17, 18, 19, 16, 17, 18, 19, 15, 16, 17, 18];
        this.game.zone7sY = [14, 15, 15, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19];
        this.game.deco1asX = [5, 6, 10, 11, 12];
        this.game.deco1asY = [4, 3, 1, 1, 0];
        this.game.deco1bsX = [2, 0, 0, 0, 1];
        this.game.deco1bsY = [13, 12, 9, 8, 8];
        this.game.deco2asX = [14, 18, 19, 18, 17];
        this.game.deco2asY = [13, 12, 11, 6, 5];
        this.game.deco2bsX = [8, 7, 7, 8, 13];
        this.game.deco2bsY = [18, 15, 14, 14, 12];
        this.game.decoCsX = [10, 13, 12];
        this.game.decoCsY = [6, 7, 9];
        this.game.decoS1sX = [3, 4, 6, 7, 13];
        this.game.decoS1sY = [5, 3, 4, 1, 1];
        this.game.decoS2sX = [5, 3, 0, 2, 5];
        this.game.decoS2sY = [9, 7, 12, 13, 13];
        this.game.decoS3sX = [6, 8, 9, 12, 11];
        this.game.decoS3sY = [15, 18, 14, 9, 14];
        this.game.decoS4sX = [15, 16, 18, 18, 19];
        this.game.decoS4sY = [16, 13, 11, 9, 6];
        
        this.game.lake1aX = [0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 1, 2, 3];
        this.game.lake1aY = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5];
        this.game.lake1bX = [0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 3, 4, 5];
        this.game.lake1bY = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5];
        this.game.lake2aX = [8, 9, 10, 11, 12, 13, 8, 9, 10, 11, 12, 13, 14, 8, 9, 10, 11, 12, 13, 14, 8, 9, 10, 11, 12, 13, 14, 9, 10, 11, 12, 13, 14, 10, 11, 12];
        this.game.lake2aY = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5];
        this.game.lake2bX = [8, 9, 10, 11, 12, 7, 8, 9, 10, 11, 12, 13, 7, 8, 9, 10, 11, 12, 13, 7, 8, 9, 10, 11, 12, 13, 9, 10, 11, 12, 13, 8, 9, 10, 11, 12];
        this.game.lake2bY = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5];
        this.game.lake3aX = [16, 17, 18, 15, 16, 17, 18, 19, 14, 15, 16, 17, 18, 19, 14, 15, 16, 17, 18, 19, 14, 15, 16, 17, 18, 19, 14, 15, 16, 17, 18, 19, 15, 16, 17, 18];
        this.game.lake3aY = [13, 13, 13, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19];
        this.game.lake3bX = [16, 17, 18, 15, 16, 17, 18, 19, 15, 16, 17, 18, 19, 14, 15, 16, 17, 18, 19, 14, 15, 16, 17, 18, 19, 15, 16, 17, 18, 19, 15, 16, 17, 18, 16, 17];
        this.game.lake3bY = [12, 12, 12, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19];
        this.game.lake4aX = [16, 17, 18, 15, 16, 17, 18, 19, 14, 15, 16, 17, 18, 19, 14, 15, 16, 17, 18, 19, 14, 15, 16, 17, 18, 19, 14, 15, 16, 17, 18, 19, 15, 16, 17, 18];
        this.game.lake4aY = [6, 6, 6, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12];
        this.game.lake4bX = [16, 17, 18, 15, 16, 17, 18, 19, 14, 15, 16, 17, 18, 19, 14, 15, 16, 17, 18, 19, 14, 15, 16, 17, 18, 19, 15, 16, 17, 18, 19, 16, 17, 18, 19, 19];
        this.game.lake4bY = [5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11, 11, 11, 11, 12];
        
        this.game.river1aX = [7, 8, 9, 10, 6, 7, 8, 4, 5, 6, 7, 3, 4, 5, 1, 2, 3, 4, 1, 2, 0, 1, 0, 0];
        this.game.river1aY = [0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 6, 6, 7, 8];
        this.game.river1bX = [1, 0, 1, 2, 2, 3, 4, 5, 6, 6, 6, 5, 6, 5, 6, 5, 6, 1, 2, 3, 4, 5, 0, 1];
        this.game.river1bY = [4, 5, 5, 5, 6, 6, 6, 6, 6, 7, 8, 9, 9, 10, 10, 11, 11, 12, 12, 12, 12, 12, 13, 13];
        this.game.river2aX = [19, 19, 18, 19, 17, 18, 17, 18, 17, 17, 17, 16, 17, 15, 16, 17, 13, 14, 15, 13, 14, 15, 12, 13];
        this.game.river2aY = [7, 8, 9, 9, 10, 10, 11, 11, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19];
        this.game.river2bX = [10, 11, 12, 13, 10, 11, 13, 14, 8, 9, 10, 14, 8, 13, 14, 7, 8, 13, 14, 7, 13, 6, 7, 13];
        this.game.river2bY = [13, 13, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15, 16, 16, 16, 17, 17, 17, 17, 18, 18, 19, 19, 19];
    },
    
};