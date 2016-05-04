DA5Game.loseState = function(game) {
    this.startBG;
    this.startPrompt;
}

DA5Game.loseState.prototype = {
	
	create: function () {
		startBG = this.add.image(0, 0, 'loseSplash');
        this.game.playerHealth = 0;
        var startKey = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        startKey.onDown.addOnce(this.startGame, this);
	},

	startGame: function () {
		this.state.start('startMenu');
	},
    
    update: function() {
        if (this.game.phase1.isPlaying)
            this.game.phase1.stop();
        else if (this.game.phase2.isPlaying)
            this.game.phase2.stop();
        else if (this.game.bossMusic.isPlaying)
            this.game.bossMusic.stop();
        
        if (!this.game.loseMusic.isPlaying) {
            this.game.loseMusic.play();
            this.game.loseMusic.volume = 0.1;
        }
    },
};