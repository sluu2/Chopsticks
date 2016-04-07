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
        
        /* Start Menu Start */
        
        this.load.image('titlescreen', 'assets/img/titlescreen.png');
        this.load.bitmapFont('eightbitwonder', 'assets/fonts/eightbitwonder.png', 'assets/fonts/eightbitwonder.fnt');
        
        this.load.image('demoscreen', 'assets/img/demo.png');
        this.load.image('winSplash', 'assets/img/winSplash.png');
        /* Start Menu END */
        
        /* Game Assets START*/
        this.load.tilemap('map', 'assets/map/world.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('grid', 'assets/img/grid.png');  
        this.load.image('tiles', 'assets/img/tiles.png');
        this.load.image('rock', 'assets/img/rock.png');
        this.load.image('water', 'assets/img/water.png');
        this.load.image('sand', 'assets/img/sand.png');
        this.load.image('entrance', 'assets/img/entrance.png');
        this.load.image('boundary', 'assets/img/boundary.png');
        
        this.load.image('heart', 'assets/img/heart.png');
        this.load.image('drop', 'assets/img/drop.png');
        this.load.image('foodIco', 'assets/img/foodico.png');
        this.load.image('healthsq', 'assets/img/healthstat.png');
        this.load.image('hungersq', 'assets/img/hungerstat.png');
        this.load.image('thirstsq', 'assets/img/thirststat.png');
        
        this.load.image('food', 'assets/img/food.png');
        this.load.image('resource', 'assets/img/resource.png');
        this.load.image('drone', 'assets/img/drone.png');
        
        this.load.image('light1', 'assets/img/light1.png');
        this.load.image('light2', 'assets/img/light2.png');
        this.load.image('darken', 'assets/img/darken.png');
        this.load.spritesheet('space', 'assets/img/space.png', 32, 8);
        
        this.load.image('day1', 'assets/img/1.png');
        this.load.image('day2', 'assets/img/2.png');
        this.load.image('day3', 'assets/img/3.png');
        this.load.image('day4', 'assets/img/4.png');
        this.load.image('day5', 'assets/img/5.png');
        this.load.image('day6', 'assets/img/6.png');
        this.load.image('day7', 'assets/img/7.png');
        
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
        
        this.load.spritesheet('player', 'assets/img/player.png', 16, 16);
        this.load.image('win', 'assets/img/win.png');
        /* Game Assets END*/
	},

	create: function () {
		this.preloadBar.cropEnabled = false;
	},

	update: function () {
	   	this.ready = true;
        this.state.start('startMenu');
	}
};