DA5Game.preload = function(game) {
    this.preloadBar = null;
    this.titleText = null;
    this.ready = false;
};

DA5Game.preload.prototype = {
	preload: function () {
		this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY + 64, 'preloaderBar');
		this.preloadBar.anchor.setTo(0.5, 0.5);
		this.load.setPreloadSprite(this.preloadBar);
        
        /* MENUS START*/
        this.load.image('titlescreen', 'assets/img/titlescreen.png');
        this.load.image('demoscreen', 'assets/img/demo.png');
        this.load.spritesheet('craftMenu', 'assets/img/craftMenu.png', 416, 256);
        this.load.spritesheet('supplyPrompt', 'assets/img/supplyPrompt.png', 416, 256);
        this.load.image('slotPrompt', 'assets/img/slotPrompt.png');
        this.load.image('exitMenu', 'assets/img/exitMenu.png');
        this.load.image('winSplash', 'assets/img/winSplash.png');
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
        this.load.image('turret', 'assets/img/turret.png');
        
        // Night State assets
        this.load.image('light1', 'assets/img/light1.png');
        this.load.image('light2', 'assets/img/light2.png');
        this.load.image('darken', 'assets/img/darken.png');
        
        //Day Labels
        this.load.image('day1', 'assets/img/1.png');
        this.load.image('day2', 'assets/img/2.png');
        this.load.image('day3', 'assets/img/3.png');
        this.load.image('day4', 'assets/img/4.png');
        this.load.image('day5', 'assets/img/5.png');
        this.load.image('day6', 'assets/img/6.png');
        this.load.image('day7', 'assets/img/7.png');
        
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
        this.load.image('refridgerator', 'assets/img/refridgerator.png');
        this.load.image('canteen', 'assets/img/canteen.png');
        this.load.image('waterjug', 'assets/img/waterjug.png');
        this.load.image('mushroom', 'assets/img/mushroom.png');
        this.load.image('diamondarmor', 'assets/img/diamondarmor.png');
        this.load.image('lamp', 'assets/img/lamp.png');
        this.load.image('irgoggles', 'assets/img/infrared.png');
        
        /* VisualAssets END*/
	},

	create: function () {
		this.preloadBar.cropEnabled = false;
	},

	update: function () {
	   	this.ready = true;
        this.state.start('startMenu');
	}
};