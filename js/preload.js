/*
CS 480
3/22/17
Samuel Luu
*/
var Chopsticks = {}

Chopsticks.preload = function(game) {
    this.preloadBar = null;
    this.titleText = null;
    this.ready = false;
};

Chopsticks.preload.prototype = {
	preload: function () {
        
        /* MENUS START*/
        /* Menus END */
        
        /* Visual Assets START*/
        this.load.spritesheet('select', 'assets/img/select.png', 220, 100);
        this.load.spritesheet('background', 'assets/img/background.png', 480, 480);
        this.load.spritesheet('start', 'assets/img/start.png', 480, 480);
        this.load.spritesheet('gamestatistics', 'assets/img/gamestate.png', 480, 480);
        this.load.image('button', 'assets/img/button.png');
        this.load.image('pPoint', 'assets/img/pPoint.png');
        this.load.image('aPoint', 'assets/img/aPoint.png');
        this.load.image('split', 'assets/img/split.png');
        this.load.image('splitbutton', 'assets/img/splitbutton.png');
        /* VisualAssets END*/
	},

	create: function () {
	},

	update: function () {
	   	this.ready = true;
        this.state.start('game');
	},
};