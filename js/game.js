/*
CS 480
3/22/17
Samuel Luu
*/
Chopsticks.game = function(game) {};

var gamestate;              //Game State
var sL, sR;                 //Variables to keep track of which hand is attacking which hand
var pLH, pRH, aLH, aRH;
var turn;                   //Keeps track of whose turn it is (1 = player | -1 = AI)
var pSplit;                 //Variable when AI opponent can split
Chopsticks.game.prototype = {
    /* INITIALIZES CONTENT */
    create: function(){
        this.background = this.add.sprite(0, 0, 'background');  //Create Background
        this.turn = this.rnd.integerInRange(1,2);
        if (this.turn == 2) {
            this.turn = -1;
            this.background.frame = 1;
            this.initializePlayer();
            this.initializeAI();
            this.start = this.add.sprite(0, 0, 'start');
            this.start.frame = 1
        }
        else {
            this.background.frame = 0;
            this.initializePlayer();
            this.initializeAI();
            this.start = this.add.sprite(0, 0, 'start');
            this.start.frame = 0;
        }
        
        this.gamestate = 0;
        this.gamestatistics = this.add.sprite(0, 0, 'gamestatistics');  //Create Background
        this.gamestatistics.visible = false;
        
        this.restartGame = this.input.keyboard.addKey(Phaser.Keyboard.R);
        this.game.paused = true;
        this.game.input.onDown.add(function () {
        if(this.game.paused) {
            this.start.kill();
            this.game.paused = false;
        }
        },this);
    },
    
    /* THREAD CHECKING */
    update: function(){
        if (this.restartGame.isDown)
            this.state.start('preload');
        
        if (this.gamestate != 0)
            this.GameOver();
        else {
            if (this.turn != 1){                // AI Turn
                this.background.frame = 1;
                this.split.visible = false;
                this.alt.start();
            }
            else {                              // Player Turn
                this.background.frame = 0;
                if ((this.pLH == 0 && this.pRH == 2) || (this.pLH == 2 && this.pRH == 0) || (this.pLH == 0 && this.pRH == 4) || (this.pLH == 4 && this.pRH == 0)) {
                    this.split.visible = true;
                    this.pSplit = true;
                }
                else {
                    this.split.visible = false;
                    this.pSplit = false;
                }
            }
        }
    },
    
    GameOver: function() {
        this.gamestatistics.visible = true;
        if (this.gamestate == 1)
            this.gamestatistics.frame = 0;
        else
            this.gamestatistics.frame = 1;
    },
    
    /* HELPER FUNCTIONS BELOW */
    AIDecisionMedium: function() {
        this.AIDecisionHead(this.aLH, this.aRH, this.pLH, this.pRH);
    }, 
    
    initializePlayer: function() {
        // Initialize Player Points
        var px = 10;
        var py = 370;
        
        this.pLHS = this.add.sprite(px, py, 'select');
        this.pLHS.animations.add('selectLeft', [0, 1], 3, true);
        this.pLHS.frame = 0;
        this.pRHS = this.add.sprite(px + 240, py, 'select');
        this.pRHS.animations.add('selectRight', [0, 1], 3, true);
        this.pRHS.frame = 0;
        
        this.split = this.add.sprite(240, 340,'split');
        this.split.anchor.x = 0.5;
        this.split.anchor.y = 0.5;
        
        this.pLH1 = this.add.sprite(px + 24, py + 37.5 ,'pPoint');
        this.pLH2 = this.add.sprite(this.pLH1.x + 49, this.pLH1.y ,'pPoint');
        this.pLH3 = this.add.sprite(this.pLH2.x + 49, this.pLH1.y ,'pPoint');
        this.pLH4 = this.add.sprite(this.pLH3.x + 49, this.pLH1.y ,'pPoint');
        
        this.pRH1 = this.add.sprite(this.pLH1.x + 240, py + 37.5,'pPoint');
        this.pRH2 = this.add.sprite(this.pRH1.x + 49, this.pRH1.y ,'pPoint');
        this.pRH3 = this.add.sprite(this.pRH2.x + 49, this.pRH1.y ,'pPoint');
        this.pRH4 = this.add.sprite(this.pRH3.x + 49, this.pRH1.y ,'pPoint');
        
        // Invisible buttons for player hand selection
        this.pLHSB = this.add.button(px, py, 'button');
        this.pLHSB.onInputUp.add(this.pSelectLeft, this);
        this.pRHSB = this.add.button(px + 240, py, 'button');
        this.pRHSB.onInputUp.add(this.pSelectRight, this);
        
       
        this.splitbutton = this.add.button(this.split.x, this.split.y, 'splitbutton');
        this.splitbutton.onInputUp.add(this.splitHand, this);
        this.splitbutton.anchor.x = 0.5;
        this.splitbutton.anchor.y = 0.5;
        
        //Set Initial Variables
        this.pLH = 1;
        this.pRH = 1;
        
        this.sL = 0;
        this.sR = 0;
        this.updatePlayer();
    },
    
    initializeAI: function() {
        // Initialize Player Points
        var ax = 10;
        var ay = 10;
        
        this.aLH1 = this.add.sprite(ax + 24, ay + 37.5 ,'aPoint');
        this.aLH2 = this.add.sprite(this.aLH1.x + 49, this.aLH1.y ,'aPoint');
        this.aLH3 = this.add.sprite(this.aLH2.x + 49, this.aLH1.y ,'aPoint');
        this.aLH4 = this.add.sprite(this.aLH3.x + 49, this.aLH1.y ,'aPoint');
        this.aRH1 = this.add.sprite(this.aLH1.x + 240, ay + 37.5,'aPoint');
        this.aRH2 = this.add.sprite(this.aRH1.x + 49, this.aRH1.y ,'aPoint');
        this.aRH3 = this.add.sprite(this.aRH2.x + 49, this.aRH1.y ,'aPoint');
        this.aRH4 = this.add.sprite(this.aRH3.x + 49, this.aRH1.y ,'aPoint');
        
        // Invisible buttons for AI hand selection
        this.aLHSB = this.add.button(ax, ay, 'button');
        this.aLHSB.onInputUp.add(this.aSelectLeft, this);
        this.aRHSB = this.add.button(ax + 240, ay, 'button');
        this.aRHSB.onInputUp.add(this.aSelectRight, this);
        
        //Set Initial Variables
        this.aLH = 1;
        this.aRH = 1;
        this.updateAI();
        this.alt = this.time.create(false);
        this.alt.add(Phaser.Timer.SECOND * 2, this.AIDecisionMedium, this);
    },
    
    pSelectLeft: function() {
        if (this.turn == 1 && this.pLH > 0) {
            if (this.sL) {
                this.sL = 0;
                this.pLHS.animations.stop();
                this.pLHS.frame = 0;
            }
            else {
                this.sR = 0;
                this.pRHS.animations.stop();
                this.pRHS.frame = 0;
                this.sL = 1;
                this.pLHS.animations.play('selectLeft');
            }
        }
    },
    
    pSelectRight: function() {
        if (this.turn == 1 && this.pRH > 0) {
            if (this.sR) {
                this.sR = 0;
                this.pRHS.animations.stop();
                this.pRHS.frame = 0;
            }
            else {
                this.sL = 0;
                this.pLHS.animations.stop();
                this.pLHS.frame = 0;
                this.sR = 1;
                this.pRHS.animations.play('selectRight');
            }
        }
    },
    
    aSelectLeft: function() {
        if (this.turn == 1) {
            if (this.aLH > 0) {
                if (this.sL) {
                    this.pSelectLeft();
                    this.AtoA(this.turn);
                }
                else if (this.sR) {
                    this.pSelectRight();
                    this.BtoA(this.turn)
                }
            }
        }
    },
    
    aSelectRight: function() {
        if (this.turn == 1) {
            if (this.aRH > 0) {
                if (this.sL) {
                    this.pSelectLeft();
                    this.AtoB(this.turn);
                }
                else if (this.sR) {
                    this.pSelectRight();
                    this.BtoB(this.turn);   
                }
            }
        }
    },
    
    updatePlayer: function() {
        this.pLH1.visible = true;
        this.pLH2.visible = true;
        this.pLH3.visible = true;
        this.pLH4.visible = true;
        this.pRH1.visible = true;
        this.pRH2.visible = true;
        this.pRH3.visible = true;
        this.pRH4.visible = true;
        switch(this.pLH) {
            case 0:
                this.pLH1.visible = false;
            case 1:
                this.pLH2.visible = false;
            case 2:
                this.pLH3.visible = false;
            case 3:
                this.pLH4.visible = false;
            default:
                break;
        }
        
        switch(this.pRH) {
            case 0:
                this.pRH1.visible = false;
            case 1:
                this.pRH2.visible = false;
            case 2:
                this.pRH3.visible = false;
            case 3:
                this.pRH4.visible = false;
            default:
                break;
        }
    },
    
    updateAI: function() {
        this.aLH1.visible = true;
        this.aLH2.visible = true;
        this.aLH3.visible = true;
        this.aLH4.visible = true;
        this.aRH1.visible = true;
        this.aRH2.visible = true;
        this.aRH3.visible = true;
        this.aRH4.visible = true;
        switch(this.aLH) {
            case 0:
                this.aLH1.visible = false;
            case 1:
                this.aLH2.visible = false;
            case 2:
                this.aLH3.visible = false;
            case 3:
                this.aLH4.visible = false;
            default:
                break;
        }
        
        switch(this.aRH) {
            case 0:
                this.aRH1.visible = false;
            case 1:
                this.aRH2.visible = false;
            case 2:
                this.aRH3.visible = false;
            case 3:
                this.aRH4.visible = false;
            default:
                break;
        }
    },
    
    /*--------------------------------------------------- LEGAL MOVES -------------------------------------------------------------------------*/
    
    //Left Hand to Left Hand
    AtoA: function(turn) {
        if (turn == 1 && this.gamestate == 0){
            this.aLH += this.pLH;
            if (this.aLH >= 5)
                this.aLH = 0;
            this.updateAI();
        }
        else {
            this.pLH += this.aLH;
            if (this.pLH >= 5)
                this.pLH = 0;
            this.updatePlayer();
        }
        this.checkGameState();
        this.turn *= -1;
    },
    
    //Left Hand to Right Hand
    AtoB: function(turn) {
        if (turn == 1 && this.gamestate == 0){
            this.aRH += this.pLH;
            if (this.aRH >= 5)
                this.aRH = 0;
            this.updateAI();
        }
        else {
            this.pRH += this.aLH;
            if (this.pRH >= 5)
                this.pRH = 0;
            this.updatePlayer();
        }
        this.checkGameState();
        this.turn *= -1;
    },
    
    //Right Hand to Left Hand
    BtoA: function(turn) {
        if (turn == 1 && this.gamestate == 0){
            this.aLH += this.pRH;
            if (this.aLH >= 5)
                this.aLH = 0;
            this.updateAI();
        }
        else {
            this.pLH += this.aRH;
            if (this.pLH >= 5)
                this.pLH = 0;
            this.updatePlayer();
        }
        this.checkGameState();
        this.turn *= -1;
    },
    
    //Right Hand to Right Hand
    BtoB: function(turn) {
        if (turn == 1 && this.gamestate == 0){
            this.aRH += this.pRH;
            if (this.aRH >= 5)
                this.aRH = 0;
            this.updateAI();
        }
        else {
            this.pRH += this.aRH;
            if (this.pRH >= 5)
                this.pRH = 0;
            this.updatePlayer(); 
        }
        this.checkGameState();
        this.turn *= -1;
    },
    
    AIrandomAttack: function() {
        var rand = this.rnd.integerInRange(1,4);
        switch (rand){
            case 1:
                this.AtoA(this.turn);
                break;
            case 2:
                this.AtoB(this.turn);
                break;
            case 3:
                this.BtoA(this.turn);
                break;
            case 4:
                this.BtoB(this.turn);
                break;
            default:
                break;
        }
    },
    
    AIrandomLeft: function() {
        var rand = this.rnd.integerInRange(1,2);
        switch (rand){
            case 1:
                this.AtoA(this.turn);
                break;
            case 2:
                this.AtoB(this.turn);
                break;
            default:
                break;
        }
    },
    
    AIrandomRight: function() {
        var rand = this.rnd.integerInRange(1,2);
        switch (rand){
            case 1:
                this.BtoA(this.turn);
                break;
            case 2:
                this.BtoB(this.turn);
                break;
            default:
                break;
        }
    },
    
    AIrandomLeftInverse: function() {
        var rand = this.rnd.integerInRange(1,2);
        switch (rand){
            case 1:
                this.AtoA(this.turn);
                break;
            case 2:
                this.BtoA(this.turn);
                break;
            default:
                break;
        }
    },
    
    AIrandomRightInverse: function() {
        var rand = this.rnd.integerInRange(1,2);
        switch (rand){
            case 1:
                this.AtoB(this.turn);
                break;
            case 2:
                this.BtoB(this.turn);
                break;
            default:
                break;
        }
    },
    
    splitHand: function() {
        if (this.turn == 1 && this.pSplit) {
            this.sR = 0;
            this.pRHS.animations.stop();
            this.pRHS.frame = 0;
            this.sL = 0;
            this.pLHS.animations.stop();
            this.pLHS.frame = 0;
            
            if (this.pLH == 2 || this.pRH == 2) {           // 2-0 or 0-2 split
                this.pLH = 1;
                this.pRH = 1;
            }
            else {                                          // 4-0 or 0-4 split
                this.pLH = 2;
                this.pRH = 2;
            }
            this.pSplit = false;
            this.updatePlayer();
        }
        else if (this.turn == -1) {
            if (this.aLH == 2 || this.aRH == 2) {           // 2-0 or 0-2 split
                this.aLH = 1;
                this.aRH = 1;
            }
            else {                                          // 4-0 or 0-4 split
                this.aLH = 2;
                this.aRH = 2;
            }
            this.updateAI();
        }
        this.turn *= -1;
    },
    
    checkGameState: function() {
        if (this.aLH == 0 && this.aRH == 0)
            this.gamestate = 1;
        else if (this.pLH == 0 && this.pRH == 0)
            this.gamestate = -1;
    },
    /*-------------------------------------------------------- AI ----------------------------------------------------------------*/
    
    AIDecisionHead: function(aA, aB, pA, pB) {
        if (aA == 1 && aB == 1)
            this.sd_11(pA, pB);
        else if ((aA == 1 && aB == 2) || (aA == 2 && aB == 1))
            this.sd_12(pA, pB);
        else if ((aA == 1 && aB == 3) || (aA == 3 && aB == 1))
            this.sd_13(pA, pB);
        else if ((aA == 1 && aB == 4) || (aA == 4 && aB == 1))
            this.sd_14(pA, pB);
        else if ((aA == 1 && aB == 0) || (aA == 0 && aB == 1))
            this.sd_10(pA, pB);
        else if (aA == 2 && aB == 2)
            this.sd_22(pA, pB);
        else if ((aA == 2 && aB == 3) || (aA == 3 && aB == 2))
            this.sd_23(pA, pB);
        else if ((aA == 2 && aB == 4) || (aA == 4 && aB == 2))
            this.sd_24(pA, pB);
        else if ((aA == 2 && aB == 0) || (aA == 0 && aB == 2))
            this.sd_20(pA, pB);
        else if (aA == 3 && aB == 3)
            this.sd_33(pA, pB);
        else if ((aA == 3 && aB == 4) || (aA == 4 && aB == 3))
            this.sd_34(pA, pB);
        else if ((aA == 3 && aB == 0) || (aA == 0 && aB == 3))
            this.sd_30(pA, pB);
        else if (aA == 4 && aB == 4)
            this.sd_44(pA, pB);
        else if ((aA == 4 && aB == 0) || (aA == 0 && aB == 4))
            this.sd_40(pA, pB);
        this.alt = this.time.create(false);
        this.alt.add(Phaser.Timer.SECOND * 3, this.AIDecisionMedium, this);
    },
    
    sd_10: function(pA, pB) {
        if (pA == 1 && pB == 1) {
            if (this.aLH == 1)
                this.AIrandomLeft();
            else
                this.AIrandomRight();
        }
        else if ((pA == 1 && pB == 2) || (pA == 2 && pB == 1)) {
            if (this.aLH == 1)
                if (pA == 2)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 2)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 1 && pB == 3) || (pA == 3 && pB == 1)) {
             if (this.aLH == 1)
                if (pA == 1)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 1)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 1 && pB == 4) || (pA == 4 && pB == 1)) {
            if (this.aLH == 1)
                if (pA == 4)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 4)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 1 && pB == 0) || (pA == 0 && pB == 1)) {
            if (this.aLH == 1)
                if (pA == 1)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 1)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if (pA == 2 && pB == 2) {
            if (this.aLH == 1)
                this.AIrandomLeft();
            else
                this.AIrandomRight();
        }
        else if ((pA == 2 && pB == 3) || (pA == 3 && pB == 2)) {
            if (this.aLH == 1)
                if (pA == 2)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 2)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 2 && pB == 4) || (pA == 4 && pB == 2)) {
            if (this.aLH == 1)
                if (pA == 4)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 4)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 2 && pB == 0) || (pA == 0 && pB == 2)) {
            if (this.aLH == 1)
                if (pA == 2)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 2)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if (pA == 3 && pB == 3) {
            if (this.aLH == 1)
                this.AIrandomLeft();
            else
                this.AIrandomRight();
        }
        else if ((pA == 3 && pB == 4) || (pA == 4 && pB == 3)) {
            if (this.aLH == 1)
                if (pA == 4)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 4)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 3 && pB == 0) || (pA == 0 && pB == 3)) {
            if (this.aLH == 1)
                if (pA == 3)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 3)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if (pA == 4 && pB == 4) {
            if (this.aLH == 1)
                this.AIrandomLeft();
            else
                this.AIrandomRight();
        }
        else if ((pA == 4 && pB == 0) || (pA == 0 && pB == 4)) {
            if (this.aLH == 1)
                if (pA == 4)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 4)
                    this.BtoA();
                else
                    this.BtoB();
        }
    },
    
    sd_11: function(pA, pB) {
        if (pA == 1 && pB == 1) {
            this.AIrandomAttack();
        }
        else if ((pA == 1 && pB == 2) || (pA == 2 && pB == 1)) {
            this.AIrandomAttack();
        }
        else if ((pA == 1 && pB == 3) || (pA == 3 && pB == 1)) {
            this.AIrandomAttack();
        }
        else if ((pA == 1 && pB == 4) || (pA == 4 && pB == 1)) {
            if (pA == 4)
                this.AtoA();
            else
                this.BtoB();
        }
        else if ((pA == 1 && pB == 0) || (pA == 0 && pB == 1)) {
            if (pA == 1)
                this.AtoA();
            else
                this.BtoB();
        }
        else if (pA == 2 && pB == 2) {
            this.AIrandomAttack();
        }
        else if ((pA == 2 && pB == 3) || (pA == 3 && pB == 2)) {
            this.AIrandomAttack();
        }
        else if ((pA == 2 && pB == 4) || (pA == 4 && pB == 2)) {
            if (pA == 4)
                this.AtoA();
            else
                this.BtoB();
        }
        else if ((pA == 2 && pB == 0) || (pA == 0 && pB == 2)) {
            if (pA == 2)
                this.AtoA();
            else
                this.BtoB();
        }
        else if (pA == 3 && pB == 3) {
            this.AIrandomAttack();
        }
        else if ((pA == 3 && pB == 4) || (pA == 4 && pB == 3)) {
            if (pA == 4)
                this.AtoA();
            else
                this.BtoB();
        }
        else if ((pA == 3 && pB == 0) || (pA == 0 && pB == 3)) {
            if (pA == 3)
                this.AtoA();
            else
                this.BtoB();
        }
        else if (pA == 4 && pB == 4) {
            this.AIrandomAttack();
        }
        else if ((pA == 4 && pB == 0) || (pA == 0 && pB == 4)) {
            if (pA == 4)
                this.AtoA();
            else
                this.BtoB();
        }
    },
    
    sd_12: function(pA, pB) {
        if (pA == 1 && pB == 1) {
            if (this.aLH == 1)
                this.AIrandomLeft();
            else
                this.AIrandomRight();
        }
        else if ((pA == 1 && pB == 2) || (pA == 2 && pB == 1)) {
            if (this.aLH == 2)
                if (pA == 1)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 1)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 1 && pB == 3) || (pA == 3 && pB == 1)) {
            if (this.aLH == 2)
                if (pA == 3)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 3)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 1 && pB == 4) || (pA == 4 && pB == 1)) {
            if (pA == 4)
                this.AtoA();
            else
                this.BtoB();
        }
        else if ((pA == 1 && pB == 0) || (pA == 0 && pB == 1)) {
            if (pA == 1)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if (pA == 2 && pB == 2) {
             this.AIrandomAttack()
        }
        else if ((pA == 2 && pB == 3) || (pA == 3 && pB == 2)) {
            if (this.aLH == 2)
                if (pA == 3)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 3)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 2 && pB == 4) || (pA == 4 && pB == 2)) {
             if (pA == 4)
                this.AtoA();
            else
                this.BtoB();
        }
        else if ((pA == 2 && pB == 0) || (pA == 0 && pB == 2)) {
            if (pA == 2)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if (pA == 3 && pB == 3) {
            if (this.aLH == 2)
                this.AtoA();
            else
                this.BtoB();
            
        }
        else if ((pA == 3 && pB == 4) || (pA == 4 && pB == 3)) {
            if (pA == 4)
                this.AtoA();
            else
                this.AtoB();
        }
        else if ((pA == 3 && pB == 0) || (pA == 0 && pB == 3)) {
            if (this.aLH == 2)
                if (pA == 3)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 3)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if (pA == 4 && pB == 4) {
            this.AIrandomAttack();
        }
        else if ((pA == 4 && pB == 0) || (pA == 0 && pB == 4)) {
            if (pA == 4)
                this.AtoA();
            else
                this.AtoB();
        }
    },
    
    sd_13: function(pA, pB) {
        if (pA == 1 && pB == 1) {
            this.AIrandomAttack();
        }
        else if ((pA == 1 && pB == 2) || (pA == 2 && pB == 1)) {
            if (this.aLH == 3)
                if (pA == 2)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 2)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 1 && pB == 3) || (pA == 3 && pB == 1)) {
            if (this.aLH == 3)
                if (pA == 3)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 3)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 1 && pB == 4) || (pA == 4 && pB == 1)) {
            if (pA == 4)
                this.AtoA();
            else
                this.BtoB();
        }
        else if ((pA == 1 && pB == 0) || (pA == 0 && pB == 1)) {
            if (this.aLH == 3)
                if (pA == 1)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 1)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if (pA == 2 && pB == 2) {
            if (this.aLH == 3)
                this.AIrandomLeft();
            else
                this.AIrandomRight();
        }
        else if ((pA == 2 && pB == 3) || (pA == 3 && pB == 2)) {
            if (this.aLH == 3)
                if (pA == 2)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 2)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 2 && pB == 4) || (pA == 4 && pB == 2)) {
            if (this.aLH == 3)
                if (pA == 4)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 4)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 2 && pB == 0) || (pA == 0 && pB == 2)) {
            if (this.aLH == 3)
                if (pA == 2)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 2)
                    this.BtoA();
                else
                    this.BtoB();
        }
        
        else if (pA == 3 && pB == 3) {
            if (this.aLH == 3)
                this.AIrandomLeft();
            else
                this.AIrandomRight();
        }
        else if ((pA == 3 && pB == 4) || (pA == 4 && pB == 3)) {
            if (pA == 4)
                this.AtoA();
            else
                this.BtoB();
        }
        else if ((pA == 3 && pB == 0) || (pA == 0 && pB == 3)) {
            if (this.aLH == 3)
                if (pA == 3)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 3)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if (pA == 4 && pB == 4) {
            this.AIrandomAttack();
        }
        else if ((pA == 4 && pB == 0) || (pA == 0 && pB == 4)) {
            if (pA == 4)
                this.AtoA();
            else
                this.BtoB();
        }
    },
    
    sd_14: function(pA, pB) {
        if (pA == 1 && pB == 1) {
            if (this.aLH == 4)
                this.AIrandomLeft();
            else
                this.AIrandomRight();
        }
        else if ((pA == 1 && pB == 2) || (pA == 2 && pB == 1)) {
            if (this.aLH == 4)
                if (pA == 2)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 2)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 1 && pB == 3) || (pA == 3 && pB == 1)) {
            if (this.aLH == 4)
                if (pA == 3)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 3)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 1 && pB == 4) || (pA == 4 && pB == 1)) {
            if (this.aLH == 4)
                if (pA == 1)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 1)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 1 && pB == 0) || (pA == 0 && pB == 1)) {
            if (this.aLH == 4)
                if (pA == 1)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 1)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if (pA == 2 && pB == 2) {
            this.AIrandomAttack();
        }
        else if ((pA == 2 && pB == 3) || (pA == 3 && pB == 2)) {
            if (this.aLH == 4)
                if (pA == 3)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 3)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 2 && pB == 4) || (pA == 4 && pB == 2)) {
                if (pA == 4)
                    this.AtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 2 && pB == 0) || (pA == 0 && pB == 2)) {
            if (this.aLH == 4)
                if (pA == 2)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 2)
                    this.BtoA();
                else
                    this.BtoB();
        }
        
        else if (pA == 3 && pB == 3) {
            this.AIrandomAttack();
        }
        else if ((pA == 3 && pB == 4) || (pA == 4 && pB == 3)) {
            this.AIrandomAttack();
        }
        else if ((pA == 3 && pB == 0) || (pA == 0 && pB == 3)) {
            if (this.aLH == 4)
                if (pA == 3)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 3)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if (pA == 4 && pB == 4) {
            this.AIrandomAttack();
        }
        else if ((pA == 4 && pB == 0) || (pA == 0 && pB == 4)) {
            if (pA == 4)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
    },
    
    sd_20: function(pA, pB) {
        if (pA == 1 && pB == 1) {
            this.splitHand();
        }
        else if ((pA == 1 && pB == 2) || (pA == 2 && pB == 1)) {
            this.splitHand();
        }
        else if ((pA == 1 && pB == 3) || (pA == 3 && pB == 1)) {
            this.splitHand();
        }
        else if ((pA == 1 && pB == 4) || (pA == 4 && pB == 1)) {
            this.splitHand();
        }
        else if ((pA == 1 && pB == 0) || (pA == 0 && pB == 1)) {
            this.splitHand();
        }
        
        else if (pA == 2 && pB == 2) {
            this.splitHand();
        }
        else if ((pA == 2 && pB == 3) || (pA == 3 && pB == 2)) {
            if (this.aLH == 2)
                if (pA == 3)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 3)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 2 && pB == 4) || (pA == 4 && pB == 2)) {
            if (this.aLH == 2)
                if (pA == 4)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 4)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 2 && pB == 0) || (pA == 0 && pB == 2)) {
            this.splitHand();
        }
        
        else if (pA == 3 && pB == 3) {
            this.splitHand();
        }
        else if ((pA == 3 && pB == 4) || (pA == 4 && pB == 3)) {
            this.splitHand();
        }
        else if ((pA == 3 && pB == 0) || (pA == 0 && pB == 3)) {
            if (this.aLH == 2)
                if (pA == 3)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 3)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if (pA == 4 && pB == 4) {
            this.splitHand();
        }
        else if ((pA == 4 && pB == 0) || (pA == 0 && pB == 4)) {
            if (this.aLH == 2)
                if (pA == 4)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 4)
                    this.BtoA();
                else
                    this.BtoB();
        }
    },
    
    sd_22: function(pA, pB) {
        if (pA == 1 && pB == 1) {
            this.AIrandomAttack();
        }
        else if ((pA == 1 && pB == 2) || (pA == 2 && pB == 1)) {
            this.AIrandomAttack();
        }
        else if ((pA == 1 && pB == 3) || (pA == 3 && pB == 1)) {
            if (pA == 3)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 1 && pB == 4) || (pA == 4 && pB == 1)) {
            if (pA == 4)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 1 && pB == 0) || (pA == 0 && pB == 1)) {
            if (pA == 1)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        
        else if (pA == 2 && pB == 2) {
            this.AIrandomAttack();
        }
        else if ((pA == 2 && pB == 3) || (pA == 3 && pB == 2)) {
            this.AIrandomAttack();
        }
        else if ((pA == 2 && pB == 4) || (pA == 4 && pB == 2)) {
            if (pA == 4)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 2 && pB == 0) || (pA == 0 && pB == 2)) {
            if (pA == 2)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        
        else if (pA == 3 && pB == 3) {
            this.AIrandomAttack();
        }
        else if ((pA == 3 && pB == 4) || (pA == 4 && pB == 3)) {
            if (pA == 4)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 3 && pB == 0) || (pA == 0 && pB == 3)) {
            if (pA == 3)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if (pA == 4 && pB == 4) {
            this.AIrandomAttack();
        }
        else if ((pA == 4 && pB == 0) || (pA == 0 && pB == 4)) {
            if (pA == 4)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
    },
    
    sd_23: function(pA, pB) {
        if (pA == 1 && pB == 1) {
            this.AIrandomAttack();
        }
        else if ((pA == 1 && pB == 2) || (pA == 2 && pB == 1)) {
            if (this.aLH == 3)
                if (pA == 2)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 2)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 1 && pB == 3) || (pA == 3 && pB == 1)) {
            if (this.aLH == 3)
                if (pA == 3)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 3)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 1 && pB == 4) || (pA == 4 && pB == 1)) {
            if (pA == 4)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 1 && pB == 0) || (pA == 0 && pB == 1)) {
            if (this.aLH == 2)
                if (pA == 1)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 1)
                    this.BtoA();
                else
                    this.BtoB();
        }
        
        else if (pA == 2 && pB == 2) {
            this.AIrandomAttack();
        }
        else if ((pA == 2 && pB == 3) || (pA == 3 && pB == 2)) {
            if (pA == 3)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 2 && pB == 4) || (pA == 4 && pB == 2)) {
            if (pA == 4)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 2 && pB == 0) || (pA == 0 && pB == 2)) {
            if (this.aLH == 3)
                if (pA == 2)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 2)
                    this.BtoA();
                else
                    this.BtoB();
        }
        
        else if (pA == 3 && pB == 3) {
            this.AIrandomAttack();
        }
        else if ((pA == 3 && pB == 4) || (pA == 4 && pB == 3)) {
            if (pA == 4)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 3 && pB == 0) || (pA == 0 && pB == 3)) {
            if (pA == 3)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if (pA == 4 && pB == 4) {
            this.AIrandomAttack();
        }
        else if ((pA == 4 && pB == 0) || (pA == 0 && pB == 4)) {
            if (pA == 4)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
    },
    
    sd_24: function(pA, pB) {
        if (pA == 1 && pB == 1) {
            if (this.aLH == 2)
                this.AIrandomLeft();
            else
                this.AIrandomRight();
        }
        else if ((pA == 1 && pB == 2) || (pA == 2 && pB == 1)) {
            if (this.aLH == 2)
                if (pA == 1)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 1)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 1 && pB == 3) || (pA == 3 && pB == 1)) {
            if (this.aLH == 2)
                if (pA == 1)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 1)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 1 && pB == 4) || (pA == 4 && pB == 1)) {
            if (pA == 4)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 1 && pB == 0) || (pA == 0 && pB == 1)) {
            if (this.aLH == 4)
                if (pA == 1)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 1)
                    this.BtoA();
                else
                    this.BtoB();
        }
        
        else if (pA == 2 && pB == 2) {
            this.AIrandomAttack();
        }
        else if ((pA == 2 && pB == 3) || (pA == 3 && pB == 2)) {
            if (this.aLH == 4)
                if (pA == 2)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 2)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 2 && pB == 4) || (pA == 4 && pB == 2)) {
            this.AIrandomAttack();
        }
        else if ((pA == 2 && pB == 0) || (pA == 0 && pB == 2)) {
            if (this.aLH == 4)
                if (pA == 2)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 2)
                    this.BtoA();
                else
                    this.BtoB();
        }
        
        else if (pA == 3 && pB == 3) {
            this.AIrandomAttack();
        }
        else if ((pA == 3 && pB == 4) || (pA == 4 && pB == 3)) {
            if (pA == 4)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 3 && pB == 0) || (pA == 0 && pB == 3)) {
            if (pA == 3)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if (pA == 4 && pB == 4) {
            this.AIrandomAttack();
        }
        else if ((pA == 4 && pB == 0) || (pA == 0 && pB == 4)) {
            if (pA == 4)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
    },
    
    sd_30: function(pA, pB) {
        if (pA == 1 && pB == 1) {
            if (this.aLH == 3)
                this.AIrandomLeft();
            else
                this.AIrandomRight();
        }
        else if ((pA == 1 && pB == 2) || (pA == 2 && pB == 1)) {
            if (this.aLH == 3)
                if (pA == 2)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 2)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 1 && pB == 3) || (pA == 3 && pB == 1)) {
            if (this.aLH == 3)
                if (pA == 3)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 3)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 1 && pB == 4) || (pA == 4 && pB == 1)) {
            if (this.aLH == 3)
                if (pA == 4)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 4)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 1 && pB == 0) || (pA == 0 && pB == 1)) {
            if (this.aLH == 3)
                if (pA == 1)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 1)
                    this.BtoA();
                else
                    this.BtoB();
        }
        
        else if (pA == 2 && pB == 2) {
            if (this.aLH == 3)
                this.AIrandomLeft();
            else
                this.AIrandomRight();
        }
        else if ((pA == 2 && pB == 3) || (pA == 3 && pB == 2)){
            if (this.aLH == 3)
                if (pA == 3)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 3)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 2 && pB == 4) || (pA == 4 && pB == 2)) {
            if (this.aLH == 3)
                this.AIrandomLeft();
            else
                this.AIrandomRight();
        }
        else if ((pA == 2 && pB == 0) || (pA == 0 && pB == 2)) {
            if (this.aLH == 3)
                if (pA == 2)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 2)
                    this.BtoA();
                else
                    this.BtoB();
        }
        
        else if (pA == 3 && pB == 3) {
            if (this.aLH == 3)
                this.AIrandomLeft();
            else
                this.AIrandomRight();
        }
        else if ((pA == 3 && pB == 4) || (pA == 4 && pB == 3)) {
            if (this.aLH == 3)
                if (pA == 4)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 4)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 3 && pB == 0) || (pA == 0 && pB == 3)) {
            if (this.aLH == 3)
                if (pA == 3)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 3)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if (pA == 4 && pB == 4) {
            if (this.aLH == 3)
                this.AIrandomLeft();
            else
                this.AIrandomRight();
        }
        else if ((pA == 4 && pB == 0) || (pA == 0 && pB == 4)) {
            if (this.aLH == 3)
                if (pA == 4)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 4)
                    this.BtoA();
                else
                    this.BtoB();
        }
    },
    
    sd_33: function(pA, pB) {
        if (pA == 1 && pB == 1) {
            this.AIrandomAttack();
        }
        else if ((pA == 1 && pB == 2) || (pA == 2 && pB == 1)) {
            if (pA == 2)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 1 && pB == 3) || (pA == 3 && pB == 1)) {
            if (pA == 3)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 1 && pB == 4) || (pA == 4 && pB == 1)) {
            if (pA == 4)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 1 && pB == 0) || (pA == 0 && pB == 1)) {
            if (pA == 1)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        
        else if (pA == 2 && pB == 2) {
            this.AIrandomAttack();
        }
        else if ((pA == 2 && pB == 3) || (pA == 3 && pB == 2)) {
            if (pA == 2)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 2 && pB == 4) || (pA == 4 && pB == 2)) {
            if (pA == 4)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 2 && pB == 0) || (pA == 0 && pB == 2)) {
            if (pA == 2)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        
        else if (pA == 3 && pB == 3) {
            this.AIrandomAttack();
        }
        else if ((pA == 3 && pB == 4) || (pA == 4 && pB == 3)) {
            if (pA == 4)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 3 && pB == 0) || (pA == 0 && pB == 3)) {
            if (pA == 3)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if (pA == 4 && pB == 4) {
            this.AIrandomAttack();
        }
        else if ((pA == 4 && pB == 0) || (pA == 0 && pB == 4)) {
            if (pA == 4)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
    },
    
    sd_34: function(pA, pB) {
        if (pA == 1 && pB == 1) {
            if (this.aLH == 3)
                if (pA == 1)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 1)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 1 && pB == 2) || (pA == 2 && pB == 1)) {
            if (this.aLH == 4)
                if (pA == 1)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 1)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 1 && pB == 3) || (pA == 3 && pB == 1)) {
            if (this.aLH == 4)
                if (pA == 1)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 1)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 1 && pB == 4) || (pA == 4 && pB == 1)) {
            if (this.aLH == 4)
                if (pA == 1)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 1)
                    this.BtoA();
                else
                    this.BtoB();
                    
        }
        else if ((pA == 1 && pB == 0) || (pA == 0 && pB == 1)) {
            if (this.aLH == 4)
                if (pA == 1)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 1)
                    this.BtoA();
                else
                    this.BtoB();
        }
        
        else if (pA == 2 && pB == 2) {
            this.AIrandomAttack();
        }
        else if ((pA == 2 && pB == 3) || (pA == 3 && pB == 2)) {
            if (this.aLH == 4)
                if (pA == 2)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 2)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if ((pA == 2 && pB == 4) || (pA == 4 && pB == 2)) {
            if (pA == 4)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 2 && pB == 0) || (pA == 0 && pB == 2)) {
            if (pA == 2)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        
        else if (pA == 3 && pB == 3) {
            this.AIrandomAttack();
        }
        else if ((pA == 3 && pB == 4) || (pA == 4 && pB == 3)) {
            if (pA == 4)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 3 && pB == 0) || (pA == 0 && pB == 3)) {
            if (pA == 3)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if (pA == 4 && pB == 4) {
            this.AIrandomAttack();
        }
        else if ((pA == 4 && pB == 0) || (pA == 0 && pB == 4)) {
            if (pA == 4)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
    },
    
    sd_40: function(pA, pB) {
        if (pA == 1 && pB == 1) {
            this.splitHand();
        }
        else if ((pA == 1 && pB == 2) || (pA == 2 && pB == 1)) {
            this.splitHand();
        }
        else if ((pA == 1 && pB == 3) || (pA == 3 && pB == 1)) {
            this.splitHand();
        }
        else if ((pA == 1 && pB == 4) || (pA == 4 && pB == 1)) {
            this.splitHand();
        }
        else if ((pA == 1 && pB == 0) || (pA == 0 && pB == 1)) {
            if (this.aLH == 4)
                if (pA == 1)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 1)
                    this.BtoA();
                else
                    this.BtoB();
        }
        
        else if (pA == 2 && pB == 2) {
            this.splitHand();
        }
        else if ((pA == 2 && pB == 3) || (pA == 3 && pB == 2)) {
            this.splitHand();
        }
        else if ((pA == 2 && pB == 4) || (pA == 4 && pB == 2)) {
            this.splitHand();
        }
        else if ((pA == 2 && pB == 0) || (pA == 0 && pB == 2)) {
            if (this.aLH == 4)
                if (pA == 2)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 2)
                    this.BtoA();
                else
                    this.BtoB();
        }
        
        else if (pA == 3 && pB == 3) {
            this.splitHand();
        }
        else if ((pA == 3 && pB == 4) || (pA == 4 && pB == 3)) {
            this.splitHand();
        }
        else if ((pA == 3 && pB == 0) || (pA == 0 && pB == 3)) {
            if (this.aLH == 4)
                if (pA == 3)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 3)
                    this.BtoA();
                else
                    this.BtoB();
        }
        else if (pA == 4 && pB == 4) {
            this.splitHand();
        }
        else if ((pA == 4 && pB == 0) || (pA == 0 && pB == 4)) {
            if (this.aLH == 4)
                if (pA == 4)
                    this.AtoA();
                else
                    this.AtoB();
            else
                if (pA == 4)
                    this.BtoA();
                else
                    this.BtoB();
        }
    },
    
    sd_44: function(pA, pB) {
        if (pA == 1 && pB == 1) {
            this.AIrandomAttack();
        }
        else if ((pA == 1 && pB == 2) || (pA == 2 && pB == 1)) {
            if (pA == 2)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 1 && pB == 3) || (pA == 3 && pB == 1)) {
            if (pA == 3)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 1 && pB == 4) || (pA == 4 && pB == 1)) {
            if (pA == 4)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 1 && pB == 0) || (pA == 0 && pB == 1)) {
            if (pA == 1)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        
        else if (pA == 2 && pB == 2) {
            this.AIrandomAttack();
        }
        else if ((pA == 2 && pB == 3) || (pA == 3 && pB == 2)) {
            if (pA == 2)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 2 && pB == 4) || (pA == 4 && pB == 2)) {
            this.AIrandomAttack();
        }
        else if ((pA == 2 && pB == 0) || (pA == 0 && pB == 2)) {
            if (pA == 2)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        
        else if (pA == 3 && pB == 3) {
            this.AIrandomAttack();
        }
        else if ((pA == 3 && pB == 4) || (pA == 4 && pB == 3)) {
            if (pA == 4)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if ((pA == 3 && pB == 0) || (pA == 0 && pB == 3)) {
            if (pA == 3)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
        else if (pA == 4 && pB == 4) {
            this.AIrandomAttack();
        }
        else if ((pA == 4 && pB == 0) || (pA == 0 && pB == 4)) {
            if (pA == 4)
                this.AIrandomLeftInverse();
            else
                this.AIrandomRightInverse();
        }
    },
};