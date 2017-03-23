var DA5Game = {};

DA5Game.boot = function(game) {};

DA5Game.boot.prototype = {
    preload: function() {
        this.load.image('preloaderBar', 'assets/img/boss/boss.png');
        this.load.image('loading', 'assets/img/loading.png');
        this.load.image('launching', 'assets/img/launching.png');
    },
    
    create: function() {
        //USE THIS.GAME.VAR TO CREATE GLOBAL VARIABLES
        this.physics.startSystem(Phaser.Physics.ARCADE);
        
        this.input.maxPointers = 1;
		this.stage.disableVisibilityChange = false;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
		this.stage.forcePortrait = true;

		this.input.addPointer();
        this.stage.backgroundColor = '#000000';
        
        this.state.start('preload');
    }
}