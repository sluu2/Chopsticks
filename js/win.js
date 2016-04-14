DA5Game.winState = function(game) {
    this.startBG;
    this.startPrompt;
}

DA5Game.winState.prototype = {
	
	create: function () {
		startBG = this.add.image(0, 0, 'winSplash');
        this.game.playerHealth = 0;
        var startKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        startKey.onDown.addOnce(this.startGame, this);
	},

	startGame: function () {
		this.state.start('startMenu');
	}
};