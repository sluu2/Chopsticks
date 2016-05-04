DA5Game.winState = function(game) {
    this.startBG;
    this.startPrompt;
}

DA5Game.winState.prototype = {
	
	create: function () {
		startBG = this.add.image(0, 0, 'winSplash');
        this.game.playerHealth = 0;
        var startKey = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        startKey.onDown.addOnce(this.startGame, this);
	},

	startGame: function () {
		this.state.start('startMenu');
	},
    
    update: function() {
        if (this.game.bossMusic.isPlaying)
            this.game.bossMusic.stop();
        
        if (this.game.phase1.isPlaying)
            this.game.phase1.stop();
        else if (this.game.phase2.isPlaying)
            this.game.phase2.stop();
        
        if (!this.game.winMusic.isPlaying) {
            this.game.winMusic.play();
            this.game.winMusic.volume = 0.1;
        }
    },
};