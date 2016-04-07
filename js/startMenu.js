DA5Game.startMenu = function(game) {
    this.startBG;
    this.startPrompt;
}

DA5Game.startMenu.prototype = {
	
	create: function () {
		titlescreen = this.add.image(0, 0, 'titlescreen');
        
		//var startPrompt = this.add.bitmapText(this.world.centerX-200, this.world.centerY+180, 'eightbitwonder', 'Press the SPACE key', 24);
        var startKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        startKey.onDown.addOnce(this.startGame, this);
        this.game.playerHealth = 0;
	},

	startGame: function () {
		this.state.start('worldgen');
	}
};