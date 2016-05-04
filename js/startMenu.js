DA5Game.startMenu = function(game) {
    this.startBG;
    this.startPrompt;
}

DA5Game.startMenu.prototype = {
	
	create: function () {
        this.menuState = true;
        this.controlState = false;
        this.aboutState = false;
        this.menuOption = 0;
		this.menuscreen = this.add.image(0, 0, 'startMenu');
        this.menuscreen.frame = 0;
        this.controlmenu = this.add.image(0, 0, 'startMenuControl');
        this.controlmenu.visible = false;
        
        this.selectKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.selectKey.onDown.add(this.selectOption, this);
        this.selectKey2 = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.selectKey2.onDown.add(this.selectOption, this);
        this.upKey = this.input.keyboard.addKey(Phaser.Keyboard.W);
        this.downKey = this.input.keyboard.addKey(Phaser.Keyboard.S);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.upKey.onDown.add(this.menuOptionUp, this);
        this.cursors.up.onDown.add(this.menuOptionUp, this);
        this.downKey.onDown.add(this.menuOptionDown, this);
        this.cursors.down.onDown.add(this.menuOptionDown, this);
        
        // RETURN TO TITLE
        this.previousKey = this.input.keyboard.addKey(Phaser.Keyboard.ESC);
        this.previousKey.onDown.add(this.previousOption, this);
        
        this.game.playerHealth = 0;
        this.game.bossState = false;
	},
    
    update: function(){
        if (this.game.phase1.isPlaying)
            this.game.phase1.stop();
        else if (this.game.phase2.isPlaying)
            this.game.phase2.stop();
        else if (this.game.bossMusic.isPlaying)
            this.game.bossMusic.stop();
        else if (this.game.loseMusic.isPlaying)
            this.game.loseMusic.stop();
        else if (this.game.winMusic.isPlaying)
            this.game.winMusic.stop();
        
        if (this.game.menuTheme.volume != 0.1)
            this.game.menuTheme.volume = 0.1;
        if (!this.game.menuTheme.isPlaying){
            this.game.menuTheme.play();
        }
    },
    
    menuOptionUp: function() {
        if (this.menuState) {
            if (this.menuOption > 0)
                this.menuOption--;
            else
                this.menuOption = 1;
            
            switch(this.menuOption){
                case 0:
                    this.menuscreen.frame = 0;
                    break;
                case 1:
                    this.menuscreen.frame = 1;
                    break;
                default:
                    break;
            }
        }
    },
    
    menuOptionDown: function(){
        if (this.menuState) {
            if (this.menuOption < 1)
                this.menuOption++;
            else
                this.menuOption = 0;
            
            switch(this.menuOption){
                case 0:
                    this.menuscreen.frame = 0;
                    break;
                case 1:
                    this.menuscreen.frame = 1;
                    break;
                default:
                    break;
            }
        }
    },

	selectOption: function () {
        if (this.menuState) {
            switch (this.menuOption){
                case 0:
                    this.state.start('worldgen');
                    break;
                case 1:
                    this.menuState = false;
                    this.controlState = true;
                    this.controlmenu.visible = true;
                    break;
                default:
                    break;
            }
        }
	},
    
    previousOption: function() {
        if (this.menuState)
            this.state.start('titlegen');
        else {
            this.menuState = true;
            this.controlState = false;
            this.aboutState = false;
            this.controlmenu.visible = false;
        }
    }
};