DA5Game.preload = function(game) {
    this.preloadBar = null;
    this.titleText = null;
    this.ready = false;
    
};

DA5Game.preload.prototype = {
	preload: function () {
		this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloaderBar');
		this.preloadBar.anchor.setTo(0.5, 0.5);
		this.load.setPreloadSprite(this.preloadBar);
        this.loadingImg = this.add.sprite(this.world.centerX, this.world.centerY + 96, 'loading');
        this.loadingImg.anchor.x = 0.5;
        this.loadingImg.anchor.y = 0.5;
        this.launchingImg = this.add.sprite(this.world.centerX, this.world.centerY + 96, 'launching');
        this.launchingImg.anchor.x = 0.5;
        this.launchingImg.anchor.y = 0.5;
        this.launchingImg.visible = false;
        
        /* AUDIO ASSETS START */
        this.load.audio('kittyrock', 'assets/audio/Aqua Kitty OST - Kitty Rock.ogg');
        this.load.audio('photosynthesis', 'assets/audio/Fittest - Photosynthesis.ogg');
        this.load.audio('cobalt', 'assets/audio/Fittest - Dreams of Cobalt.ogg');
        this.load.audio('heavyindustry', 'assets/audio/Fittest - Heavy Industry.mp3');
        this.load.audio('aroundtheworld', 'assets/audio/Castle Crashers - Race Around the World.ogg');
        this.load.audio('glacial', 'assets/audio/Fittest - Glacial Reflection.ogg');
        
        this.load.audio('ring', 'assets/audio/ring.ogg');
        this.load.audio('hurt', 'assets/audio/hurt.ogg');
        this.load.audio('jab', 'assets/audio/jab.mp3');
        /* AUDIO ASSETS END */
        
        /* MENUS START*/
        this.load.image('title', 'assets/img/title.png');
        this.load.image('showcase', 'assets/img/showcase.png');
        this.load.spritesheet('pressstart', 'assets/img/start.png', 228, 23);
        this.load.image('blank', 'assets/img/blank.png');
        this.load.spritesheet('startMenu', 'assets/img/startMenu.png', 480, 480);
        this.load.image('startMenuControl', 'assets/img/startMenuControl.png', 480, 480);
        this.load.image('demoscreen', 'assets/img/demo.png');
        this.load.spritesheet('craftMenu', 'assets/img/craftMenu.png', 416, 256);
        this.load.spritesheet('supplyPrompt', 'assets/img/supplyPrompt.png', 416, 256);
        this.load.image('supplyPromptBoss', 'assets/img/supplyPromptBoss.png');
        this.load.image('slotPrompt', 'assets/img/slotPrompt.png');
        this.load.image('exitMenu', 'assets/img/exitMenu.png');
        this.load.image('winSplash', 'assets/img/winState.png');
        this.load.image('loseSplash', 'assets/img/loseState.png');
        /* Menus END */
        
        /* Visual Assets START*/
        //Tilemaps and tiles
        this.load.tilemap('map', 'assets/map/world.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('grid', 'assets/img/grid.png');  
        this.load.image('tiles', 'assets/img/tiles.png');
        this.load.image('rock', 'assets/img/rock.png');
        this.load.image('water', 'assets/img/water.png');
        this.load.image('sand', 'assets/img/sand.png');
        this.load.image('entrance', 'assets/img/entrance.png');
        this.load.image('boundary', 'assets/img/boundary.png');
        
        //Player Maintanence assets
        this.load.image('heart', 'assets/img/heart.png');
        this.load.image('drop', 'assets/img/drop.png');
        this.load.image('foodIco', 'assets/img/foodico.png');
        this.load.image('healthsq', 'assets/img/healthstat.png');
        this.load.image('hungersq', 'assets/img/hungerstat.png');
        this.load.image('thirstsq', 'assets/img/thirststat.png');
        
        // Player HUD assets
        this.load.spritesheet('inventoryKey', 'assets/img/inventoryKey.png', 32, 32);
        this.load.spritesheet('medico', 'assets/img/medico.png', 32, 32);
        this.load.spritesheet('shieldico', 'assets/img/shieldico.png', 32, 32);
        this.load.spritesheet('pulsico', 'assets/img/pulsico.png', 32, 32);
        this.load.image('consumablesCanvas', 'assets/img/consumablesCanvas.png');
        this.load.image('inventoryCanvas', 'assets/img/inventoryCanvas.png');
        this.load.spritesheet('timedial', 'assets/img/timedial.png', 64, 64);
        
        //Game Objects assets
        this.load.image('food', 'assets/img/food.png');
        this.load.image('resource', 'assets/img/resource.png');
        this.load.spritesheet('drone', 'assets/img/drone.png', 16, 16);
        this.load.spritesheet('turret', 'assets/img/turret.png', 24, 24);
        this.load.image('enemypulse', 'assets/img/enemypulse.png');
        
        //Boss
        this.load.spritesheet('bossdamaged', 'assets/img/boss/bossdamaged.png', 96, 96);
        this.load.spritesheet('bossbar', 'assets/img/boss/bossbar.png', 104, 24);
        this.load.image('boss', 'assets/img/boss/boss.png');
        this.load.image('bossMissile', 'assets/img/boss/bossMissile.png');
        this.load.image('bossBasic', 'assets/img/boss/bossPulse.png');
        this.load.image('bossFlame', 'assets/img/boss/beam.png');
        
        // Night State assets
        this.load.image('light1', 'assets/img/light2.png');
        this.load.image('light2', 'assets/img/light3.png');
        this.load.image('darken', 'assets/img/darken.png');
        
        //Day Labels
        this.load.image('day1', 'assets/img/1.png');
        this.load.image('day2', 'assets/img/2.png');
        this.load.image('day3', 'assets/img/3.png');
        this.load.image('day4', 'assets/img/4.png');
        this.load.image('day5', 'assets/img/5.png');
        this.load.image('day6', 'assets/img/6.png');
        this.load.image('day7', 'assets/img/7.png');
        this.load.image('day8', 'assets/img/8.png');
        
        // Dialogue
        this.load.spritesheet('dialogue1d', 'assets/img/dialogue1d.png', 480, 192);
        this.load.spritesheet('dialogue1n', 'assets/img/dialogue1n.png', 480, 192);
        this.load.spritesheet('dialogue2d', 'assets/img/dialogue2d.png', 480, 192);
        this.load.spritesheet('dialogue3d', 'assets/img/dialogue3d.png', 480, 192);
        this.load.spritesheet('dialogue5d', 'assets/img/dialogue5d.png', 480, 192);
        this.load.spritesheet('dialogue6d', 'assets/img/dialogue6d.png', 480, 192);
        this.load.spritesheet('dialogue7d', 'assets/img/dialogue7d.png', 480, 192);
        this.load.spritesheet('bossdialogue', 'assets/img/bossdialogue.png', 480, 192);
        this.load.spritesheet('conclusion', 'assets/img/conclusion.png', 480, 192);
        
        //Event Labels
        this.load.image('abundance', 'assets/img/abundance.png');
        this.load.image('famine', 'assets/img/famine.png');
        this.load.image('quench', 'assets/img/quench.png');
        this.load.image('dehydrate', 'assets/img/dehydration.png');
        this.load.image('starvation', 'assets/img/starvation.png');
        this.load.image('satiation', 'assets/img/satiation.png');
        this.load.image('lowalert', 'assets/img/lowalert.png');
        this.load.image('highalert', 'assets/img/highalert.png');
        this.load.image('agility', 'assets/img/agility.png');
        this.load.image('surplus', 'assets/img/surplus.png');
        this.load.image('scarcity', 'assets/img/scarcity.png');
        this.load.image('plus', 'assets/img/+.png');
        
        //Player and extraneous objects
        this.load.spritesheet('player', 'assets/img/player.png', 16, 16);
        this.load.spritesheet('shield', 'assets/img/shield.png', 32, 32);
        this.load.spritesheet('space', 'assets/img/space.png', 32, 8);
        this.load.image('pulse', 'assets/img/pulse.png');
        this.load.image('win', 'assets/img/win.png');
        
        //Supply item assets
        this.load.image('medkit', 'assets/img/medkit.png');
        this.load.image('shielditem', 'assets/img/shielditem.png');
        this.load.image('backpack', 'assets/img/backpack.png');
        this.load.image('picnicbasket', 'assets/img/picnicbasket.png');
        this.load.image('refrigerator', 'assets/img/refrigerator.png');
        this.load.image('canteen', 'assets/img/canteen.png');
        this.load.image('waterjug', 'assets/img/waterjug.png');
        this.load.image('mushroom', 'assets/img/mushroom.png');
        this.load.image('diamondarmor', 'assets/img/diamondarmor.png');
        this.load.image('lamp', 'assets/img/lamp.png');
        this.load.image('irgoggles', 'assets/img/infrared.png');
        this.load.image('pulsegun', 'assets/img/pulsegun.png');
        /* VisualAssets END*/
	},

	create: function () {
        /* SET ALL MUSIC HERE */
        this.game.menuTheme = this.add.audio('kittyrock');
        this.game.phase1 = this.add.audio('photosynthesis');
        this.game.phase2 = this.add.audio('cobalt');
        this.game.bossMusic = this.add.audio('heavyindustry');
        this.game.loseMusic = this.add.audio('glacial');
        this.game.winMusic = this.add.audio('aroundtheworld');
        this.game.ring = this.add.audio('ring');
        this.game.hurt = this.add.audio('hurt');
        this.game.jab = this.add.audio('jab');
		this.preloadBar.cropEnabled = false;
        
        this.delayLaunch = this.time.create(true);
        this.delayLaunch.add(5 * Phaser.Timer.SECOND, this.startGame, this);
        this.delayLaunch.start();
	},

	update: function () {
	   	this.ready = true;
        if (this.delayLaunch.running){
            this.loadingImg.visible = false;
            this.launchingImg.visible = true;
        }
	},
    
    startGame: function() {
        this.state.start('titlegen');
    },
};