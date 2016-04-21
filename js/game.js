DA5Game.game = function(game) {};

DA5Game.game.prototype = {
    create: function(){
        this.initializeState = true;
        /* World Create */
        this.worldGen();
        this.setBoundary();
        
        this.initializeResources();
        this.initializeFood();
        this.spawnSupplyItem();
        
        this.initializeInfrared();
        
        this.initializeTurrets();
        this.initializeDrones();    // INFRARED LENSES WILL ALLOW PLAYERS TO LOCATE DRONES IN THE DARK
        
        this.initializeLight();
        this.timerInitialization();
        this.playerInitialization();
        
        // TEST RESET
        this.win = this.add.sprite((1 * this.game.posMult) + 8, (18 * this.game.posMult) + 8, 'win');
        this.physics.enable(this.win, Phaser.Physics.ARCADE);
        
        this.initializeHUD();
        this.initializeState = false;
        this.initializeMenus();
        this.updateInventorySlots();
        this.camera.follow(this.game.player);
        
        this.quarterCount = 0;
    },
    
    update: function(){
        /* COLLISION LIST START */
        this.physics.arcade.collide(this.game.player, this.safe);
        this.physics.arcade.collide(this.game.player, this.rock);
        this.physics.arcade.overlap(this.game.player, this.sand, this.sandCollide, null, this);
        this.physics.arcade.overlap(this.game.player, this.lake, this.lakeCollide, null, this);
        this.physics.arcade.overlap(this.game.player, this.river, this.riverCollide, null, this);
        this.physics.arcade.overlap(this.game.player, this.win, this.GameOver, null, this);
        this.physics.arcade.overlap(this.game.player, this.food, this.collectFood, null, this);
        this.physics.arcade.overlap(this.game.player, this.resource, this.collectResource, null, this);
        
        this.physics.arcade.overlap(this.game.player, this.supplyItem, this.collectSupplyItem, null, this);
        
        this.physics.arcade.collide(this.drone, this.drone);
        this.physics.arcade.collide(this.drone, this.boundary);
        this.physics.arcade.collide(this.drone, this.rock);
        this.physics.arcade.collide(this.drone, this.safe);
        this.physics.arcade.overlap(this.drone, this.game.player, this.damagePlayer, null, this);
        this.physics.arcade.collide(this.pulse, this.safe, this.destroyPulse, null, this);
        this.physics.arcade.collide(this.pulse, this.rock, this.destroyPulse, null, this);
        this.physics.arcade.overlap(this.pulse, this.drone, this.stunDrone, null, this);
        
        if (this.game.interact)
            this.game.speed = this.game.stop;
        else if (this.game.isSlowed)
            this.game.speed = this.game.slow;
        else
            this.game.speed = this.game.normal;
        /* CONTROLS */
        if (this.leftKey.isDown)
            this.game.player.body.velocity.x = -this.game.speed;
        else if (this.rightKey.isDown)
            this.game.player.body.velocity.x = this.game.speed;
        else
            this.game.player.body.velocity.x = 0;
        
        if (this.upKey.isDown)
            this.game.player.body.velocity.y = -this.game.speed;
        else if (this.downKey.isDown)
            this.game.player.body.velocity.y = this.game.speed;
        else 
            this.game.player.body.velocity.y = 0;
        
        this.healKey.onDown.add(this.healPlayer, this);
        this.shieldKey.onDown.add(this.shieldPlayer, this);
        
        /* SHOOTING */
        this.cursors.up.onDown.add(this.fireUp, this);
        this.cursors.down.onDown.add(this.fireDown, this);
        this.cursors.left.onDown.add(this.fireLeft, this);
        this.cursors.right.onDown.add(this.fireRight, this);
        this.craftKey.onDown.add(this.toggleCraftMenu, this);
        this.inventoryKey.onDown.add(this.toggleInventory,this);
        this.confirmKey.onDown.add(this.confirmOption, this);
        this.declineKey.onDown.add(this.declineOption, this);
        this.oneKey.onDown.add(this.option1, this);
        this.twoKey.onDown.add(this.option2, this);
        this.threeKey.onDown.add(this.option3, this);
        
        this.movePlayerComponents();
        
        /* AI */
        this.droneTarget();
        this.dronePatrol();
        this.postLogicCheck();
    },
    
    GameOver: function() {
        this.state.start('winState');
    },
    
    /* ---------------------- EXTERNAL HELPER FUNCTIONS BEGIN HERE AND ONWARDS ---------------------- */
    
    initializeTurrets: function() {
        this.turret = this.add.group();
        this.physics.enable(this.turret, Phaser.Physics.PHASER);
        this.turret.enableBody = true;
        
        canSpawn = false;
        while(!canSpawn){
            canSpawn = true;
            x = this.rnd.integerInRange(0, 19);
            y = this.rnd.integerInRange(0, 19);
            for (i = 0; i< this.game.spawnExclX.length; i++){
                if (x === this.game.spawnExclX[i] && y === this.game.spawnExclY[i]) {
                    canSpawn = false;
                    break;
                }
            }
            if (canSpawn){
                this.turret1 = this.turret.create((x * this.game.posMult), (y * this.game.posMult), 'turret');
                this.game.spawnExclX.push(x);
                this.game.spawnExclY.push(y);
            }
        }
        this.turret1.body.collideWorldBounds = true;
        
        this.enemyPulse = this.add.group();
        this.enemyPulse.enableBody = true;
        this.enemyPulse.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemyPulse.setAll('outOfBoundsKill', true);
        this.enemyPulse.setAll('checkWorldBounds', true);
    },
    
    collectSupplyItem: function() {
        if (this.pickUp) {
            this.supplyItem.kill();             // Destroys supply item
            
            if (this.spawnID >= 4) {
                this.pauseTimers();
                this.game.interact = true;          // Freezes player movement
                this.supplyState = true;            // Changes control listener to listen for 'Y' and 'N'
                this.supplyPrompt.visible = true;   // Makes the supply prompt visible
            }
            else {
                // Consummable supply drops
                switch (this.spawnID){
                    case 1:
                        if (this.game.medKit < 3) {
                            this.game.medKit++;
                            this.updateConsumables();
                        }
                        break;
                    case 2:
                        if (this.game.shieldCount < 3) {
                            this.game.shieldCount++;
                            this.updateConsumables();
                        }
                        break;
                    case 3:
                        this.game.resourceCount += 10;
                        this.updateResourceText();
                        break;
                    default:
                        break;
                }
            }
        }
    },
    
    pauseTimers: function() {
        this.timeCycle.pause();
        this.quarterCycle.pause();
        this.healthDrain.pause();
        this.hungerDrain.pause();
        this.thirstDrain.pause();
    },
    
    resumeTimers: function() {
        this.timeCycle.resume();
        this.quarterCycle.resume();
        this.healthDrain.resume();
        this.hungerDrain.resume();
        this.thirstDrain.resume();
    },
    
    updateInventorySlots: function() {
        //reset all stats first before applying the new buff
        this.game.infrared = false;
        this.game.light = 1;
        this.game.playerMaxHealth = 3;
        this.game.playerMaxHunger = 3;
        this.game.playerMaxThirst = 3;
        
        switch (this.game.slot1){
            /* case 1 - 3 are consummable drops and is handled in the collectSupplyItem function */
            case 4:
                this.game.infrared = true;
                this.inventoryslot1 = this.add.sprite((13 * this.game.posMult), (14 * this.game.posMult), 'irgoggles');
                this.inventoryslot1.fixedToCamera = true;
                break;
            case 5:
                this.game.light = 2;
                this.inventoryslot1 = this.add.sprite((13 * this.game.posMult), (14 * this.game.posMult), 'lamp');
                this.inventoryslot1.fixedToCamera = true;
                break;
            case 6:
                this.game.playerMaxHunger += 1;
                this.inventoryslot1 = this.add.sprite((13 * this.game.posMult), (14 * this.game.posMult), 'picnicbasket');
                this.inventoryslot1.fixedToCamera = true;
                break;
            case 7:
                this.game.playerMaxHunger += 2;
                this.inventoryslot1 = this.add.sprite((13 * this.game.posMult), (14 * this.game.posMult), 'refridgerator');
                this.inventoryslot1.fixedToCamera = true;
                break;
            case 8:
                this.game.playerMaxThirst += 1;
                this.inventoryslot1 = this.add.sprite((13 * this.game.posMult), (14 * this.game.posMult), 'canteen');
                this.inventoryslot1.fixedToCamera = true;
                break;
            case 9:
                this.game.playerMaxThirst += 2;
                this.inventoryslot1 = this.add.sprite((13 * this.game.posMult), (14 * this.game.posMult), 'waterjug');
                this.inventoryslot1.fixedToCamera = true;
                break;
            case 10:
                this.game.playerMaxHealth += 1;
                this.inventoryslot1 = this.add.sprite((13 * this.game.posMult), (14 * this.game.posMult), 'mushroom');
                this.inventoryslot1.fixedToCamera = true;
                break;
            case 11:
                this.game.playerMaxHealth += 2;
                this.inventoryslot1 = this.add.sprite((13 * this.game.posMult), (14 * this.game.posMult), 'diamondarmor');
                this.inventoryslot1.fixedToCamera = true;
                break;
            default:
                break;
        }
        
        switch (this.game.slot2){
            case 4:
                this.game.infrared = true;
                this.inventoryslot2 = this.add.sprite((14 * this.game.posMult), (14 * this.game.posMult), 'irgoggles');
                this.inventoryslot2.fixedToCamera = true;
                break;
            case 5:
                this.game.light = 2;
                this.inventoryslot2 = this.add.sprite((14 * this.game.posMult), (14 * this.game.posMult), 'lamp');
                this.inventoryslot2.fixedToCamera = true;
                break;
            case 6:
                this.game.playerMaxHunger += 1;
                this.inventoryslot2 = this.add.sprite((14 * this.game.posMult), (14 * this.game.posMult), 'picnicbasket');
                this.inventoryslot2.fixedToCamera = true;
                break;
            case 7:
                this.game.playerMaxHunger += 2;
                this.inventoryslot2 = this.add.sprite((14 * this.game.posMult), (14 * this.game.posMult), 'refridgerator');
                this.inventoryslot2.fixedToCamera = true;
                break;
            case 8:
                this.game.playerMaxThirst += 1;
                this.inventoryslot2 = this.add.sprite((14 * this.game.posMult), (14 * this.game.posMult), 'canteen');
                this.inventoryslot2.fixedToCamera = true;
                break;
            case 9:
                this.game.playerMaxThirst += 2;
                this.inventoryslot2 = this.add.sprite((14 * this.game.posMult), (14 * this.game.posMult), 'waterjug');
                this.inventoryslot2.fixedToCamera = true;
                break;
            case 10:
                this.game.playerMaxHealth += 1;
                this.inventoryslot2 = this.add.sprite((14 * this.game.posMult), (14 * this.game.posMult), 'mushroom');
                this.inventoryslot2.fixedToCamera = true;
                break;
            case 11:
                this.game.playerMaxHealth += 2;
                this.inventoryslot2 = this.add.sprite((14 * this.game.posMult), (14 * this.game.posMult), 'diamondarmor');
                this.inventoryslot2.fixedToCamera = true;
                break;
            default:
                break;
        }
        
        // Calculates PLAYER STATS
        if (this.game.slot1 === 10 || this.game.slot1 === 11 || this.game.slot2 === 10 || this.game.slot2 === 11) {
            if (this.game.playerMaxHealth > 5)
                this.game.playerMaxHealth = 5;
            while (this.game.playerHealth > this.game.playerMaxHealth)
                this.healthDecay(true);
            this.setHealth();
        }
        if (this.game.slot1 === 6 || this.game.slot1 === 7 || this.game.slot2 === 6 || this.game.slot2 === 7) {
            if (this.game.playerMaxHunger > 5)
                this.game.playerMaxHunger = 5;
            while (this.game.playerHunger > this.playerMaxHunger)
                this.hungerDecay(true);
            this.setHunger();
        }
        if (this.game.slot1 === 8 || this.game.slot1 === 9 || this.game.slot2 === 8 || this.game.slot2 === 9) {
            if (this.game.playerMaxThirst > 5)
                this.game.playerMaxThirst = 5;
            while (this.game.playerThirst > this.game.playerMaxThirst)
                this.thirstDrain(true);
            this.setThirst();
        }
        
        // Calculates NIGHT field of vision
        if (this.game.dayState === 'night'){
            if (this.game.infrared){
                this.light1.visible = false;
                this.light2.visible = false;
                switch(this.game.light){
                    case 1:
                        this.ir1.visible = true;
                        this.ir2.visible = false;
                        break;
                    case 2:
                        this.ir1.visible = false;
                        this.ir2.visible = true;
                        break;
                    default:
                        break;
                }
            }
            else {
                this.ir1.visible = false;
                this.ir2.visible = false;
                switch(this.game.light){
                    case 1:
                        this.light1.visible = true;
                        this.light2.visible = false;
                        break;
                    case 2:
                        this.light1.visible = false;
                        this.light2.visible = true;
                        break;
                    default:
                        break;
                }
            }
        }
        
        if (this.inventoryslot1 !== undefined){
            if (this.inventoryState)
                this.inventoryslot1.visible = true;
            else
                this.inventoryslot1.visible = false;
        }
        
        if (this.inventoryslot2 !== undefined){
            if (this.inventoryState)
                this.inventoryslot2.visible = true;
            else
                this.inventoryslot2.visible = false;
        }
    },
    
    movePlayerComponents: function() {
        /* IF STATEMENTS ARE USED HERE TO OPTIMIZE PERFORMANCE BY ONLY MOVING THE COMPONENTS THAT ARE RELEVANT */
        if (this.physics.arcade.overlap(this.game.player, this.river) || this.physics.arcade.overlap(this.game.player, this.lake)) {
            this.space.x = this.game.player.x - 8;
            this.space.y = this.game.player.y - 12;
        }
        if (this.game.hasShield){
            this.shield.x = this.game.player.x - 8;
            this.shield.y = this.game.player.y - 8;
        }
        if (this.game.dayState == 'night') {
            this.light1.x = this.game.player.x - 632;
            this.light1.y = this.game.player.y - 632;
            this.light2.x = this.game.player.x - 632;
            this.light2.y = this.game.player.y - 632;
            this.ir1.x = this.game.player.x - 632;
            this.ir1.y = this.game.player.y - 632;
            this.ir2.x = this.game.player.x - 632;
            this.ir2.y = this.game.player.y - 632;
        }
    },
    
    confirmOption: function() {
        if (this.exitGameState){
            this.game.paused = false;
            this.state.start('startMenu');
        }
        else if (this.supplyState){
            this.supplyState = false;
            this.supplyPrompt.visible = false;
            this.slotState = true;
            this.slotPrompt.visible = true;
        }
    },
    
    declineOption: function() {
        if (this.exitGameState){
            this.exitMenu.visible = false;
            this.exitGameState = false;
            this.game.paused = false;
        }
        else if (this.supplyState){
            this.supplyState = false;
            this.supplyPrompt.visible = false;
            this.resumeTimers();
        }
        
    },
    
    escapeSequence: function() {
        if(this.game.paused) {
            /* TEMPORARY CODE IN CASE OF GAME DIALOGUE OR INSTRUCTIONS */
            if (this.game.day === 1 && this.game.dayState === 'day')
                this.menu.kill();
            /* TEMPORARY CODE IN CASE OF GAME DIALOGUE OR INSTRUCTIONS */
            this.exitMenu.visible = false;
            this.exitGameState = false;
            this.game.paused = false;
        }
        else if (this.slotState){
            this.supplyState = true;
            this.supplyPrompt.visible = true;
            this.slotState = false;
            this.slotPrompt.visible = false;
        }
        else if (this.craftState) {
            this.craftState = false;
            this.game.interact = false;
            this.resourceText.visible = false;
            this.numLabel.visible = false;
            this.craftMenu.visible = false;
        }
        else {
            this.exitMenu.visible = true;
            this.exitGameState = true;
            this.game.paused = true;
        }
    },
    
    destroyPulse: function(pulse, rock) {
        pulse.kill();
    },
    
    stunDrone: function(pulse, drone){
        if (drone === this.drone1) {
            this.stunned1 = true;
            this.drone1.body.velocity.x = 0;
            this.drone1.body.velocity.y = 0;
            this.drone1.animations.play('stunned');
            this.stunTimer1 = this.time.create(true);
            this.stunTimer1.add(this.game.stunDuration, this.destroyStunTimer, this, 1);
            this.stunTimer1.start();
        }
        else if (drone === this.drone2) {
            this.stunned2 = true;
            this.drone2.body.velocity.x = 0;
            this.drone2.body.velocity.y = 0;
            this.drone2.animations.play('stunned');
            this.stunTimer2 = this.time.create(true);
            this.stunTimer2.add(this.game.stunDuration, this.destroyStunTimer, this, 2);
            this.stunTimer2.start();
        }
        else if (drone === this.drone3) {
            this.stunned3 = true;
            this.drone3.body.velocity.x = 0;
            this.drone3.body.velocity.y = 0;
            this.drone3.animations.play('stunned');
            this.stunTimer3 = this.time.create(true);
            this.stunTimer3.add(this.game.stunDuration, this.destroyStunTimer, this, 3);
            this.stunTimer3.start();
        }
        else if (drone === this.drone4) {
            this.stunned4 = true;
            this.drone4.body.velocity.x = 0;
            this.drone4.body.velocity.y = 0;
            this.drone4.animations.play('stunned');
            this.stunTimer4 = this.time.create(true);
            this.stunTimer4.add(this.game.stunDuration, this.destroyStunTimer, this, 4);
            this.stunTimer4.start();
        }
        else if (drone === this.drone5) {
            this.stunned5 = true;
            this.drone5.body.velocity.x = 0;
            this.drone5.body.velocity.y = 0;
            this.drone5.animations.play('stunned');
            this.stunTimer5 = this.time.create(true);
            this.stunTimer5.add(this.game.stunDuration, this.destroyStunTimer, this, 5);
            this.stunTimer5.start();
        }
        else if (drone === this.drone6) {
            this.stunned6 = true;
            this.drone6.body.velocity.x = 0;
            this.drone6.body.velocity.y = 0;
            this.drone6.animations.play('stunned');
            this.stunTimer6 = this.time.create(true);
            this.stunTimer6.add(this.game.stunDuration, this.destroyStunTimer, this, 6);
            this.stunTimer6.start();
        }
        else if (drone === this.drone7) {
            this.stunned7 = true;
            this.drone7.body.velocity.x = 0;
            this.drone7.body.velocity.y = 0;
            this.drone7.animations.play('stunned');
            this.stunTimer7 = this.time.create(true);
            this.stunTimer7.add(this.game.stunDuration, this.destroyStunTimer, this, 7);
            this.stunTimer7.start();
        }
        else if (drone === this.drone8) {
            this.stunned8 = true;
            this.drone8.body.velocity.x = 0;
            this.drone8.body.velocity.y = 0;
            this.drone8.frame = 1;
            this.stunTimer8 = this.time.create(true);
            this.stunTimer8.add(this.game.stunDuration, this.destroyStunTimer, this, 8);
            this.stunTimer8.start();
        }
        else if (drone === this.drone9) {
            this.stunned9 = true;
            this.drone9.body.velocity.x = 0;
            this.drone9.body.velocity.y = 0;
            this.drone9.animations.play('stunned');
            this.stunTimer9 = this.time.create(true);
            this.stunTimer9.add(this.game.stunDuration, this.destroyStunTimer, this, 9);
            this.stunTimer9.start();
        }
        else if (drone === this.drone10) {
            this.stunned10 = true;
            this.drone10.body.velocity.x = 0;
            this.drone10.body.velocity.y = 0;
            this.drone10.animations.play('stunned');
            this.stunTimer10 = this.time.create(true);
            this.stunTimer10.add(this.game.stunDuration, this.destroyStunTimer, this, 10);
            this.stunTimer10.start();
        }
        else if (drone === this.drone11) {
            this.stunned11 = true;
            this.drone11.body.velocity.x = 0;
            this.drone11.body.velocity.y = 0;
            this.drone11.animations.play('stunned');
            this.stunTimer11 = this.time.create(true);
            this.stunTimer11.add(this.game.stunDuration, this.destroyStunTimer, this, 11);
            this.stunTimer11.start();
        }
        else if (drone === this.drone12) {
            this.stunned12 = true;
            this.drone12.body.velocity.x = 0;
            this.drone12.body.velocity.y = 0;
            this.drone12.animations.play('stunned');
            this.stunTimer12 = this.time.create(true);
            this.stunTimer12.add(this.game.stunDuration, this.destroyStunTimer, this, 12);
            this.stunTimer12.start();
        }
        else if (drone === this.drone13) {
            this.stunned13 = true;
            this.drone13.body.velocity.x = 0;
            this.drone13.body.velocity.y = 0;
            this.drone13.animations.play('stunned');
            this.stunTimer13 = this.time.create(true);
            this.stunTimer13.add(this.game.stunDuration, this.destroyStunTimer, this, 13);
            this.stunTimer13.start();
        }
        else if (drone === this.drone14) {
            this.stunned14 = true;
            this.drone14.body.velocity.x = 0;
            this.drone14.body.velocity.y = 0;
            this.drone14.animations.play('stunned');
            this.stunTimer14 = this.time.create(true);
            this.stunTimer14.add(this.game.stunDuration, this.destroyStunTimer, this, 14);
            this.stunTimer14.start();
        }
        else if (drone === this.drone15) {
            this.stunned15 = true;
            this.drone15.body.velocity.x = 0;
            this.drone15.body.velocity.y = 0;
            this.drone15.animations.play('stunned');
            this.stunTimer15 = this.time.create(true);
            this.stunTimer15.add(this.game.stunDuration, this.destroyStunTimer, this, 15);
            this.stunTimer15.start();
        }
    },
    
    destroyStunTimer: function(droneNumber){
        switch (droneNumber) {
            case 1:
                this.stunned1 = false;
                this.drone1.animations.stop();
                this.drone1.frame = 0;
                break;
            case 2:
                this.stunned2 = false;
                this.drone2.animations.stop();
                this.drone2.frame = 0;
                break;
            case 3:
                this.stunned3 = false;
                this.drone3.animations.stop();
                this.drone3.frame = 0;
                break;
            case 4:
                this.stunned4 = false;
                this.drone4.animations.stop();
                this.drone4.frame = 0;
                break;
            case 5:
                this.stunned5 = false;
                this.drone5.animations.stop();
                this.drone5.frame = 0;
                break;
            case 6:
                this.stunned6 = false;
                this.drone6.animations.stop();
                this.drone6.frame = 0;
                break;
            case 7:
                this.stunned7 = false;
                this.drone7.animations.stop();
                this.drone7.frame = 0;
                break;
            case 8:
                this.stunned8 = false;
                this.drone8.animations.stop();
                this.drone8.frame = 0;
                break;
            case 9:
                this.stunned9 = false;
                this.drone9.animations.stop();
                this.drone9.frame = 0;
                break;
            case 10:
                this.stunned10 = false;
                this.drone10.animations.stop();
                this.drone10.frame = 0;
                break;
            case 11:
                this.stunned11 = false;
                this.drone11.animations.stop();
                this.drone11.frame = 0;
                break;
            case 12:
                this.stunned12 = false;
                this.drone12.animations.stop();
                this.drone12.frame = 0;
                break;
            case 13:
                this.stunned13 = false;
                this.drone13.animations.stop();
                this.drone13.frame = 0;
                break;
            case 14:
                this.stunned14 = false;
                this.drone14.animations.stop();
                this.drone14.frame = 0;
                break;
            case 15:
                this.stunned15 = false;
                this.drone15.animations.stop();
                this.drone15.frame = 0;
                break;
            default:
                break;
        }
    },
    
    healPlayer: function() {
        if (this.game.medKit > 0) {
            this.game.medKit -= 1;
            this.updateConsumables();
            while (this.game.playerHealth < this.game.playerMaxHealth)
                this.updateHealth(false);
        }
    },
    
    shieldPlayer: function() {
        if (this.game.shieldCount > 0 && !this.game.hasShield) {
            this.game.shieldCount -= 1;
            this.updateConsumables();
            this.game.hasShield = true;
            this.shield.visible = true;
        }
    },
    
    fireUp: function() {
        if (this.game.pulseRounds > 0 && !this.craftState){
            this.game.pulseRounds--;
            this.updateConsumables();
            this.pulseRound = this.pulse.create(this.game.player.x + 2, this.game.player.y + 2, 'pulse');
            this.pulseRound.body.velocity.y = -this.game.pulseSpeed;
        }
    },
    
    fireDown: function() {
        if (this.game.pulseRounds > 0 && !this.craftState){
            this.game.pulseRounds--;
            this.updateConsumables();
            this.pulseRound = this.pulse.create(this.game.player.x + 2, this.game.player.y + 2, 'pulse');
            this.pulseRound.body.velocity.y = this.game.pulseSpeed;
        }
    },
    
    fireLeft: function() {
        if (this.game.pulseRounds > 0 && !this.craftState){
            this.game.pulseRounds--;
            this.updateConsumables();
            this.pulseRound = this.pulse.create(this.game.player.x + 2, this.game.player.y + 2, 'pulse');
            this.pulseRound.body.velocity.x = -this.game.pulseSpeed;
        }
    },
    
    fireRight: function() {
        if (this.game.pulseRounds > 0 && !this.craftState){
            this.game.pulseRounds--;
            this.updateConsumables();
            this.pulseRound = this.pulse.create(this.game.player.x  + 2, this.game.player.y + 2, 'pulse');
            this.pulseRound.body.velocity.x = this.game.pulseSpeed;
        }
    },
    
    fireEnemyPulse: function() {
        //this.enemyPulseRound = this.enemyPulseRound();
    },
    
    option1: function(){
        if (this.craftState) {
            if (this.game.resourceCount >= 10 && this.game.medKit < 3) {
                this.game.resourceCount -= 10;
                this.updateResourceText();
                this.game.medKit++;
                this.updateConsumables();
                this.craftMenu.frame = 1;
            }
            else
                this.craftMenu.frame = 2;
        }
        else if (this.slotState){
            this.slotPrompt.visible = false;
            this.slotState = false;
            this.game.slot1 = this.spawnID;
            
            if (this.inventoryslot1 !== undefined)
                this.inventoryslot1.kill();
            if (this.inventoryslot2 !== undefined)
                this.inventoryslot2.kill();
            this.updateInventorySlots();
            this.resumeTimers();
        }
    },
    
    option2: function(){
        if (this.craftState) {
            if (this.game.resourceCount >= 3 && this.game.shieldCount < 3){
                this.game.resourceCount -= 3;
                this.updateResourceText();
                this.game.shieldCount++;
                this.updateConsumables();
                this.craftMenu.frame = 3;
            }
            else
                this.craftMenu.frame = 4;
        }
        else if (this.slotState){
            this.slotPrompt.visible = false;
            this.slotState = false;
            this.game.slot2 = this.spawnID;
            if (this.inventoryslot1 !== undefined)
                this.inventoryslot1.kill();
            if (this.inventoryslot2 !== undefined)
                this.inventoryslot2.kill();
            this.updateInventorySlots();
            this.resumeTimers();
        }
    },
    
    option3: function(){
        if (this.craftState) {
            if (this.game.resourceCount >= 5 && this.game.pulseRounds < 5){
                this.game.resourceCount -= 5;
                this.updateResourceText();
                this.game.pulseRounds = 5;
                this.updateConsumables();
                this.craftMenu.frame = 5;
            }
            else
                this.craftMenu.frame = 6;
        }
    },
    
    toggleCraftMenu: function() {
        if (this.craftState === false){
            this.craftState = true;
            this.game.interact = true;
            this.craftMenu.frame = 0;
            this.resourceText.visible = true;
            this.craftMenu.visible = true;
        }
        else {
            this.craftState = false;
            this.game.interact = false;
            this.resourceText.visible = false;
            this.craftMenu.visible = false;
        }
    },
    
    postLogicCheck: function() {
        /* POST LOGIC CHECKS */
        if (!this.spaceKey.isDown) {
            if (this.craftState !== true && this.supplyState !== true)
                this.game.interact = false;
            if (!this.game.hasShield && (this.damageImmune.running || this.game.losingHealth))
                this.game.player.animations.play('damaged');
            else
                this.game.player.animations.play('normal');
            this.thirstGain.destroy();
            if (!this.thirstDrain.running) {
                this.thirstDrain = this.time.create(true);
                this.thirstDrain.add(this.game.thirstDecay, this.updateThirst, this, true);
                this.thirstDrain.start();
            }
        }
        
        // slows player down when player is on sand or in water
        if (!this.physics.arcade.overlap(this.game.player, this.sand) && !this.physics.arcade.overlap(this.game.player, this.lake) && !this.physics.arcade.overlap(this.game.player, this.river)){
            this.game.isSlowed = false;
            this.space.visible = false;
            this.space.animations.stop();
        }
        
        // health drain occurs when either the player's thirst or hunger is at 0
        if (this.game.playerThirst === 0 || this.game.playerHunger === 0){
            this.game.losingHealth = true;
            if (!this.healthDrain.running){
                this.healthDrain = this.time.create(true);
                this.healthDrain.add(this.game.healthDecay, this.updateHealth, this, true);
                this.healthDrain.start();
            }
        }
        else {
            this.game.losingHealth = false;
            this.healthDrain.destroy();
        }
        
        // respawns more food when the food is collected after a certain amount of time
        if (this.game.numFood < this.game.maxFood){
            if (!this.foodRespawnTimer.running){
                this.foodRespawnTimer = this.time.create(true);
                this.foodRespawnTimer.add(this.game.foodRespawn, this.updateFood, this);
                this.foodRespawnTimer.start();
            }
        }
        
        // end condition
        if (this.game.playerHealth === 0)
            this.GameOver();
    },
    
    endDay: function() {
        if (this.darken.alpha < 1){
            this.darken.alpha += .05;
            this.nightTransition = this.time.create(true);
            this.nightTransition.add(25, this.endDay, this);
            this.nightTransition.start();
        }
        else {
            //Reset Variables
            this.inventoryState = false;
            this.game.hasShield = false;
            
            if (this.game.dayState === 'night')
                this.game.day++;
            this.calculateEvent();
            
            if (this.game.day <= 7) {
                this.state.start('worldgen');
            }
            else
                this.state.start('winState');
        }
    },
    
    quarterDay: function() {
        if (this.timedial.frame != 4 || this.timedial.frame != 8){
            this.timedial.frame++;
            this.quarterCount++;
            this.quarterCycle = this.time.create(true);
            this.quarterCycle.add((this.game.dayCycle / 4), this.quarterDay, this);
            this.quarterCycle.start();
        }
        
        if (this.quarterCount === 2){
            this.pickUp = true;
            this.supplyItem.visible = true;
        }
    },
    
    spawnSupplyItem: function() {
        this.spawnID = this.rnd.integerInRange(4, 11);
        /*if (this.game.dayState !== 'night')
            this.spawnID = 9;
        else
            this.spawnID = 8;
        */
        this.itemRarity = this.rnd.integerInRange(0, 5);/*
        if (this.itemRarity === 0)
            this.spawnID = this.rnd.integerInRange();
        else
            this.spawnID = this.rnd.integerInRange();*/
        switch (this.spawnID){
            // Allows Player to Locate Enemies at Night
            // +1 Medkit Consumable
            case 1:
                this.supplyItem = this.add.sprite((18 * this.game.posMult), (1 * this.game.posMult), 'medkit');
                break;
            // +1 Shield Consumable
            case 2:
                this.supplyItem = this.add.sprite((18 * this.game.posMult), (1 * this.game.posMult), 'shielditem');
                break;
            // Gives Resources
            case 3:
                this.supplyItem = this.add.sprite((18 * this.game.posMult), (1 * this.game.posMult), 'backpack');
                break;
                
            case 4:
                this.supplyItem = this.add.sprite((18 * this.game.posMult), (1 * this.game.posMult), 'irgoggles');
                break;
            // Increase Night Vision Radius by 2 Blocks
            case 5:
                this.supplyItem = this.add.sprite((18 * this.game.posMult), (1 * this.game.posMult), 'lamp');
                break;
            
            // +1, +2 Max Food Upgrade Items
            case 6:
                this.supplyItem = this.add.sprite((18 * this.game.posMult), (1 * this.game.posMult), 'picnicbasket');
                break;
            case 7:
                this.supplyItem = this.add.sprite((18 * this.game.posMult), (1 * this.game.posMult), 'refridgerator');
                break;
            // +1, +2 Max Thirst Upgrade Items
            case 8:
                this.supplyItem = this.add.sprite((18 * this.game.posMult), (1 * this.game.posMult), 'canteen');
                break;
            case 9:
                this.supplyItem = this.add.sprite((18 * this.game.posMult), (1 * this.game.posMult), 'waterjug');
                break;
            // +1, +2 Health Upgrade Items
            case 10:
                this.supplyItem = this.add.sprite((18 * this.game.posMult), (1 * this.game.posMult), 'mushroom');
                break;
            case 11:
                this.supplyItem = this.add.sprite((18 * this.game.posMult), (1 * this.game.posMult), 'diamondarmor');
                break;
            default:
                break;
        }
        this.physics.enable(this.supplyItem, Phaser.Physics.PHASER);
        this.supplyItem.visible = false;
    },
    
    calculateEvent: function() {
        if (this.game.day < 5 && !(this.game.day === 5 && this.game.dayState === 'night'))
            this.game.randomEvent1 = this.rnd.integerInRange(0, 12);
        else {
            this.game.randomEvent1 = this.rnd.integerInRange(1, 11);
            this.game.randomEvent2 = this.rnd.integerInRange(1, 11);
            switch(this.game.randomEvent1){
                case 1:
                    while (this.game.randomEvent2 == 1 || this.game.randomEvent2 == 2)
                        this.game.randomEvent2 = this.rnd.integerInRange(1, 11);
                    break;
                case 2:
                    while (this.game.randomEvent2 == 1 || this.game.randomEvent2 == 2)
                        this.game.randomEvent2 = this.rnd.integerInRange(1, 11);
                    break;
                case 3:
                    while (this.game.randomEvent2 == 3 || this.game.randomEvent2 == 4)
                        this.game.randomEvent2 = this.rnd.integerInRange(1, 11);
                    break;
                case 4:
                    while (this.game.randomEvent2 == 3 || this.game.randomEvent2 == 4)
                        this.game.randomEvent2 = this.rnd.integerInRange(1, 11);
                    break;
                case 5:
                    while (this.game.randomEvent2 == 5 || this.game.randomEvent2 == 6)
                        this.game.randomEvent2 = this.rnd.integerInRange(1, 11);
                    break;
                case 6:
                    while (this.game.randomEvent2 == 5 || this.game.randomEvent2 == 6)
                        this.game.randomEvent2 = this.rnd.integerInRange(1, 11);
                    break;
                case 7:
                    while (this.game.randomEvent2 == 7 || this.game.randomEvent2 == 8)
                        this.game.randomEvent2 = this.rnd.integerInRange(1, 11);
                    break;
                case 8:
                    while (this.game.randomEvent2 == 7 || this.game.randomEvent2 == 8)
                        this.game.randomEvent2 = this.rnd.integerInRange(1, 11);
                    break;
                case 9:
                    while (this.game.randomEvent2 == 9 || this.game.randomEvent2 == 10)
                        this.game.randomEvent2 = this.rnd.integerInRange(1, 11);
                    break;
                case 10:
                    while (this.game.randomEvent2 == 9 || this.game.randomEvent2 == 10)
                        this.game.randomEvent2 = this.rnd.integerInRange(1, 11);
                    break;
                case 11:
                    while (this.game.randomEvent2 == 11)
                        this.game.randomEvent2 = this.rnd.integerInRange(1, 11);
                default:
                    break;
            }
        }
    },
    
    lakeCollide: function() {
        this.game.isSlowed = true;
        if (this.spaceKey.isDown && !this.craftState){
            this.space.visible = false;
            this.space.animations.stop();
            this.game.player.animations.play('lakeRecover');
            this.game.interact = true;
            if (this.thirstDrain.running)
                this.thirstDrain.destroy();
            if (!this.thirstGain.running){
                this.thirstGain = this.time.create(false);
                this.thirstGain.add(this.game.thirstRestoreL, this.updateThirst, this, false);
                this.thirstGain.start();
            }
        }
        else {
            this.space.visible = true;
            this.space.animations.play('press');
        }
    },
    
    sandCollide: function() {
        this.game.isSlowed = true;
    },
    
    riverCollide: function() {
        this.game.isSlowed = true;
        if (this.spaceKey.isDown && !this.craftState){
            this.game.interact = true;
            if (this.thirstDrain.running)
                this.thirstDrain.destroy();
            if (!this.thirstGain.running){
                this.thirstGain = this.time.create(false);
                this.thirstGain.add(this.game.thirstRestoreR, this.updateThirst, this, false);
                this.thirstGain.start();
            }
            this.space.visible = false;
            this.space.animations.stop();
            this.game.player.animations.play('riverRecover');
        }
        else {
            this.space.visible = true;
            this.space.animations.play('press');
        }
    },
    
    fadeEventLabel: function() {
        if (this.game.day < 5) {
            if (this.randomEventLabel !== undefined) {
                if (this.randomEventLabel.alpha > 0){
                    this.randomEventLabel.alpha -= .05;
                    this.fadeAway = this.time.create(true);
                    this.fadeAway.add(25, this.fadeEventLabel, this);
                    this.fadeAway.start();
                }
            }
        }
        else {
            if (this.randomEventLabel.alpha > 0){
                this.randomEventLabel.alpha -= .05;
                this.randomEventLabel2.alpha -= .05;
                this.plus.alpha -= .05;
                this.fadeAway = this.time.create(true);
                this.fadeAway.add(25, this.fadeEventLabel, this);
                this.fadeAway.start();
            }
        }
    },
    
    initializeLight: function() {
        this.light1 = this.add.sprite((-17 * this.game.posMult) - 16, (-3 * this.game.posMult) + 16, 'light1');
        this.physics.enable(this.light1, Phaser.Physics.PHASER);
        this.light1.alpha = .95;
        
        this.light2 = this.add.sprite((-17 * this.game.posMult) - 16, (-3 * this.game.posMult) + 16, 'light2');
        this.physics.enable(this.light2, Phaser.Physics.PHASER);
        this.light2.alpha = .95;
        if (this.game.dayState === 'night' && !this.game.infrared) {
            switch(this.game.light) {
                case 1:
                    this.light2.visible = false;
                    break;
                case 2:
                    this.light1.visible = false;
                    break;
                default:
                    break;
            }
        }
        else {
            this.light1.visible = false;
            this.light2.visible = false;
        }
    },
    
    /* This method is the same as initializeLight, except that it will help control getting infrared goggles at night*/
    initializeInfrared: function() {
        this.ir1 = this.add.sprite((-17 * this.game.posMult) - 16, (-3 * this.game.posMult) + 16, 'light1');
        this.physics.enable(this.ir1, Phaser.Physics.PHASER);
        this.ir1.alpha = .95;
        
        this.ir2 = this.add.sprite((-17 * this.game.posMult) - 16, (-3 * this.game.posMult) + 16, 'light2');
        this.physics.enable(this.ir2, Phaser.Physics.PHASER);
        this.ir2.alpha = .95;
        if (this.game.dayState === 'night' && this.game.infrared) {
            switch(this.game.light) {
                case 1:
                    this.ir2.visible = false;
                    break;
                case 2:
                    this.ir1.visible = false;
                    break;
                default:
                    break;
            }
        }
        else {
            this.ir1.visible = false;
            this.ir2.visible = false;
        }
    },
    
    damagePlayer: function() {
        if (!this.damageImmune.running){
            if (this.game.hasShield)
                this.shield.animations.play('shieldDown');
            else
                this.updateHealth(true);
            this.damageImmune = this.time.create(true);
            this.damageImmune.add(this.game.damageImmuneTime, this.destroyImmuneTimer, this);
            this.damageImmune.start();
        }
        
    },
    
    destroyImmuneTimer: function() {
        this.damageImmune.destroy();
        if (this.game.hasShield){
            this.game.hasShield = false;
            this.shield.animations.stop();
            this.shield.visible = false;
        }
        this.game.player.animations.play('normal');
    },
    
    
    
    collectFood: function(player, food) {
        this.food.remove(food);
        this.foodRespawnTimer.destroy();
        this.updateHunger(false);
        this.game.numFood--;
    },
    
    collectResource: function(player, resource) {
        this.resource.remove(resource);
        this.game.resourceCount++;
        this.updateResourceText();
        if (this.game.resourceCount < 10)
            this.resourceText = this.add.text((3 * this.game.posMult) - 13, (10 * this.game.posMult) + 20, '  ' + this.game.resourceCount, { font: '16px Arial', fill: '#FFF'});
        else if (this.game.resourceCount < 100)
            this.resourceText = this.add.text((3 * this.game.posMult) - 13, (10 * this.game.posMult) + 20, ' ' + this.game.resourceCount, { font: '16px Arial', fill: '#FFF'});
        else
            this.resourceText = this.add.text((3 * this.game.posMult) - 13, (10 * this.game.posMult) + 20, '' + this.game.resourceCount, { font: '16px Arial', fill: '#FFF'});
        this.resourceText.visible = false;
        this.resourceText.fixedToCamera = true;
    },
    
    updateHealth: function(drain) {
        if (drain) {
            switch(this.game.playerHealth) {
                case 5:
                    this.health5.alpha = 0.2;
                    this.game.playerHealth = 4;
                    break;
                case 4:
                    this.health4.alpha = 0.2;
                    this.game.playerHealth = 3;
                    break;
                case 3:
                    this.health3.alpha = 0.2;
                    this.game.playerHealth = 2;
                    break;
                case 2:
                    this.health2.alpha = 0.2;
                    this.game.playerHealth = 1;
                    break;
                case 1:
                    this.health1.alpha = 0.2;
                    this.game.playerHealth = 0;
                    break;
                default:
                    break;
            }
        }
        else {
            switch(this.game.playerHealth) {
                case 4:
                    this.health5.alpha = 1;
                    if (this.game.playerMaxhealth > 4)
                        this.game.playerHealth = 5;
                    break;
                case 3:
                    this.health4.alpha = 1;
                    if (this.game.playerMaxhealth > 3)
                        this.game.playerHealth = 4;
                    break;
                case 2:
                    this.health3.alpha = 1;
                    this.game.playerHealth = 3;
                    break;
                case 1:
                    this.health2.alpha = 1;
                    this.game.playerHealth = 2;
                    break;
                case 0:
                    this.health1.alpha = 1;
                    this.game.playerHealth = 1;
                    break;
                default:
                    break;
            }
        }
        if (this.game.losingHealth)
            this.healthDrain.destroy();
    },
    
    updateHunger: function(drain) {
        if (drain) {
            switch(this.game.playerHunger) {
                case 5:
                    this.hunger5.alpha = 0.2;
                    this.game.playerHunger = 4;
                    break;
                case 4:
                    this.hunger4.alpha = 0.2;
                    this.game.playerHunger = 3;
                    break;
                case 3:
                    this.hunger3.alpha = 0.2;
                    this.game.playerHunger = 2;
                    break;
                case 2:
                    this.hunger2.alpha = 0.2;
                    this.game.playerHunger = 1;
                    break;
                case 1:
                    this.hunger1.alpha = 0.2;
                    this.game.playerHunger = 0;
                    break;
                default:
                    break;
            }
        }
        else {
            switch(this.game.playerHunger) {
                case 4:
                    this.hunger5.alpha = 1;
                    if (this.game.playerMaxHunger > 4)
                        this.game.playerHunger = 5;
                    break;
                case 3:
                    this.hunger4.alpha = 1;
                    if (this.game.playerMaxHunger > 3)
                        this.game.playerHunger = 4;
                    break;
                case 2:
                    this.hunger3.alpha = 1;
                    this.game.playerHunger = 3;
                    break;
                case 1:
                    this.hunger2.alpha = 1;
                    this.game.playerHunger = 2;
                    break;
                case 0:
                    this.hunger1.alpha = 1;
                    this.game.playerHunger = 1;
                    break;
                default:
                    break;
            }
        }
        this.hungerDrain.destroy();
        this.hungerDrain = this.time.create(false);
        this.hungerDrain.add(this.game.hungerDecay, this.updateHunger, this, true);
        this.hungerDrain.start();
    },
    
    updateThirst: function(drain) {
        if (drain) {
            switch(this.game.playerThirst) {
                case 5:
                    this.thirst5.alpha = 0.2;
                    this.game.playerThirst = 4;
                    break;
                case 4:
                    this.thirst4.alpha = 0.2;
                    this.game.playerThirst = 3;
                    break;
                case 3:
                    this.thirst3.alpha = 0.2;
                    this.game.playerThirst = 2;
                    break;
                case 2:
                    this.thirst2.alpha = 0.2;
                    this.game.playerThirst = 1;
                    break;
                case 1:
                    this.thirst1.alpha = 0.2;
                    this.game.playerThirst = 0;
                    break;
                default:
                    break;
            }
        }
        else {
            switch(this.game.playerThirst) {
                case 4:
                    this.thirst5.alpha = 1;
                    if (this.game.playerMaxThirst > 4)
                        this.game.playerThirst = 5;
                    break;
                case 3:
                    this.thirst4.alpha = 1;
                    if (this.game.playerMaxThirst > 3)
                        this.game.playerThirst = 4;
                    break;
                case 2:
                    this.thirst3.alpha = 1;
                    this.game.playerThirst = 3;
                    break;
                case 1:
                    this.thirst2.alpha = 1;
                    this.game.playerThirst = 2;
                    break;
                case 0:
                    this.thirst1.alpha = 1;
                    this.game.playerThirst = 1;
                    break;
                default:
                    break;
            }
        }
        if (!this.game.interact) {
            this.thirstDrain = this.time.create(true);
            this.thirstDrain.add(this.game.thirstDecay, this.updateThirst, this, true);
            this.thirstDrain.start();
        }
        else {
            this.thirstGain.destroy();
        }
    },
    
    updateFood: function() {
        count = this.game.maxFood - this.game.numFood;
        while (count > 0){
            canSpawn = true;
            x = this.rnd.integerInRange(0, 19);
            y = this.rnd.integerInRange(0, 19);
            for (i = 0; i< this.game.spawnExclX.length; i++){
                if (x === this.game.spawnExclX[i] && y === this.game.spawnExclY[i]){
                    canSpawn = false;
                    break;
                }
            }
            if (canSpawn){
                this.food.create((x * this.game.posMult) + 8, (y * this.game.posMult) + 8, 'food');
                this.game.numFood++;
                count--;   
            }
        }
    },
    
    updateResourceText: function() {
        if (this.game.resourceCount < 10)
            this.resourceText.text = '  ' + this.game.resourceCount;
        else if (this.game.resourceCount < 100)
            this.resourceText.text = ' ' + this.game.resourceCount;
        else
            this.resourceText.text = '' + this.game.resourceCount;
    },
    
    droneMoveCalc: function(subgroup) {
        /* 0 = stop; 1 = up; 2 = down; 3 = left; 4 = right */
        direction = this.rnd.integerInRange(0, 4);
        duration = this.rnd.integerInRange(0, 3) * Phaser.Timer.SECOND;
        switch (subgroup){
            case 1:
                this.droneDir1 = direction;
                this.dronePatrol1 = this.time.create(true);
                this.dronePatrol1.add(duration, this.droneMoveCalc, this, 1);
                this.dronePatrol1.start();
                break;
            case 2:
                this.droneDir2 = direction;
                this.dronePatrol2 = this.time.create(true);
                this.dronePatrol2.add(duration, this.droneMoveCalc, this, 2);
                this.dronePatrol2.start();
                break;
            case 3:
                this.droneDir3 = direction;
                this.dronePatrol3 = this.time.create(true);
                this.dronePatrol3.add(duration, this.droneMoveCalc, this, 3);
                this.dronePatrol3.start();
                break;
            case 4:
                this.droneDir4 = direction;
                this.dronePatrol4 = this.time.create(true);
                this.dronePatrol4.add(duration, this.droneMoveCalc, this, 4);
                this.dronePatrol4.start();
                break;
            case 5:
                this.droneDir5 = direction;
                this.dronePatrol5 = this.time.create(true);
                this.dronePatrol5.add(duration, this.droneMoveCalc, this, 5);
                this.dronePatrol5.start();
                break;
            default:
                break;
        }
    },
    
    droneTarget: function() {
        switch (this.game.maxDrones){
            case 15:
                if (Math.abs(this.game.player.x - this.drone11.x) < 64 && Math.abs(this.game.player.y - this.drone11.y) < 64 && !this.stunned11){
                    this.follow11 = true;
                    this.physics.arcade.moveToObject(this.drone11, this.game.player, this.game.droneSpeed);
                }
                else
                    this.follow11 = false;
                if (Math.abs(this.game.player.x - this.drone12.x) < 64 && Math.abs(this.game.player.y - this.drone12.y) < 64 && !this.stunned12){
                    this.follow12 = true;
                    this.physics.arcade.moveToObject(this.drone12, this.game.player, this.game.droneSpeed);
                }
                else
                    this.follow12 = false;
                if (Math.abs(this.game.player.x - this.drone13.x) < 64 && Math.abs(this.game.player.y - this.drone13.y) < 64 && !this.stunned13){
                    this.follow13 = true;
                    this.physics.arcade.moveToObject(this.drone13, this.game.player, this.game.droneSpeed);
                }
                else
                    this.follow13 = false;
                if (Math.abs(this.game.player.x - this.drone14.x) < 64 && Math.abs(this.game.player.y - this.drone14.y) < 64 && !this.stunned14){
                    this.follow14 = true;
                    this.physics.arcade.moveToObject(this.drone14, this.game.player, this.game.droneSpeed);
                }
                else
                    this.follow14 = false;
                if (Math.abs(this.game.player.x - this.drone15.x) < 64 && Math.abs(this.game.player.y - this.drone15.y) < 64 && !this.stunned15){
                    this.follow15 = true;
                    this.physics.arcade.moveToObject(this.drone15, this.game.player, this.game.droneSpeed);
                }
                else
                    this.follow15 = false;
            case 10:
                if (Math.abs(this.game.player.x - this.drone6.x) < 64 && Math.abs(this.game.player.y - this.drone6.y) < 64 && !this.stunned6){
                    this.follow6 = true;
                    this.physics.arcade.moveToObject(this.drone6, this.game.player, this.game.droneSpeed);
                }
                else
                    this.follow6 = false;
                if (Math.abs(this.game.player.x - this.drone7.x) < 64 && Math.abs(this.game.player.y - this.drone7.y) < 64 && !this.stunned7){
                    this.follow7 = true;
                    this.physics.arcade.moveToObject(this.drone7, this.game.player, this.game.droneSpeed);
                }
                else
                    this.follow7 = false;
        
                if (Math.abs(this.game.player.x - this.drone8.x) < 64 && Math.abs(this.game.player.y - this.drone8.y) < 64 && !this.stunned8){
                    this.follow8 = true;
                    this.physics.arcade.moveToObject(this.drone8, this.game.player, this.game.droneSpeed);
                }
                else
                    this.follow8 = false;
                if (Math.abs(this.game.player.x - this.drone9.x) < 64 && Math.abs(this.game.player.y - this.drone9.y) < 64 && !this.stunned9){
                    this.follow9 = true;
                    this.physics.arcade.moveToObject(this.drone9, this.game.player, this.game.droneSpeed);
                }
                else
                    this.follow9 = false;
                if (Math.abs(this.game.player.x - this.drone10.x) < 64 && Math.abs(this.game.player.y - this.drone10.y) < 64 && !this.stunned10){
                    this.follow10 = true;
                    this.physics.arcade.moveToObject(this.drone10, this.game.player, this.game.droneSpeed);
                }
                else
                    this.follow10 = false;
            case 5:
                if (Math.abs(this.game.player.x - this.drone1.x) < 64 && Math.abs(this.game.player.y - this.drone1.y) < 64 && !this.stunned1){
                    this.follow1 = true;
                    this.physics.arcade.moveToObject(this.drone1, this.game.player, this.game.droneSpeed);
                }
                else
                    this.follow1 = false;
        
                if (Math.abs(this.game.player.x - this.drone2.x) < 64 && Math.abs(this.game.player.y - this.drone2.y) < 64 && !this.stunned2){
                    this.follow2 = true;
                    this.physics.arcade.moveToObject(this.drone2, this.game.player, this.game.droneSpeed);
                }
                else
                    this.follow2 = false;
                if (Math.abs(this.game.player.x - this.drone3.x) < 64 && Math.abs(this.game.player.y - this.drone3.y) < 64 && !this.stunned3){
                    this.follow3 = true;
                    this.physics.arcade.moveToObject(this.drone3, this.game.player, this.game.droneSpeed);
                }
                else
                    this.follow3 = false;    
                if (Math.abs(this.game.player.x - this.drone4.x) < 64 && Math.abs(this.game.player.y - this.drone4.y) < 64 && !this.stunned4){
                    this.follow4 = true;
                    this.physics.arcade.moveToObject(this.drone4, this.game.player, this.game.droneSpeed);
                }
                else
                    this.follow4 = false;
                if (Math.abs(this.game.player.x - this.drone5.x) < 64 && Math.abs(this.game.player.y - this.drone5.y) < 64 && !this.stunned5){
                    this.follow5 = true;
                    this.physics.arcade.moveToObject(this.drone5, this.game.player, this.game.droneSpeed);
                }
                else
                    this.follow5 = false;
                break;
            default:
                break;
        }  
    },
    
    dronePatrol: function() {
        if (this.dronePatrol1.running) {
            switch (this.game.maxDrones) {
                case 15:
                    switch (this.droneDir1) {
                        case 0:
                            if (!this.follow11 && !this.stunned11) {
                                this.drone11.body.velocity.x = 0;
                                this.drone11.body.velocity.y = 0;
                            }
                            if (!this.follow6 && !this.stunned6) {
                                this.drone6.body.velocity.x = 0;
                                this.drone6.body.velocity.y = 0;
                            }
                            if (!this.follow1 && !this.stunned1) {
                                this.drone1.body.velocity.x = 0;
                                this.drone1.body.velocity.y = 0;
                            }
                            break;
                        case 1:
                            if (!this.follow11 && !this.stunned11) {
                                this.drone11.body.velocity.x = 0;
                                this.drone11.body.velocity.y = -this.game.droneSpeed;
                            }
                            if (!this.follow6 && !this.stunned6) {
                                this.drone6.body.velocity.x = 0;
                                this.drone6.body.velocity.y = -this.game.droneSpeed;
                            }
                            if (!this.follow1 && !this.stunned1) {
                                this.drone1.body.velocity.x = 0;
                                this.drone1.body.velocity.y = -this.game.droneSpeed;
                            }
                            break;
                        case 2:
                            if (!this.follow11 && !this.stunned11) {
                                this.drone11.body.velocity.x = 0;
                                this.drone11.body.velocity.y = this.game.droneSpeed;
                            }
                            if (!this.follow6 && !this.stunned6) {
                                this.drone6.body.velocity.x = 0;
                                this.drone6.body.velocity.y = this.game.droneSpeed;
                            }
                            if (!this.follow1 && !this.stunned1) {
                                this.drone1.body.velocity.x = 0;
                                this.drone1.body.velocity.y = this.game.droneSpeed;
                            }
                            break;
                        case 3:
                            if (!this.follow11 && !this.stunned11) {
                                this.drone11.body.velocity.x = -this.game.droneSpeed;
                                this.drone11.body.velocity.y = 0;
                            }
                            if (!this.follow6 && !this.stunned6) {
                                this.drone6.body.velocity.x = -this.game.droneSpeed;
                                this.drone6.body.velocity.y = 0;
                            }
                            if (!this.follow1 && !this.stunned1) {
                                this.drone1.body.velocity.x = -this.game.droneSpeed;
                                this.drone1.body.velocity.y = 0;
                            }
                            break;
                        case 4:
                            if (!this.follow11 && !this.stunned11) {
                                this.drone11.body.velocity.x = this.game.droneSpeed;
                                this.drone6.body.velocity.x = this.game.droneSpeed;
                            }
                            if (!this.follow6 && !this.stunned6) {
                                this.drone1.body.velocity.x = this.game.droneSpeed;
                                this.drone11.body.velocity.y = 0;
                            }
                            if (!this.follow1 && !this.stunned1) {
                                this.drone6.body.velocity.y = 0;
                                this.drone1.body.velocity.y = 0;
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                case 10:
                    switch (this.droneDir1) {
                        case 0:
                            if (!this.follow6 && !this.stunned6) {
                                this.drone6.body.velocity.x = 0;
                                this.drone6.body.velocity.y = 0;
                            }
                            if (!this.follow1 && !this.stunned1) {
                                this.drone1.body.velocity.x = 0;
                                this.drone1.body.velocity.y = 0;
                            }
                            break;
                        case 1:
                            if (!this.follow6 && !this.stunned6) {
                                this.drone6.body.velocity.x = 0;
                                this.drone6.body.velocity.y = -this.game.droneSpeed;
                            }
                            if (!this.follow1 && !this.stunned1) {
                                this.drone1.body.velocity.x = 0;
                                this.drone1.body.velocity.y = -this.game.droneSpeed;
                            }
                            break;
                        case 2:
                            if (!this.follow6 && !this.stunned6) {
                                this.drone6.body.velocity.x = 0;
                                this.drone6.body.velocity.y = this.game.droneSpeed;
                            }
                            if (!this.follow1 && !this.stunned1) {
                                this.drone1.body.velocity.x = 0;
                                this.drone1.body.velocity.y = this.game.droneSpeed;
                            }
                            break;
                        case 3:
                            if (!this.follow6 && !this.stunned6) {
                                this.drone6.body.velocity.x = -this.game.droneSpeed;
                                this.drone6.body.velocity.y = 0;
                            }
                            if (!this.follow1 && !this.stunned1) {
                                this.drone1.body.velocity.x = -this.game.droneSpeed;
                                this.drone1.body.velocity.y = 0;
                            }
                            break;
                        case 4:
                            if (!this.follow6 && !this.stunned6) {
                                this.drone6.body.velocity.x = this.game.droneSpeed;
                                this.drone6.body.velocity.y = 0;
                            }
                            if (!this.follow1 && !this.stunned1) {
                                this.drone1.body.velocity.x = this.game.droneSpeed;
                                this.drone1.body.velocity.y = 0;
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                case 5:
                    switch (this.droneDir1) {
                        case 0:
                            if (!this.follow1 && !this.stunned1) {
                                this.drone1.body.velocity.x = 0;
                                this.drone1.body.velocity.y = 0;
                            }
                            break;
                        case 1:
                            if (!this.follow1 && !this.stunned1) {
                                this.drone1.body.velocity.x = 0;
                                this.drone1.body.velocity.y = -this.game.droneSpeed;
                            }
                            break;
                        case 2:
                            if (!this.follow1 && !this.stunned1) {
                                this.drone1.body.velocity.x = 0;
                                this.drone1.body.velocity.y = this.game.droneSpeed;
                            }
                            break;
                        case 3:
                            if (!this.follow1 && !this.stunned1) {
                                this.drone1.body.velocity.x = -this.game.droneSpeed;
                                this.drone1.body.velocity.y = 0;
                            }
                            break;
                        case 4:
                            if (!this.follow1 && !this.stunned1) {
                                this.drone1.body.velocity.x = this.game.droneSpeed;
                                this.drone1.body.velocity.y = 0;
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
        
        if (this.dronePatrol2.running) {
            switch (this.game.maxDrones) {
                case 15:
                    switch (this.droneDir2) {
                        case 0:
                            if (!this.follow12 && !this.stunned12) {
                                this.drone12.body.velocity.x = 0;
                                this.drone12.body.velocity.y = 0;
                            }
                            if (!this.follow7 && !this.stunned7) {
                                this.drone7.body.velocity.x = 0;
                                this.drone7.body.velocity.y = 0;
                            }
                            if (!this.follow2 && !this.stunned2) {
                                this.drone2.body.velocity.x = 0;
                                this.drone2.body.velocity.y = 0;
                            }
                            break;
                        case 1:
                            if (!this.follow12 && !this.stunned12) {
                                this.drone12.body.velocity.x = 0;
                                this.drone12.body.velocity.y = -this.game.droneSpeed;
                            }
                            if (!this.follow7 && !this.stunned7) {
                                this.drone7.body.velocity.x = 0;
                                this.drone7.body.velocity.y = -this.game.droneSpeed;
                            }
                            if (!this.follow2 && !this.stunned2) {
                                this.drone2.body.velocity.x = 0;
                                this.drone2.body.velocity.y = -this.game.droneSpeed;
                            }
                            break;
                        case 2:
                            if (!this.follow12 && !this.stunned12) {
                                this.drone12.body.velocity.x = 0;
                                this.drone12.body.velocity.y = this.game.droneSpeed;
                            }
                            if (!this.follow7 && !this.stunned7) {
                                this.drone7.body.velocity.x = 0;
                                this.drone7.body.velocity.y = this.game.droneSpeed;
                            }
                            if (!this.follow2 && !this.stunned2) {
                                this.drone2.body.velocity.x = 0;
                                this.drone2.body.velocity.y = this.game.droneSpeed;
                            }
                            break;
                        case 3:
                            if (!this.follow12 && !this.stunned12) {
                                this.drone12.body.velocity.x = -this.game.droneSpeed;
                                this.drone12.body.velocity.y = 0;
                            }
                            if (!this.follow7 && !this.stunned7) {
                                this.drone7.body.velocity.x = -this.game.droneSpeed;
                                this.drone7.body.velocity.y = 0;
                            }
                            if (!this.follow2 && !this.stunned2) {
                                this.drone2.body.velocity.x = -this.game.droneSpeed;
                                this.drone2.body.velocity.y = 0;
                            }
                            break;
                        case 4:
                            if (!this.follow12 && !this.stunned12) {
                                this.drone12.body.velocity.x = this.game.droneSpeed;
                                this.drone12.body.velocity.y = 0;
                            }
                            if (!this.follow7 && !this.stunned7) {
                                this.drone7.body.velocity.x = this.game.droneSpeed;
                                this.drone7.body.velocity.y = 0;
                            }
                            if (!this.follow2 && !this.stunned2) {
                                this.drone2.body.velocity.x = this.game.droneSpeed;
                                this.drone2.body.velocity.y = 0;
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                case 10:
                    switch (this.droneDir2) {
                        case 0:
                            if (!this.follow7 && !this.stunned7) {
                                this.drone7.body.velocity.x = 0;
                                this.drone7.body.velocity.y = 0;
                            }
                            if (!this.follow2 && !this.stunned2) {
                                this.drone2.body.velocity.x = 0;
                                this.drone2.body.velocity.y = 0;
                            }
                            break;
                        case 1:
                            if (!this.follow7 && !this.stunned7) {
                                this.drone7.body.velocity.x = 0;
                                this.drone7.body.velocity.y = -this.game.droneSpeed;
                            }
                            if (!this.follow2 && !this.stunned2) {
                                this.drone2.body.velocity.x = 0;
                                this.drone2.body.velocity.y = -this.game.droneSpeed;
                            }
                            break;
                        case 2:
                            if (!this.follow7 && !this.stunned7) {
                                this.drone7.body.velocity.x = 0;
                                this.drone7.body.velocity.y = this.game.droneSpeed;
                            }
                            if (!this.follow2 && !this.stunned2) {
                                this.drone2.body.velocity.x = 0;
                                this.drone2.body.velocity.y = this.game.droneSpeed;
                            }
                            break;
                        case 3:
                            if (!this.follow7) {
                                this.drone7.body.velocity.x = -this.game.droneSpeed;
                                this.drone7.body.velocity.y = 0;
                            }
                            if (!this.follow2) {
                                this.drone2.body.velocity.x = -this.game.droneSpeed;
                                this.drone2.body.velocity.y = 0;
                            }
                            break;
                        case 4:
                            if (!this.follow7 && !this.stunned7) {
                                this.drone7.body.velocity.x = this.game.droneSpeed;
                                this.drone7.body.velocity.y = 0;
                            }
                            if (!this.follow2 && !this.stunned2) {
                                this.drone2.body.velocity.x = this.game.droneSpeed;
                                this.drone2.body.velocity.y = 0;
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                case 5:
                    switch (this.droneDir2) {
                        case 0:
                            if (!this.follow2 && !this.stunned2) {
                                this.drone2.body.velocity.x = 0;
                                this.drone2.body.velocity.y = 0;
                            }
                            break;
                        case 1:
                            if (!this.follow2 && !this.stunned2) {
                                this.drone2.body.velocity.x = 0;
                                this.drone2.body.velocity.y = -this.game.droneSpeed;
                            }
                            break;
                        case 2:
                            if (!this.follow2 && !this.stunned2) {
                                this.drone2.body.velocity.x = 0;
                                this.drone2.body.velocity.y = this.game.droneSpeed;
                            }
                            break;
                        case 3:
                            if (!this.follow2 && !this.stunned2) {
                                this.drone2.body.velocity.x = -this.game.droneSpeed;
                                this.drone2.body.velocity.y = 0;
                            }
                            break;
                        case 4:
                            if (!this.follow2 && !this.stunned2) {
                                this.drone2.body.velocity.x = this.game.droneSpeed;
                                this.drone2.body.velocity.y = 0;
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
        
        if (this.dronePatrol3.running) {
            switch (this.game.maxDrones) {
                case 15:
                    switch (this.droneDir3) {
                        case 0:
                            if (!this.follow13 && !this.stunned13) {
                                this.drone13.body.velocity.x = 0;
                                this.drone13.body.velocity.y = 0;
                            }
                            if (!this.follow8 && !this.stunned8) {
                                this.drone8.body.velocity.x = 0;
                                this.drone8.body.velocity.y = 0;
                            }
                            if (!this.follow3 && !this.stunned3) {
                                this.drone3.body.velocity.x = 0;
                                this.drone3.body.velocity.y = 0;
                            }
                            break;
                        case 1:
                            if (!this.follow13 && !this.stunned13) {
                                this.drone13.body.velocity.x = 0;
                                this.drone13.body.velocity.y = -this.game.droneSpeed;
                            }
                            if (!this.follow8 && !this.stunned8) {
                                this.drone8.body.velocity.x = 0;
                                this.drone8.body.velocity.y = -this.game.droneSpeed;
                            }
                            if (!this.follow3 && !this.stunned3) {
                                this.drone3.body.velocity.x = 0;
                                this.drone3.body.velocity.y = -this.game.droneSpeed;
                            }
                            break;
                        case 2:
                            if (!this.follow13 && !this.stunned13) {
                                this.drone13.body.velocity.x = 0;
                                this.drone13.body.velocity.y = this.game.droneSpeed;
                            }
                            if (!this.follow8 && !this.stunned8) {
                                this.drone8.body.velocity.x = 0;
                                this.drone8.body.velocity.y = this.game.droneSpeed;
                            }
                            if (!this.follow3 && !this.stunned3) {
                                this.drone3.body.velocity.x = 0;
                                this.drone3.body.velocity.y = this.game.droneSpeed;
                            }
                            break;
                        case 3:
                            if (!this.follow13 && !this.stunned13) {
                                this.drone13.body.velocity.x = -this.game.droneSpeed;
                                this.drone13.body.velocity.y = 0;
                            }
                            if (!this.follow8 && !this.stunned8) {
                                this.drone8.body.velocity.x = -this.game.droneSpeed;
                                this.drone8.body.velocity.y = 0;
                            }
                            if (!this.follow3 && !this.stunned3) {
                                this.drone3.body.velocity.x = -this.game.droneSpeed;
                                this.drone3.body.velocity.y = 0;
                            }
                            break;
                        case 4:
                            if (!this.follow13 && !this.stunned13) {
                                this.drone13.body.velocity.x = this.game.droneSpeed;
                                this.drone13.body.velocity.y = 0;
                            }
                            if (!this.follow8 && !this.stunned8) {
                                this.drone8.body.velocity.x = this.game.droneSpeed;
                                this.drone8.body.velocity.y = 0;
                            }
                            if (!this.follow3 && !this.stunned3) {
                                this.drone3.body.velocity.x = this.game.droneSpeed;
                                this.drone3.body.velocity.y = 0;
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                case 10:
                    switch (this.droneDir3) {
                        case 0:
                            if (!this.follow8 && !this.stunned8) {
                                this.drone8.body.velocity.x = 0;
                                this.drone8.body.velocity.y = 0;
                            }
                            if (!this.follow3 && !this.stunned3) {
                                this.drone3.body.velocity.x = 0;
                                this.drone3.body.velocity.y = 0;
                            }
                            break;
                        case 1:
                            if (!this.follow8 && !this.stunned8) {
                                this.drone8.body.velocity.x = 0;
                                this.drone8.body.velocity.y = -this.game.droneSpeed;
                            }
                            if (!this.follow3 && !this.stunned3) {
                                this.drone3.body.velocity.x = 0;
                                this.drone3.body.velocity.y = -this.game.droneSpeed;
                            }
                            break;
                        case 2:
                            if (!this.follow8 && !this.stunned8) {
                                this.drone8.body.velocity.x = 0;
                                this.drone8.body.velocity.y = this.game.droneSpeed;
                            }
                            if (!this.follow3 && !this.stunned3) {
                                this.drone3.body.velocity.x = 0;
                                this.drone3.body.velocity.y = this.game.droneSpeed;
                            }
                            break;
                        case 3:
                            if (!this.follow8 && !this.stunned8) {
                                this.drone8.body.velocity.x = -this.game.droneSpeed;
                                this.drone8.body.velocity.y = 0;
                            }
                            if (!this.follow3 && !this.stunned3) {
                                this.drone3.body.velocity.x = -this.game.droneSpeed;
                                this.drone3.body.velocity.y = 0;
                            }
                            break;
                        case 4:
                            if (!this.follow8 && !this.stunned8) {
                                this.drone8.body.velocity.x = this.game.droneSpeed;
                                this.drone8.body.velocity.y = 0;
                            }
                            if (!this.follow3 && !this.stunned3) {
                                this.drone3.body.velocity.x = this.game.droneSpeed;
                                this.drone3.body.velocity.y = 0;
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                case 5:
                    switch (this.droneDir3) {
                        case 0:
                            if (!this.follow3 && !this.stunned3) {
                                this.drone3.body.velocity.x = 0;
                                this.drone3.body.velocity.y = 0;
                            }
                            break;
                        case 1:
                            if (!this.follow3 && !this.stunned3) {
                                this.drone3.body.velocity.x = 0;
                                this.drone3.body.velocity.y = -this.game.droneSpeed;
                            }
                            break;
                        case 2:
                            if (!this.follow3 && !this.stunned3) {
                                this.drone3.body.velocity.x = 0;
                                this.drone3.body.velocity.y = this.game.droneSpeed;
                            }
                            break;
                        case 3:
                            if (!this.follow3 && !this.stunned3) {
                                this.drone3.body.velocity.x = -this.game.droneSpeed;
                                this.drone3.body.velocity.y = 0;
                            }
                            break;
                        case 4:
                            if (!this.follow3 && !this.stunned3) {
                                this.drone3.body.velocity.x = this.game.droneSpeed;
                                this.drone3.body.velocity.y = 0;
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
        
        if (this.dronePatrol4.running) {
            switch (this.game.maxDrones) {
                case 15:
                    switch (this.droneDir4) {
                        case 0:
                            if (!this.follow14 && !this.stunned14) {
                                this.drone14.body.velocity.x = 0;
                                this.drone14.body.velocity.y = 0;
                            }
                            if (!this.follow9 && !this.stunned9) {
                                this.drone9.body.velocity.x = 0;
                                this.drone9.body.velocity.y = 0;
                            }
                            if (!this.follow4 && !this.stunned4) {
                                this.drone4.body.velocity.x = 0;
                                this.drone4.body.velocity.y = 0;
                            }
                            break;
                        case 1:
                            if (!this.follow14 && !this.stunned14) {
                                this.drone14.body.velocity.x = 0;
                                this.drone14.body.velocity.y = -this.game.droneSpeed;
                            }
                            if (!this.follow9 && !this.stunned9) {
                                this.drone9.body.velocity.x = 0;
                                this.drone9.body.velocity.y = -this.game.droneSpeed;
                            }
                            if (!this.follow4 && !this.stunned4) {
                                this.drone4.body.velocity.x = 0;
                                this.drone4.body.velocity.y = -this.game.droneSpeed;
                            }
                            break;
                        case 2:
                            if (!this.follow14 && !this.stunned14) {
                                this.drone14.body.velocity.x = 0;
                                this.drone14.body.velocity.y = this.game.droneSpeed;
                            }
                            if (!this.follow9 && !this.stunned9) {
                                this.drone9.body.velocity.x = 0;
                                this.drone9.body.velocity.y = this.game.droneSpeed;
                            }
                            if (!this.follow4 && !this.stunned4) {
                                this.drone4.body.velocity.x = 0;
                                this.drone4.body.velocity.y = this.game.droneSpeed;
                            }
                            break;
                        case 3:
                            if (!this.follow14 && !this.stunned14) {
                                this.drone14.body.velocity.x = -this.game.droneSpeed;
                                this.drone14.body.velocity.y = 0;
                            }
                            if (!this.follow9 && !this.stunned9) {
                                this.drone9.body.velocity.x = -this.game.droneSpeed;
                                this.drone9.body.velocity.y = 0;
                            }
                            if (!this.follow4 && !this.stunned4) {
                                this.drone4.body.velocity.x = -this.game.droneSpeed;
                                this.drone4.body.velocity.y = 0;
                            }
                            break;
                        case 4:
                            if (!this.follow14 && !this.stunned14) {
                                this.drone14.body.velocity.x = this.game.droneSpeed;
                                this.drone14.body.velocity.y = 0;
                            }
                            if (!this.follow9 && !this.stunned9) {
                                this.drone9.body.velocity.x = this.game.droneSpeed;
                                this.drone9.body.velocity.y = 0;
                            }
                            if (!this.follow4 && !this.stunned4) {
                                this.drone4.body.velocity.x = this.game.droneSpeed;
                                this.drone4.body.velocity.y = 0;
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                case 10:
                    switch (this.droneDir4) {
                        case 0:
                            if (!this.follow9 && !this.stunned9) {
                                this.drone9.body.velocity.x = 0;
                                this.drone9.body.velocity.y = 0;
                            }
                            if (!this.follow4 && !this.stunned4) {
                                this.drone4.body.velocity.x = 0;
                                this.drone4.body.velocity.y = 0;
                            }
                            break;
                        case 1:
                            if (!this.follow9 && !this.stunned9) {
                                this.drone9.body.velocity.x = 0;
                                this.drone9.body.velocity.y = -this.game.droneSpeed;
                            }
                            if (!this.follow4 && !this.stunned4) {
                                this.drone4.body.velocity.x = 0;
                                this.drone4.body.velocity.y = -this.game.droneSpeed;
                            }
                            break;
                        case 2:
                            if (!this.follow9 && !this.stunned9) {
                                this.drone9.body.velocity.x = 0;
                                this.drone9.body.velocity.y = this.game.droneSpeed;
                            }
                            if (!this.follow4 && !this.stunned4) {
                                this.drone4.body.velocity.x = 0;
                                this.drone4.body.velocity.y = this.game.droneSpeed;
                            }
                            break;
                        case 3:
                            if (!this.follow9 && !this.stunned9) {
                                this.drone9.body.velocity.x = -this.game.droneSpeed;
                                this.drone9.body.velocity.y = 0;
                            }
                            if (!this.follow4 && !this.stunned4) {
                                this.drone4.body.velocity.x = -this.game.droneSpeed;
                                this.drone4.body.velocity.y = 0;
                            }
                            break;
                        case 4:
                            if (!this.follow9 && !this.stunned9) {
                                this.drone9.body.velocity.x = this.game.droneSpeed;
                                this.drone9.body.velocity.y = 0;
                            }
                            if (!this.follow4 && !this.stunned4) {
                                this.drone4.body.velocity.x = this.game.droneSpeed;
                                this.drone4.body.velocity.y = 0;
                            }
                                break;
                        default:
                            break;
                    }
                    break;
                case 5:
                    switch (this.droneDir4) {
                        case 0:
                            if (!this.follow4 && !this.stunned4) {
                                this.drone4.body.velocity.x = 0;
                                this.drone4.body.velocity.y = 0;
                            }
                            break;
                        case 1:
                            if (!this.follow4 && !this.stunned4) {
                                this.drone4.body.velocity.x = 0;
                                this.drone4.body.velocity.y = -this.game.droneSpeed;
                            }
                            break;
                        case 2:
                            if (!this.follow4 && !this.stunned4) {
                                this.drone4.body.velocity.x = 0;
                                this.drone4.body.velocity.y = this.game.droneSpeed;
                            }
                            break;
                        case 3:
                            if (!this.follow4 && !this.stunned4) {
                                this.drone4.body.velocity.x = -this.game.droneSpeed;
                                this.drone4.body.velocity.y = 0;
                            }
                            break;
                        case 4:
                            if (!this.follow4 && !this.stunned4) {
                                this.drone4.body.velocity.x = this.game.droneSpeed;
                                this.drone4.body.velocity.y = 0;
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
        
        if (this.dronePatrol5.running) {
            switch (this.game.maxDrones) {
                case 15:
                    switch (this.droneDir5) {
                        case 0:
                            if (!this.follow15 && !this.stunned15) {
                                this.drone15.body.velocity.x = 0;
                                this.drone15.body.velocity.y = 0;
                            }
                            if (!this.follow10 && !this.stunned10) {
                                this.drone10.body.velocity.x = 0;
                                this.drone10.body.velocity.y = 0;
                            }
                            if (!this.follow5 && !this.stunned5) {
                                this.drone5.body.velocity.x = 0;
                                this.drone5.body.velocity.y = 0;
                            }
                            break;
                        case 1:
                            if (!this.follow15 && !this.stunned15) {
                                this.drone15.body.velocity.x = 0;
                                this.drone15.body.velocity.y = -this.game.droneSpeed;
                            }
                            if (!this.follow10 && !this.stunned10) {
                                this.drone10.body.velocity.x = 0;
                                this.drone10.body.velocity.y = -this.game.droneSpeed;
                            }
                            if (!this.follow5 && !this.stunned5) {
                                this.drone5.body.velocity.x = 0;
                                this.drone5.body.velocity.y = -this.game.droneSpeed;
                            }
                            break;
                        case 2:
                            if (!this.follow15 && !this.stunned15) {
                                this.drone15.body.velocity.x = 0;
                                this.drone15.body.velocity.y = this.game.droneSpeed;
                            }
                            if (!this.follow10 && !this.stunned10) {
                                this.drone10.body.velocity.x = 0;
                                this.drone10.body.velocity.y = this.game.droneSpeed;
                            }
                            if (!this.follow5 && !this.stunned5) {
                                this.drone5.body.velocity.x = 0;
                                this.drone5.body.velocity.y = this.game.droneSpeed;
                            }
                            break;
                        case 3:
                            if (!this.follow15 && !this.stunned15) {
                                this.drone15.body.velocity.x = -this.game.droneSpeed;
                                this.drone15.body.velocity.y = 0;
                            }
                            if (!this.follow10 && !this.stunned10) {
                                this.drone10.body.velocity.x = -this.game.droneSpeed;
                                this.drone10.body.velocity.y = 0;
                            }
                            if (!this.follow5 && !this.stunned5) {
                                this.drone5.body.velocity.x = -this.game.droneSpeed;
                                this.drone5.body.velocity.y = 0;
                            }
                            break;
                        case 4:
                            if (!this.follow15 && !this.stunned15) {
                                this.drone15.body.velocity.x = this.game.droneSpeed;
                                this.drone15.body.velocity.y = 0;
                            }
                            if (!this.follow10 && !this.stunned10) {
                                this.drone10.body.velocity.x = this.game.droneSpeed;
                                this.drone10.body.velocity.y = 0;
                            }
                            if (!this.follow5 && !this.stunned5) {
                                this.drone5.body.velocity.x = this.game.droneSpeed;
                                this.drone5.body.velocity.y = 0;
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                case 10:
                    switch (this.droneDir5) {
                        case 0:
                            if (!this.follow10 && !this.stunned10) {
                                this.drone10.body.velocity.x = 0;
                                this.drone10.body.velocity.y = 0;
                            }
                            if (!this.follow5 && !this.stunned5) {
                                this.drone5.body.velocity.x = 0;
                                this.drone5.body.velocity.y = 0;
                            }
                            break;
                        case 1:
                            if (!this.follow10 && !this.stunned10) {
                                this.drone10.body.velocity.x = 0;
                                this.drone10.body.velocity.y = -this.game.droneSpeed;
                            }
                            if (!this.follow5 && !this.stunned5) {
                                this.drone5.body.velocity.x = 0;
                                this.drone5.body.velocity.y = -this.game.droneSpeed;
                            }
                            break;
                        case 2:
                            if (!this.follow10 && !this.stunned10) {
                                this.drone10.body.velocity.x = 0;
                                this.drone10.body.velocity.y = this.game.droneSpeed;
                            }
                            if (!this.follow5 && !this.stunned5) {
                                this.drone5.body.velocity.x = 0;
                                this.drone5.body.velocity.y = this.game.droneSpeed;
                            }
                            break;
                        case 3:
                            if (!this.follow10 && !this.stunned10) {
                                this.drone10.body.velocity.x = -this.game.droneSpeed;
                                this.drone10.body.velocity.y = 0;
                            }
                            if (!this.follow5 && !this.stunned5) {
                                this.drone5.body.velocity.x = -this.game.droneSpeed;
                                this.drone5.body.velocity.y = 0;
                            }
                            break;
                        case 4:
                            if (!this.follow10 && !this.stunned10) {
                                this.drone10.body.velocity.x = this.game.droneSpeed;
                                this.drone10.body.velocity.y = 0;
                            }
                            if (!this.follow5 && !this.stunned5) {
                                this.drone5.body.velocity.x = this.game.droneSpeed;
                                this.drone5.body.velocity.y = 0;
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                case 5:
                    switch (this.droneDir5) {    
                        case 0:
                            if (!this.follow5 && !this.stunned5) {
                                this.drone5.body.velocity.x = 0;
                                this.drone5.body.velocity.y = 0;
                            }
                            break;
                        case 1:
                            if (!this.follow5 && !this.stunned5) {
                                this.drone5.body.velocity.x = 0;
                                this.drone5.body.velocity.y = -this.game.droneSpeed;
                            }
                            break;
                        case 2:
                            if (!this.follow5 && !this.stunned5) {
                                this.drone5.body.velocity.x = 0;
                                this.drone5.body.velocity.y = this.game.droneSpeed;
                            }
                            break;
                        case 3:
                            if (!this.follow5 && !this.stunned5) {
                                this.drone5.body.velocity.x = -this.game.droneSpeed;
                                this.drone5.body.velocity.y = 0;
                            }
                            break;
                        case 4:
                            if (!this.follow5 && !this.stunned5) {
                                this.drone5.body.velocity.x = this.game.droneSpeed;
                                this.drone5.body.velocity.y = 0;
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
    },
    
    /* ---------------------- INITIALIZATION FUNCTIONS BEGIN AT THIS POINT ONWARD ---------------------- */
    playerInitialization: function() {
        this.upKey = this.input.keyboard.addKey(Phaser.Keyboard.W);
        this.leftKey = this.input.keyboard.addKey(Phaser.Keyboard.A);
        this.downKey = this.input.keyboard.addKey(Phaser.Keyboard.S);
        this.rightKey = this.input.keyboard.addKey(Phaser.Keyboard.D);
        
        this.spaceKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.inventoryKey = this.input.keyboard.addKey(Phaser.Keyboard.I);
        this.exitKey = this.input.keyboard.addKey(Phaser.Keyboard.ESC);
        this.healKey = this.input.keyboard.addKey(Phaser.Keyboard.Q);
        this.shieldKey = this.input.keyboard.addKey(Phaser.Keyboard.E);
        this.confirmKey = this.input.keyboard.addKey(Phaser.Keyboard.Y);
        this.declineKey = this.input.keyboard.addKey(Phaser.Keyboard.N);
        
        this.craftKey = this.input.keyboard.addKey(Phaser.Keyboard.C);
        this.oneKey = this.input.keyboard.addKey(Phaser.Keyboard.ONE);
        this.twoKey = this.input.keyboard.addKey(Phaser.Keyboard.TWO);
        this.threeKey = this.input.keyboard.addKey(Phaser.Keyboard.THREE);
        
        this.testKey = this.input.keyboard.addKey(Phaser.Keyboard.P);
        
        this.cursors = this.input.keyboard.createCursorKeys();
        
        this.pulse = this.add.group();
        this.pulse.enableBody = true;
        this.pulse.physicsBodyType = Phaser.Physics.ARCADE;
        this.pulse.setAll('outOfBoundsKill', true);
        this.pulse.setAll('checkWorldBounds', true);
        
        this.game.player = this.add.sprite((2 * this.game.posMult) + 8, (17 * this.game.posMult) + 8, 'player');
        this.physics.enable(this.game.player, Phaser.Physics.ARCADE);
        this.game.player.body.collideWorldBounds = true;
        this.shield = this.add.sprite(this.game.player.x - 8, this.game.player.y - 8, 'shield');
        this.shield.visible = false;
        this.space = this.add.sprite(this.game.player.x - 8, this.game.player.y - 12, 'space');
        
        this.game.player.animations.add('normal', [0], 0, true);
        this.game.player.animations.add('lakeRecover', [0, 1], 5, true);
        this.game.player.animations.add('riverRecover', [0, 1], 3, true);
        this.game.player.animations.add('damaged', [0, 2], 5, true);
        this.space.animations.add('press', [0, 1, 1, 1, 1], 3, true);
        this.shield.animations.add('shieldDown', [0, 1], 3, true);
        
        this.hasShield = false;
    },
    
    initializeFood: function() {
        /* FOOD CREATION */
        this.food = this.add.group();
        this.food.enableBody = true;
        
        count = this.game.maxFood;
        while (count > 0){
            canSpawn = true;
            x = this.rnd.integerInRange(0, 19);
            y = this.rnd.integerInRange(0, 19);
            for (i = 0; i< this.game.spawnExclX.length; i++){
                if (x === this.game.spawnExclX[i] && y === this.game.spawnExclY[i]){
                    canSpawn = false;
                    break;
                }
            }
            if (canSpawn){
                this.food.create((x * this.game.posMult) + 8, (y * this.game.posMult) + 8, 'food');
                count--;   
            }
        }
    },
    
    initializeResources: function() {
        /* FOOD CREATION */
        this.resource = this.add.group();
        this.resource.enableBody = true;
        
        count = this.game.maxResource;
        while (count > 0){
            canSpawn = true;
            x = this.rnd.integerInRange(0, 19);
            y = this.rnd.integerInRange(0, 19);
            for (i = 0; i< this.game.spawnExclX.length; i++){
                if (x === this.game.spawnExclX[i] && y === this.game.spawnExclY[i]){
                    canSpawn = false;
                    break;
                }
            }
            if (canSpawn){
                this.resource.create((x * this.game.posMult) + 8, (y * this.game.posMult) + 8, 'resource');
                this.game.spawnExclX.push(x);
                this.game.spawnExclY.push(y);
                count--;   
            }
        }
    },
    
    setHealth: function() {
        if (this.initializeState) {
            this.health1 = this.add.sprite(1 * this.game.posMult, (14 * this.game.posMult) + 11, 'healthsq');
            this.health1.fixedToCamera = true;
            this.health2 = this.add.sprite(this.health1.x + 16, (14 * this.game.posMult) + 11, 'healthsq');
            this.health2.fixedToCamera = true;
            this.health3 = this.add.sprite(this.health2.x + 16, (14 * this.game.posMult) + 11, 'healthsq');
            this.health3.fixedToCamera = true;
            this.health4 = this.add.sprite(this.health3.x + 16, (14 * this.game.posMult) + 11, 'healthsq');
            this.health4.fixedToCamera = true;
            this.health5 = this.add.sprite(this.health4.x + 16, (14 * this.game.posMult) + 11, 'healthsq');
            this.health5.fixedToCamera = true;
        }
        this.health1.visible = false;
        this.health2.visible = false;
        this.health3.visible = false;
        this.health4.visible = false;
        this.health5.visible = false;
        switch(this.game.playerMaxHealth) {
            case 5:
                this.health5.visible = true;
            case 4:
                this.health4.visible = true;
            case 3:
                this.health3.visible = true;
            case 2:
                this.health2.visible = true;
            case 1:
                this.health1.visible = true;
                break;
        }
        
        // If player's current health exceeds the player's max health due to inventory changes, set a cap
        if (this.game.playerHealth > this.game.playerMaxHealth)
            this.game.playerHealth = this.game.playerMaxHealth;
        
        switch(this.game.playerHealth) {
            case 1:
                this.health2.alpha = 0.2;
            case 2:
                this.health3.alpha = 0.2;
            case 3:
                this.health4.alpha = 0.2;
            case 4:
                this.health5.alpha = 0.2;
                break;
            default:
                break;
        }
    },
    
    setHunger: function() {
        if (this.initializeState) {
            this.hunger1 = this.add.sprite(5 * this.game.posMult, (14 * this.game.posMult) + 11, 'hungersq');
            this.hunger1.fixedToCamera = true;
            this.hunger2 = this.add.sprite(this.hunger1.x + 16, (14 * this.game.posMult) + 11, 'hungersq');
            this.hunger2.fixedToCamera = true;
            this.hunger3 = this.add.sprite(this.hunger2.x + 16, (14 * this.game.posMult) + 11, 'hungersq');
            this.hunger3.fixedToCamera = true;
            this.hunger4 = this.add.sprite(this.hunger3.x + 16, (14 * this.game.posMult) + 11, 'hungersq');
            this.hunger4.fixedToCamera = true;
            this.hunger5 = this.add.sprite(this.hunger4.x + 16, (14 * this.game.posMult) + 11, 'hungersq');
            this.hunger5.fixedToCamera = true;
        }
        
        this.hunger1.visible = false;
        this.hunger2.visible = false;
        this.hunger3.visible = false;
        this.hunger4.visible = false;
        this.hunger5.visible = false;
        switch(this.game.playerMaxHunger) {
            case 5:
                this.hunger5.visible = true;
            case 4:
                this.hunger4.visible = true;
            case 3:
                this.hunger3.visible = true;
            case 2:
                this.hunger2.visible = true;
            case 1:
                this.hunger1.visible = true;
                break;
        }
        
        if (this.game.playerHunger > this.game.playerMaxHunger)
            this.game.playerHunger = this.game.playerMaxHunger;
        
        switch(this.game.playerHunger) {
            case 0:
                this.hunger1.alpha = 0.2;
            case 1:
                this.hunger2.alpha = 0.2;
            case 2:
                this.hunger3.alpha = 0.2;
            case 3:
                this.hunger4.alpha = 0.2;
            case 4:
                this.hunger5.alpha = 0.2;
                break;
            default:
                break;
        }
    },
    
    setThirst: function() {
        if (this.initializeState) {
            this.thirst1 = this.add.sprite(9 * this.game.posMult, (14 * this.game.posMult) + 11, 'thirstsq');
            this.thirst1.fixedToCamera = true;
            this.thirst2 = this.add.sprite(this.thirst1.x + 16, (14 * this.game.posMult) + 11, 'thirstsq');
            this.thirst2.fixedToCamera = true;
            this.thirst3 = this.add.sprite(this.thirst2.x + 16, (14 * this.game.posMult) + 11, 'thirstsq');
            this.thirst3.fixedToCamera = true;
            this.thirst4 = this.add.sprite(this.thirst3.x + 16, (14 * this.game.posMult) + 11, 'thirstsq');
            this.thirst4.fixedToCamera = true;
            this.thirst5 = this.add.sprite(this.thirst4.x + 16, (14 * this.game.posMult) + 11, 'thirstsq');
            this.thirst5.fixedToCamera = true;
        }
        
        this.thirst1.visible = false;
        this.thirst2.visible = false;
        this.thirst3.visible = false;
        this.thirst4.visible = false;
        this.thirst5.visible = false;
        switch(this.game.playerMaxThirst) {
            case 5:
                this.thirst5.visible = true;
            case 4:
                this.thirst4.visible = true;
            case 3:
                this.thirst3.visible = true;
            case 2:
                this.thirst2.visible = true;
            case 1:
                this.thirst1.visible = true;
                break;
        }
        if (this.game.playerThirst > this.game.playerMaxThirst)
            this.game.playerThirst = this.game.playerMaxThirst;
        
        switch(this.game.playerThirst) {
            case 0:
                this.thirst1.alpha = 0.2;
            case 1:
                this.thirst2.alpha = 0.2;
            case 2:
                this.thirst3.alpha = 0.2;
            case 3:
                this.thirst4.alpha = 0.2;
            case 4:
                this.thirst5.alpha = 0.2;
                break;
            default:
                break;
        }
    },
    
    timerInitialization: function() {
        /* LIST OF TIMERS */
        this.timeCycle = this.time.create(true);
        this.timeCycle.add(this.game.dayCycle, this.endDay, this);
        this.quarterCycle = this.time.create(true);
        this.quarterCycle.add((this.game.dayCycle / 4), this.quarterDay, this);
        
        this.fadeLabelTimer = this.time.create(true);
        this.fadeLabelTimer.add(this.game.eventLabelTimer, this.fadeEventLabel, this);
        
        this.damageImmune = this.time.create(true);
        this.healthDrain = this.time.create(true);
        this.healthDrain.add(this.game.healthDecay, this.updatehealth, this, true);
        this.hungerDrain = this.time.create(false);
        this.hungerDrain.add(this.game.hungerDecay, this.updateHunger, this, true);
        this.thirstDrain = this.time.create(true);
        this.thirstDrain.add(this.game.thirstDecay, this.updateThirst, this, true);
        this.thirstGain = this.time.create(false);
        this.foodRespawnTimer = this.time.create(true);
        this.foodRespawnTimer.add(this.game.foodRespawn, this.updateFood, this);
        
        // 5 Drone Move Time groups 
        this.dronePatrol1 = this.time.create(true);
        this.dronePatrol1.add(this.game.moveTime1, this.droneMoveCalc, this, 1);
        this.dronePatrol2 = this.time.create(true);
        this.dronePatrol2.add(this.game.moveTime2, this.droneMoveCalc, this, 2);
        this.dronePatrol3 = this.time.create(true);
        this.dronePatrol3.add(this.game.moveTime3, this.droneMoveCalc, this, 3);
        this.dronePatrol4 = this.time.create(true);
        this.dronePatrol4.add(this.game.moveTime4, this.droneMoveCalc, this, 4);
        this.dronePatrol5 = this.time.create(true);
        this.dronePatrol5.add(this.game.moveTime5, this.droneMoveCalc, this, 5);
        
        this.stunTimer1 = this.time.create(true);
        this.stunTimer1.add(this.game.stunDuration, this.destroyStunTimer, this, 1);
        this.stunTimer2 = this.time.create(true);
        this.stunTimer2.add(this.game.stunDuration, this.destroyStunTimer, this, 2);
        this.stunTimer3 = this.time.create(true);
        this.stunTimer3.add(this.game.stunDuration, this.destroyStunTimer, this, 3);
        this.stunTimer4 = this.time.create(true);
        this.stunTimer4.add(this.game.stunDuration, this.destroyStunTimer, this, 4);
        this.stunTimer5 = this.time.create(true);
        this.stunTimer5.add(this.game.stunDuration, this.destroyStunTimer, this, 5);
        this.stunTimer6 = this.time.create(true);
        this.stunTimer6.add(this.game.stunDuration, this.destroyStunTimer, this, 6);
        this.stunTimer7 = this.time.create(true);
        this.stunTimer7.add(this.game.stunDuration, this.destroyStunTimer, this, 7);
        this.stunTimer8 = this.time.create(true);
        this.stunTimer8.add(this.game.stunDuration, this.destroyStunTimer, this, 8);
        this.stunTimer9 = this.time.create(true);
        this.stunTimer9.add(this.game.stunDuration, this.destroyStunTimer, this, 9);
        this.stunTimer10 = this.time.create(true);
        this.stunTimer10.add(this.game.stunDuration, this.destroyStunTimer, this, 10);
        this.stunTimer11 = this.time.create(true);
        this.stunTimer11.add(this.game.stunDuration, this.destroyStunTimer, this, 11);
        this.stunTimer12 = this.time.create(true);
        this.stunTimer12.add(this.game.stunDuration, this.destroyStunTimer, this, 12);
        this.stunTimer13 = this.time.create(true);
        this.stunTimer13.add(this.game.stunDuration, this.destroyStunTimer, this, 13);
        this.stunTimer14 = this.time.create(true);
        this.stunTimer14.add(this.game.stunDuration, this.destroyStunTimer, this, 14);
        this.stunTimer15 = this.time.create(true);
        this.stunTimer15.add(this.game.stunDuration, this.destroyStunTimer, this, 15);
        
        this.hungerDrain.start();
        this.thirstDrain.start();
        this.dronePatrol1.start();
        this.dronePatrol2.start();
        this.dronePatrol3.start();
        this.dronePatrol4.start();
        this.dronePatrol5.start();
        this.timeCycle.start();
        this.quarterCycle.start();
        this.fadeLabelTimer.start();
    },
    
    initializeDrones: function() {
        this.droneDir1;     // Drone squad 1 Direction
        this.droneDir2;     // Drone squad 2 Direction
        this.droneDir3;     // Drone squad 3 Direction
        this.droneDir4;     // Drone squad 4 Direction
        this.droneDir5;     // Drone squad 5 Direction
        
        this.follow1 = false;
        this.follow2 = false;
        this.follow3 = false;
        this.follow4 = false;
        this.follow5 = false;
        this.follow6 = false;
        this.follow7 = false;
        this.follow8 = false;
        this.follow9 = false;
        this.follow10 = false;
        this.follow11 = false;
        this.follow12 = false;
        this.follow13 = false;
        this.follow14 = false;
        this.follow15 = false;
        
        this.drone = this.add.group();
        this.physics.enable(this.drone, Phaser.Physics.PHASER);
        this.drone.enableBody = true;
        
        switch (this.game.maxDrones){
            case 15:
                canSpawn = false;
                while(!canSpawn){
                    canSpawn = true;
                    x = this.rnd.integerInRange(0, 19);
                    y = this.rnd.integerInRange(0, 19);
                    for (i = 0; i< this.game.spawnExclX.length; i++){
                        if (x === this.game.spawnExclX[i] && y === this.game.spawnExclY[i]) {
                            canSpawn = false;
                            break;
                        }
                    }
                    if (canSpawn){
                        this.drone15 = this.drone.create((x * this.game.posMult) + 8, (y * this.game.posMult) + 8, 'drone');
                        this.game.spawnExclX.push(x);
                        this.game.spawnExclY.push(y);
                    }
                }
                this.drone15.body.collideWorldBounds = true;
            case 14:
                canSpawn = false;
                while(!canSpawn){
                    canSpawn = true;
                    x = this.rnd.integerInRange(0, 19);
                    y = this.rnd.integerInRange(0, 19);
                    for (i = 0; i< this.game.spawnExclX.length; i++){
                        if (x === this.game.spawnExclX[i] && y === this.game.spawnExclY[i]) {
                            canSpawn = false;
                            break;
                        }
                    }
                    if (canSpawn) {
                        this.drone14 = this.drone.create((x * this.game.posMult) + 8, (y * this.game.posMult) + 8, 'drone');
                        this.game.spawnExclX.push(x);
                        this.game.spawnExclY.push(y);
                    }
                }
                this.drone14.body.collideWorldBounds = true;
            case 13:
                canSpawn = false;
                while(!canSpawn){
                    canSpawn = true;
                    x = this.rnd.integerInRange(0, 19);
                    y = this.rnd.integerInRange(0, 19);
                    for (i = 0; i< this.game.spawnExclX.length; i++){
                        if (x === this.game.spawnExclX[i] && y === this.game.spawnExclY[i]) {
                            canSpawn = false;
                            break;
                        }
                    }
                    if (canSpawn) {
                        this.drone13 = this.drone.create((x * this.game.posMult) + 8, (y * this.game.posMult) + 8, 'drone');
                        this.game.spawnExclX.push(x);
                        this.game.spawnExclY.push(y);
                    }
                }
                this.drone13.body.collideWorldBounds = true;
            case 12:
                canSpawn = false;
                while(!canSpawn){
                    canSpawn = true;
                    x = this.rnd.integerInRange(0, 19);
                    y = this.rnd.integerInRange(0, 19);
                    for (i = 0; i< this.game.spawnExclX.length; i++){
                        if (x === this.game.spawnExclX[i] && y === this.game.spawnExclY[i]) {
                            canSpawn = false;
                            break;
                        }
                    }
                    if (canSpawn) {
                        this.drone12 = this.drone.create((x * this.game.posMult) + 8, (y * this.game.posMult) + 8, 'drone');
                        this.game.spawnExclX.push(x);
                        this.game.spawnExclY.push(y);
                    }
                }
                this.drone12.body.collideWorldBounds = true;
            case 11:
                canSpawn = false;
                while(!canSpawn){
                    canSpawn = true;
                    x = this.rnd.integerInRange(0, 19);
                    y = this.rnd.integerInRange(0, 19);
                    for (i = 0; i< this.game.spawnExclX.length; i++){
                        if (x === this.game.spawnExclX[i] && y === this.game.spawnExclY[i]) {
                            canSpawn = false;
                            break;
                        }
                    }
                    if (canSpawn) {
                        this.drone11 = this.drone.create((x * this.game.posMult) + 8, (y * this.game.posMult) + 8, 'drone');
                        this.game.spawnExclX.push(x);
                        this.game.spawnExclY.push(y);
                    }
                }
                this.drone11.body.collideWorldBounds = true;
            case 10:
                canSpawn = false;
                while(!canSpawn){
                    canSpawn = true;
                    x = this.rnd.integerInRange(0, 19);
                    y = this.rnd.integerInRange(0, 19);
                    for (i = 0; i< this.game.spawnExclX.length; i++){
                        if (x === this.game.spawnExclX[i] && y === this.game.spawnExclY[i]) {
                            canSpawn = false;
                            break;
                        }
                    }
                    if (canSpawn) {
                        this.drone10 = this.drone.create((x * this.game.posMult) + 8, (y * this.game.posMult) + 8, 'drone');
                        this.game.spawnExclX.push(x);
                        this.game.spawnExclY.push(y);
                    }
                }
                this.drone10.body.collideWorldBounds = true;
            case 9:
                canSpawn = false;
                while(!canSpawn){
                    canSpawn = true;
                    x = this.rnd.integerInRange(0, 19);
                    y = this.rnd.integerInRange(0, 19);
                    for (i = 0; i< this.game.spawnExclX.length; i++){
                        if (x === this.game.spawnExclX[i] && y === this.game.spawnExclY[i]) {
                            canSpawn = false;
                            break;
                        }
                    }
                    if (canSpawn) {
                        this.drone9 = this.drone.create((x * this.game.posMult) + 8, (y * this.game.posMult) + 8, 'drone');
                        this.game.spawnExclX.push(x);
                        this.game.spawnExclY.push(y);
                    }
                }
                this.drone9.body.collideWorldBounds = true;
            case 8:
                canSpawn = false;
                while(!canSpawn){
                    canSpawn = true;
                    x = this.rnd.integerInRange(0, 19);
                    y = this.rnd.integerInRange(0, 19);
                    for (i = 0; i< this.game.spawnExclX.length; i++){
                        if (x === this.game.spawnExclX[i] && y === this.game.spawnExclY[i]) {
                            canSpawn = false;
                            break;
                        }
                    }
                    if (canSpawn){
                        this.drone8 = this.drone.create((x * this.game.posMult) + 8, (y * this.game.posMult) + 8, 'drone');
                        this.game.spawnExclX.push(x);
                        this.game.spawnExclY.push(y);
                    }
                }
                this.drone8.body.collideWorldBounds = true;
            case 7:
                canSpawn = false;
                while(!canSpawn){
                    canSpawn = true;
                    x = this.rnd.integerInRange(0, 19);
                    y = this.rnd.integerInRange(0, 19);
                    for (i = 0; i< this.game.spawnExclX.length; i++){
                        if (x === this.game.spawnExclX[i] && y === this.game.spawnExclY[i]) {
                            canSpawn = false;
                            break;
                        }
                    }
                    if (canSpawn) {
                        this.drone7 = this.drone.create((x * this.game.posMult) + 8, (y * this.game.posMult) + 8, 'drone');
                        this.game.spawnExclX.push(x);
                        this.game.spawnExclY.push(y);
                    }
                }
                this.drone7.body.collideWorldBounds = true;
            case 6:
                canSpawn = false;
                while(!canSpawn){
                    canSpawn = true;
                    x = this.rnd.integerInRange(0, 19);
                    y = this.rnd.integerInRange(0, 19);
                    for (i = 0; i< this.game.spawnExclX.length; i++){
                        if (x === this.game.spawnExclX[i] && y === this.game.spawnExclY[i]) {
                            canSpawn = false;
                            break;
                        }
                    }
                    if (canSpawn) {
                        this.drone6 = this.drone.create((x * this.game.posMult) + 8, (y * this.game.posMult) + 8, 'drone');
                        this.game.spawnExclX.push(x);
                        this.game.spawnExclY.push(y);
                    }
                }
                this.drone6.body.collideWorldBounds = true;
            case 5:
                canSpawn = false;
                while(!canSpawn){
                    canSpawn = true;
                    x = this.rnd.integerInRange(0, 19);
                    y = this.rnd.integerInRange(0, 19);
                    for (i = 0; i< this.game.spawnExclX.length; i++){
                        if (x === this.game.spawnExclX[i] && y === this.game.spawnExclY[i]) {
                            canSpawn = false;
                            break;
                        }
                    }
                    if (canSpawn) {
                        this.drone5 = this.drone.create((x * this.game.posMult) + 8, (y * this.game.posMult) + 8, 'drone');
                        this.game.spawnExclX.push(x);
                        this.game.spawnExclY.push(y);
                    }
                }
                this.drone5.body.collideWorldBounds = true;
            case 4:
                canSpawn = false;
                while(!canSpawn){
                    canSpawn = true;
                    x = this.rnd.integerInRange(0, 19);
                    y = this.rnd.integerInRange(0, 19);
                    for (i = 0; i< this.game.spawnExclX.length; i++){
                        if (x === this.game.spawnExclX[i] && y === this.game.spawnExclY[i]) {
                            canSpawn = false;
                            break;
                        }
                    }
                    if (canSpawn) {
                        this.drone4 = this.drone.create((x * this.game.posMult) + 8, (y * this.game.posMult) + 8, 'drone');
                        this.game.spawnExclX.push(x);
                        this.game.spawnExclY.push(y);
                    }
                }
                this.drone4.body.collideWorldBounds = true;
            case 3:
                canSpawn = false;
                while(!canSpawn){
                    canSpawn = true;
                    x = this.rnd.integerInRange(0, 19);
                    y = this.rnd.integerInRange(0, 19);
                    for (i = 0; i< this.game.spawnExclX.length; i++){
                        if (x === this.game.spawnExclX[i] && y === this.game.spawnExclY[i]) {
                            canSpawn = false;
                            break;
                        }
                    }
                    if (canSpawn) {
                        this.drone3 = this.drone.create((x * this.game.posMult) + 8, (y * this.game.posMult) + 8, 'drone');
                        this.game.spawnExclX.push(x);
                        this.game.spawnExclY.push(y);
                    }
                }
                this.drone3.body.collideWorldBounds = true;
            case 2:
                canSpawn = false;
                while(!canSpawn){
                    canSpawn = true;
                    x = this.rnd.integerInRange(0, 19);
                    y = this.rnd.integerInRange(0, 19);
                    for (i = 0; i< this.game.spawnExclX.length; i++){
                        if (x === this.game.spawnExclX[i] && y === this.game.spawnExclY[i]) {
                            canSpawn = false;
                            break;
                        }
                    }
                    if (canSpawn) {
                        this.drone2 = this.drone.create((x * this.game.posMult) + 8, (y * this.game.posMult) + 8, 'drone');
                        this.game.spawnExclX.push(x);
                        this.game.spawnExclY.push(y);
                    }
                }
                this.drone2.body.collideWorldBounds = true;
            case 1:
                canSpawn = false;
                while(!canSpawn){
                    canSpawn = true;
                    x = this.rnd.integerInRange(0, 19);
                    y = this.rnd.integerInRange(0, 19);
                    for (i = 0; i< this.game.spawnExclX.length; i++){
                        if (x === this.game.spawnExclX[i] && y === this.game.spawnExclY[i]) {
                            canSpawn = false;
                            break;
                        }
                    }
                    if (canSpawn) {
                        this.drone1 = this.drone.create((x * this.game.posMult) + 8, (y * this.game.posMult) + 8, 'drone');
                        this.game.spawnExclX.push(x);
                        this.game.spawnExclY.push(y);
                    }
                }
                this.drone1.body.collideWorldBounds = true;
                break;
            default:
                break;
        }
        
        switch(this.game.maxDrones){
            case 15:
                this.drone11.animations.add('stunned', [1, 2], 3, true);
                this.drone11.frame = 0;
                this.drone12.animations.add('stunned', [1, 2], 3, true);
                this.drone12.frame = 0;
                this.drone13.animations.add('stunned', [1, 2], 3, true);
                this.drone13.frame = 0;
                this.drone14.animations.add('stunned', [1, 2], 3, true);
                this.drone14.frame = 0;
                this.drone15.animations.add('stunned', [1, 2], 3, true);
                this.drone15.frame = 0;
            case 10:
                this.drone6.animations.add('stunned', [1, 2], 3, true);
                this.drone6.frame = 0;
                this.drone7.animations.add('stunned', [1, 2], 3, true);
                this.drone7.frame = 0;
                this.drone8.animations.add('stunned', [1, 2], 3, true);
                this.drone8.frame = 0;
                this.drone9.animations.add('stunned', [1, 2], 3, true);
                this.drone9.frame = 0;
                this.drone10.animations.add('stunned', [1, 2], 3, true);
                this.drone10.frame = 0;
            case 5:
                this.drone1.animations.add('stunned', [1, 2], 3, true);
                this.drone1.frame = 0;
                this.drone2.animations.add('stunned', [1, 2], 3, true);
                this.drone2.frame = 0;
                this.drone3.animations.add('stunned', [1, 2], 3, true);
                this.drone3.frame = 0;
                this.drone4.animations.add('stunned', [1, 2], 3, true);
                this.drone4.frame = 0;
                this.drone5.animations.add('stunned', [1, 2], 3, true);
                this.drone5.frame = 0;
                break;
            default:
                break;
        }
    },
    
    updateConsumables: function() {
        switch (this.game.medKit){
            case 0:
                this.medKitInventory.frame = 0;
                break;
            case 1:
                this.medKitInventory.frame = 1;
                break;
            case 2:
                this.medKitInventory.frame = 2;
                break;
            case 3:
                this.medKitInventory.frame = 3;
                break;
            default:
                break;
        } 
        
        switch (this.game.shieldCount){
            case 0:
                this.shieldInventory.frame = 0;
                break;
            case 1:
                this.shieldInventory.frame = 1;
                break;
            case 2:
                this.shieldInventory.frame = 2;
                break;
            case 3:
                this.shieldInventory.frame = 3;
                break;
            default:
                break;
        } 
        
        switch (this.game.pulseRounds){
            case 0:
                this.pulseInventory.frame = 0;
                break;
            case 1:
                this.pulseInventory.frame = 1;
                break;
            case 2:
                this.pulseInventory.frame = 2;
                break;
            case 3:
                this.pulseInventory.frame = 3;
                break;
            case 4:
                this.pulseInventory.frame = 4;
                break;
            case 5:
                this.pulseInventory.frame = 5;
                break;
            default:
                break;
        } 
    },
    
    toggleInventory: function() {
        if (this.inventoryState === false && !this.game.paused){
            this.inventoryState = true;
            this.inventoryIcon.visible = false;
            this.consumablesCanvas.visible = true;
            this.inventoryCanvas.visible = true;
            this.medKitInventory.visible = true;
            this.shieldInventory.visible = true;
            this.pulseInventory.visible = true;
            this.timedial.visible = true;
            this.numLabel.visible = true;
            
            if (this.inventoryslot1 !== undefined)
                this.inventoryslot1.visible = true;
            
            if (this.inventoryslot2 !== undefined)
                this.inventoryslot2.visible = true;
        }
        else if (this.inventoryState === true && !this.game.paused){
            this.inventoryState = false;
            this.inventoryIcon.visible = true;
            this.consumablesCanvas.visible = false;
            this.inventoryCanvas.visible = false;
            this.medKitInventory.visible = false;
            this.shieldInventory.visible = false;
            this.pulseInventory.visible = false;
            this.timedial.visible = false;
            this.numLabel.visible = false;
            
            if (this.inventoryslot1 !== undefined)
                this.inventoryslot1.visible = false;
            
            if (this.inventoryslot2 !== undefined)
                this.inventoryslot2.visible = false;
        }
    },
    
    initializeHUD: function() {
        this.darken = this.add.sprite(0, 0, 'darken');
        this.darken.fixedToCamera = true;
        this.darken.alpha = 0;
        
        this.heart = this.add.sprite((0 * this.game.posMult) + 8, (14 * this.game.posMult) + 8, 'heart');
        this.heart.fixedToCamera = true;
        this.foodIco = this.add.sprite((4 * this.game.posMult) + 8, (14 * this.game.posMult) + 8, 'foodIco');
        this.foodIco.fixedToCamera = true;
        this.drop = this.add.sprite((8 * this.game.posMult) + 8, (14 * this.game.posMult) + 8, 'drop');
        this.drop.fixedToCamera = true;
        this.setHealth();
        this.setHunger();
        this.setThirst();
        
        this.inventoryIcon = this.add.sprite(14 * this.game.posMult, 0 * this.game.posMult, 'inventoryKey');
        this.consumablesCanvas = this.add.sprite((14 * this.game.posMult) - 4, (6 * this.game.posMult) - 4,'consumablesCanvas');
        this.inventoryCanvas = this.add.sprite((12 * this.game.posMult) - 4, (14 * this.game.posMult) - 4, 'inventoryCanvas');
        this.medKitInventory = this.add.sprite(14 * this.game.posMult, 6 * this.game.posMult, 'medico');
        this.shieldInventory = this.add.sprite(14 * this.game.posMult, 7 * this.game.posMult, 'shieldico');
        this.pulseInventory = this.add.sprite(14 * this.game.posMult, 8 * this.game.posMult, 'pulsico');
        this.inventoryIcon.fixedToCamera = true;
        this.consumablesCanvas.fixedToCamera = true;
        this.inventoryCanvas.fixedToCamera = true;
        this.medKitInventory.fixedToCamera = true;
        this.shieldInventory.fixedToCamera = true;
        this.pulseInventory.fixedToCamera = true;
        this.consumablesCanvas.visible = false;
        this.inventoryCanvas.visible = false;
        this.medKitInventory.visible = false;
        this.shieldInventory.visible = false;
        this.pulseInventory.visible = false;
        this.updateConsumables();
        
        this.inventoryIcon.animations.add('toggle', [0, 1], 1, true);
        this.inventoryIcon.animations.play('toggle');     
        
        switch (this.game.day){
            case 1:
                this.numLabel = this.add.sprite(4, 0, 'day1');
                break;
            case 2:
                this.numLabel = this.add.sprite(4, 0, 'day2');
                break;
            case 3:
                this.numLabel = this.add.sprite(4, 0, 'day3');
                break;
            case 4:
                this.numLabel = this.add.sprite(4, 0, 'day4');
                break;
            case 5:
                this.numLabel = this.add.sprite(4, 0, 'day5');
                break;
            case 6:
                this.numLabel = this.add.sprite(4, 0, 'day6');
                break;
            case 7:
                this.numLabel = this.add.sprite(4, 0, 'day7');
                break;
            default:
                break;
        }
        
        this.timedial = this.add.sprite(0 * this.game.posMult, this.game.posMult, 'timedial');
        this.timedial.fixedToCamera = true;
        this.timedial.visible = false;
        if (this.game.dayState === 'night')
            this.timedial.frame = 5;
        
        if (this.game.day < 5) {
            if (this.game.randomEvent1 !== undefined) {
                switch(this.game.randomEvent1){
                    case 1:
                        this.randomEventLabel = this.add.sprite(240, 240, 'abundance');
                        break;
                    case 2:
                        this.randomEventLabel = this.add.sprite(240, 240, 'famine');
                        break;
                    case 3:
                        this.randomEventLabel = this.add.sprite(240, 240, 'surplus');
                        break;
                    case 4:
                        this.randomEventLabel = this.add.sprite(240, 240, 'scarcity');
                        break;
                    case 5:
                        this.randomEventLabel = this.add.sprite(240, 240, 'quench');
                        break;
                    case 6:
                        this.randomEventLabel = this.add.sprite(240, 240, 'dehydrate');
                        break;
                    case 7:
                        this.randomEventLabel = this.add.sprite(240, 240, 'satiation');
                        break;
                    case 8:
                        this.randomEventLabel = this.add.sprite(240, 240, 'starvation');
                        break;
                    case 9:
                        this.randomEventLabel = this.add.sprite(240, 240, 'lowalert');
                        break;
                    case 10:
                        this.randomEventLabel = this.add.sprite(240, 240, 'highalert');
                        break;
                    case 11:
                        this.randomEventLabel = this.add.sprite(240, 240, 'agility');
                        break;
                    default:
                        break;
                }
                if (this.game.randomEvent1 !== 0 && this.game.randomEvent1 !== 12) {
                    this.randomEventLabel.anchor.x = 0.5;
                    this.randomEventLabel.anchor.y = 0.5;
                    this.randomEventLabel.fixedToCamera = true;
                }
            }
        }
        else {
            if (this.game.randomEvent1 !== undefined) {
                switch(this.game.randomEvent1) {
                    case 1:
                        this.randomEventLabel = this.add.sprite(240, 175, 'abundance');
                        break;
                    case 2:
                        this.randomEventLabel = this.add.sprite(240, 175, 'famine');
                        break;
                    case 3:
                        this.randomEventLabel = this.add.sprite(240, 175, 'surplus');
                        break;
                    case 4:
                        this.randomEventLabel = this.add.sprite(240, 175, 'scarcity');
                        break;
                    case 5:
                        this.randomEventLabel = this.add.sprite(240, 175, 'quench');
                        break;
                    case 6:
                        this.randomEventLabel = this.add.sprite(240, 175, 'dehydrate');
                        break;
                    case 7:
                        this.randomEventLabel = this.add.sprite(240, 175, 'satiation');
                        break;
                    case 8:
                        this.randomEventLabel = this.add.sprite(240, 175, 'starvation');
                        break;
                    case 9:
                        this.randomEventLabel = this.add.sprite(240, 175, 'lowalert');
                        break;
                    case 10:
                        this.randomEventLabel = this.add.sprite(240, 175, 'highalert');
                        break;
                    case 11:
                        this.randomEventLabel = this.add.sprite(240, 175, 'agility');
                        break;
                    default:
                        break;
                }
                this.plus = this.add.sprite(240, 240, 'plus');
                this.plus.anchor.x = 0.5;
                this.plus.anchor.y = 0.5;
                this.plus.fixedToCamera = true;

                switch(this.game.randomEvent2) {
                    case 1:
                        this.randomEventLabel2 = this.add.sprite(240, 305, 'abundance');
                        break;
                    case 2:
                        this.randomEventLabel2 = this.add.sprite(240, 305, 'famine');
                        break;
                    case 3:
                        this.randomEventLabel2 = this.add.sprite(240, 305, 'surplus');
                        break;
                    case 4:
                        this.randomEventLabel2 = this.add.sprite(240, 305, 'scarcity');
                        break;
                    case 5:
                        this.randomEventLabel2 = this.add.sprite(240, 305, 'quench');
                        break;
                    case 6:
                        this.randomEventLabel2 = this.add.sprite(240, 305, 'dehydrate');
                        break;
                    case 7:
                        this.randomEventLabel2 = this.add.sprite(240, 305, 'satiation');
                        break;
                    case 8:
                        this.randomEventLabel2 = this.add.sprite(240, 305, 'starvation');
                        break;
                    case 9:
                        this.randomEventLabel2 = this.add.sprite(240, 305, 'lowalert');
                        break;
                    case 10:
                        this.randomEventLabel2 = this.add.sprite(240, 305, 'highalert');
                        break;
                    case 11:
                        this.randomEventLabel2 = this.add.sprite(240, 305, 'agility');
                        break;
                    default:
                        break;
                }
                this.randomEventLabel.anchor.x = 0.5;
                this.randomEventLabel.anchor.y = 0.5;
                this.randomEventLabel.fixedToCamera = true;
                this.randomEventLabel2.anchor.x = 0.5;
                this.randomEventLabel2.anchor.y = 0.5;
                this.randomEventLabel2.fixedToCamera = true;
            }
        }
        this.numLabel.fixedToCamera = true;
    },
    
    initializeMenus: function() {
        this.craftMenu = this.add.sprite(240, 240, 'craftMenu');
        this.craftMenu.anchor.x = 0.5;
        this.craftMenu.anchor.y = 0.5;
        this.craftMenu.visible = false;
        this.craftMenu.fixedToCamera = true;
        
        this.supplyPrompt = this.add.sprite(240, 240, 'supplyPrompt');
        this.supplyPrompt.anchor.x = 0.5;
        this.supplyPrompt.anchor.y = 0.5;
        this.supplyPrompt.visible = false;
        this.supplyPrompt.fixedToCamera = true;
        
        this.slotPrompt = this.add.sprite(240, 240, 'slotPrompt');
        this.slotPrompt.anchor.x = 0.5;
        this.slotPrompt.anchor.y = 0.5;
        this.slotPrompt.visible = false;
        this.slotPrompt.fixedToCamera = true;
        
        if (this.game.resourceCount < 10)
            this.resourceText = this.add.text((3 * this.game.posMult) - 13, (10 * this.game.posMult) + 20, '  ' + this.game.resourceCount, { font: '16px Arial', fill: '#FFF'});
        else if (this.game.resourceCount < 100)
            this.resourceText = this.add.text((3 * this.game.posMult) - 13, (10 * this.game.posMult) + 20, ' ' + this.game.resourceCount, { font: '16px Arial', fill: '#FFF'});
        else
            this.resourceText = this.add.text((3 * this.game.posMult) - 13, (10 * this.game.posMult) + 20, '' + this.game.resourceCount, { font: '16px Arial', fill: '#FFF'});
        this.resourceText.visible = false;
        this.resourceText.fixedToCamera = true;
        
        this.exitMenu = this.add.sprite(240, 240, 'exitMenu');
        this.exitMenu.fixedToCamera = true;
        this.exitMenu.anchor.x = 0.5;
        this.exitMenu.anchor.y = 0.5;
        this.exitMenu.visible = false;
        
        if (this.game.randomEvent1 == undefined) {
            this.menu = this.add.sprite(240, 240, 'demoscreen');
            this.menu.fixedToCamera = true;
            this.menu.anchor.x = 0.5;
            this.menu.anchor.y = 0.5;
            this.game.paused = true;
        }
        this.exitKey.onDown.add(this.escapeSequence, this);
        
        this.craftState = false;
        this.inventoryState = false;
    },
    
    /* ---------------------- MAP CREATION ALGORITHMS BEGIN AT THIS POINT ONWARD ---------------------- */
    worldGen: function() {
        /* MAP GENERATION IN CONJUNCTION TO WORLD GEN */
        this.ground = this.game.map.createLayer('ground');
        this.ground.resizeWorld();
        this.boundary = this.add.group();
        this.boundary.enableBody = true;
        this.rock = this.add.group();
        this.rock.enableBody = true;
        this.lake = this.add.group();
        this.lake.enableBody = true;
        this.river = this.add.group();
        this.river.enableBody = true;
        this.sand = this.add.group();
        this.sand.enableBody = true;
        
        /* Supply Zone */
        switch (this.game.supGen) {
            case 1:
                this.Sup1();
                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.sup1X);
                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.sup1Y);
                break;
            case 2:
                this.Sup2();
                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.sup2X);
                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.sup2Y);
                break;
            default:
                break;
        }
        
        /* Lake Generation*/
        switch (this.game.lakeGen){
            case 1:
                this.Lake1a();
                break;
            case 2:
                this.Lake1b();
                break;
            case 3:
                this.Lake2a();
                break;
            case 4:
                this.Lake2b();
                break;
            case 5:
                this.Lake3a();
                break;
            case 6:
                this.Lake3b();
                break;
            case 7:
                this.Lake4a();
                break;
            case 8:
                this.Lake4b();
                break;
            default:
                break;
        }
        
        if (this.game.lakeGen != 1 && this.game.lakeGen != 2) {
            switch (this.game.zone1Gen) {
                case 0:
                    this.Zone1s();
                    break;
                case 1:
                    this.Zone1r();
                    this.game.spawnExclX = this.game.spawnExclX.concat(this.game.zone1rX);
                    this.game.spawnExclY = this.game.spawnExclY.concat(this.game.zone1rY);
                    break;
                default:
                    break;
            }
        }
        
        if (this.game.lakeGen != 3 && this.game.lakeGen != 4) {
            switch (this.game.zone2Gen) {
                case 0:
                    this.Zone2s();
                    break;
                case 1:
                    this.Zone2r();
                    this.game.spawnExclX = this.game.spawnExclX.concat(this.game.zone2rX);
                    this.game.spawnExclY = this.game.spawnExclY.concat(this.game.zone2rY);
                    break; 
                default:
                    break;
            }
        }
        
        switch (this.game.zone3Gen) {
                case 0:
                    this.Zone3s();
                    break;
                case 1:
                    this.Zone3r();
                    this.game.spawnExclX = this.game.spawnExclX.concat(this.game.zone3rX);
                    this.game.spawnExclY = this.game.spawnExclY.concat(this.game.zone3rY);
                    break; 
                default:
                    break;
        }
        
        switch (this.game.zone4Gen) {
                case 0:
                    this.Zone4s();
                    break;
                case 1:
                    this.Zone4r();
                    this.game.spawnExclX = this.game.spawnExclX.concat(this.game.zone4rX);
                    this.game.spawnExclY = this.game.spawnExclY.concat(this.game.zone4rY);
                    break; 
                default:
                    break;
        }
        
        if (this.game.lakeGen != 7 && this.game.lakeGen != 8) {
            switch (this.game.zone5Gen) {
                case 0:
                    this.Zone5s();
                    break;
                case 1:
                    this.Zone5r();
                    this.game.spawnExclX = this.game.spawnExclX.concat(this.game.zone5rX);
                    this.game.spawnExclY = this.game.spawnExclY.concat(this.game.zone5rY);
                    break; 
                default:
                    break;
            }  
        }
        
        switch (this.game.zone6Gen) {
                case 0:
                    this.Zone6s();
                    break;
                case 1:
                    this.Zone6r();
                    this.game.spawnExclX = this.game.spawnExclX.concat(this.game.zone6rX);
                    this.game.spawnExclY = this.game.spawnExclY.concat(this.game.zone6rY);
                    break; 
                default:
                    break;
        }
        
        if (this.game.lakeGen != 5 && this.game.lakeGen != 6) {
            switch (this.game.zone7Gen) {
                case 0:
                    this.Zone7s();
                    break;
                case 1:
                    this.Zone7r();
                    this.game.spawnExclX = this.game.spawnExclX.concat(this.game.zone7rX);
                    this.game.spawnExclY = this.game.spawnExclY.concat(this.game.zone7rY);
                    break; 
                default:
                    break;
            }
        }
        
        /* RBGEN */
        switch (this.game.riverGen) {
            case 1:
                this.River1a();
                switch (this.game.riverDeco) {
                    case 0:
                        this.Deco1as();
                        break;
                    case 1:
                        this.Deco1ar();
                        this.game.spawnExclX = this.game.spawnExclX.concat(this.game.deco1arX);
                        this.game.spawnExclY = this.game.spawnExclY.concat(this.game.deco1arY);
                        break;
                }
                
                break;
            case 2:
                this.River1b();
                switch (this.game.riverDeco) {
                    case 0:
                        this.Deco1bs();
                        break;
                    case 1:
                        this.Deco1br();
                        this.game.spawnExclX = this.game.spawnExclX.concat(this.game.deco1brX);
                        this.game.spawnExclY = this.game.spawnExclY.concat(this.game.deco1brY);
                        break;
                }
                break;
            case 3:
                this.River2b();
                switch (this.game.riverDeco) {
                    case 0:
                        this.Deco2bs();
                        break;
                    case 1:
                        this.Deco2br();
                        this.game.spawnExclX = this.game.spawnExclX.concat(this.game.deco2brX);
                        this.game.spawnExclY = this.game.spawnExclY.concat(this.game.deco2brY);
                        break;
                }
                break;
            case 4:
                this.River2a();
                switch (this.game.riverDeco) {
                    case 0:
                        this.Deco2as();
                        break;
                    case 1:
                        this.Deco2ar();
                        this.game.spawnExclX = this.game.spawnExclX.concat(this.game.deco2arX);
                        this.game.spawnExclY = this.game.spawnExclY.concat(this.game.deco2arY);
                        break;
                }
                break;
            default:
                break;
        }
        
        /* 2 RIVERS CASE */
        switch (this.game.riverGenAlt) {
            case 2:
                this.River1b();
                switch (this.game.riverDecoAlt) {
                    case 0:
                        this.Deco1bs();
                        break;
                    case 1:
                        this.Deco1br();
                        this.game.spawnExclX = this.game.spawnExclX.concat(this.game.deco1brX);
                        this.game.spawnExclY = this.game.spawnExclY.concat(this.game.deco1brY);
                        break;
                    default:
                        break;
                }
                break;
            case 3:
                this.River2b();
                switch (this.game.riverDecoAlt) {
                    case 0:
                        this.Deco2bs();
                        break;
                    case 1:
                        this.Deco2br();
                        this.game.spawnExclX = this.game.spawnExclX.concat(this.game.deco2brX);
                        this.game.spawnExclY = this.game.spawnExclY.concat(this.game.deco2brY);
                        break;
                    default:
                        break;
                }
                break;
            case 4:
                this.River2a();
                switch (this.game.riverDecoAlt) {
                    case 0:
                        this.Deco2as();
                        break;
                    case 1:
                        this.Deco2ar();
                        this.game.spawnExclX = this.game.spawnExclX.concat(this.game.deco2arX);
                        this.game.spawnExclY = this.game.spawnExclY.concat(this.game.deco2arY);
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
        
        switch(this.game.zone4Deco) {
            case 0:
                this.DecoCs();
                break;
            case 1:
                this.DecoCr();
                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoCrX);
                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoCrY);
                break;
            default:
                break;
        }
        
        // Finish Decorating Left
        if (this.game.lakeGen === 0) {
            switch(this.game.riverGen) {
                case 1:
                    switch (this.game.s2Deco) {
                        case 0:
                            this.DecoS2s();
                            break;
                        case 1:
                            this.DecoS2r();
                            this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS2rX);
                            this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS2rY);
                            break;
                    }
                    break;
                case 2:
                    switch (this.game.s1Deco) {
                        case 0:
                            this.DecoS1s();
                            break;
                        case 1:
                            this.DecoS1r();
                            this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS1rX);
                            this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS1rY);
                            break;
                }
                break;
            }
            
            switch(this.game.riverGenAlt) {
                case 3:
                    switch (this.game.s4Deco) {
                        case 0:
                            this.DecoS4s();
                            break;
                        case 1:
                            this.DecoS4r();
                            this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS4rX);
                            this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS4rY);
                            break;
                    }
                    break;
                case 4:
                    switch (this.game.s3Deco) {
                        case 0:
                            this.DecoS3s();
                            break;
                        case 1:
                            this.DecoS3r();
                            this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS3rX);
                            this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS3rY);
                            break;
                }
                break;
            }
        }
        
        if (this.game.lakeGen === 1 || this.game.lakeGen === 2) {
            switch(this.game.riverGen) {
                    case 3:
                        switch (this.game.s2Deco) {
                            case 0:
                                this.DecoS2s();
                                break;
                            case 1:
                                this.DecoS2r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS2rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS2rY);
                                break;
                        }
                    
                        switch (this.game.s4Deco) {
                            case 0:
                                this.DecoS4s();
                                break;
                            case 1:
                                this.DecoS4r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS4rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS4rY);
                                break;
                        }
                        break;
                    case 4:
                        switch (this.game.s2Deco) {
                            case 0:
                                this.DecoS2s();
                                break;
                            case 1:
                                this.DecoS2r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS2rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS2rY);
                                break;
                        }
                    
                        switch (this.game.s3Deco) {
                            case 0:
                                this.DecoS3s();
                                break;
                            case 1:
                                this.DecoS3r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS3rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS3rY);
                                break;
                        }
                        break;
                }
        }
        
        if (this.game.lakeGen === 3 || this.game.lakeGen === 4) {
            if (this.game.multiRiv !== 0){
                switch(this.game.riverGen) {
                    case 2:
                        switch (this.game.s3Deco) {
                            case 0:
                                this.DecoS3s();
                                break;
                        case 1:
                                this.DecoS3r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS3rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS3rY);
                                break;
                        }
                        
                        switch (this.game.s4Deco) {
                            case 0:
                                this.DecoS4s();
                                break;
                            case 1:
                                this.DecoS4r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS4rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS4rY);
                                break;
                        }
                        break;
                    case 3:
                        switch (this.game.s2Deco) {
                            case 0:
                                this.DecoS2s();
                                break;
                            case 1:
                                this.DecoS2r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS2rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS2rY);
                                break;
                        }
                        
                        switch (this.game.s4Deco) {
                            case 0:
                                this.DecoS4s();
                                break;
                            case 1:
                                this.DecoS4r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS4rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS4rY);
                                break;
                        }
                        break;
                    case 4:
                        switch (this.game.s2Deco) {
                            case 0:
                                this.DecoS2s();
                                break;
                            case 1:
                                this.DecoS2r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS2rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS2rY);
                                break;
                        }
                        
                        switch (this.game.s3Deco) {
                            case 0:
                                this.DecoS3s();
                                break;
                            case 1:
                                this.DecoS3r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS3rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS3rY);
                                break;
                        }
                        break;
                }
            }
            else {
                switch(this.game.riverGen) {
                    case 3:
                        switch (this.game.s4Deco) {
                            case 0:
                                this.DecoS4s();
                                break;
                            case 1:
                                this.DecoS4r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS4rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS4rY);
                                break;
                        }
                        break;
                    case 4:
                        switch (this.game.s3Deco) {
                            case 0:
                                this.DecoS3s();
                                break;
                            case 1:
                                this.DecoS3r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS3rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS3rY);
                                break;
                        }
                        break;
                }
            }
        }
        
        if (this.game.lakeGen === 5 || this.game.lakeGen === 6) {
            switch(this.game.riverGen) {
                    case 1:
                        switch (this.game.s2Deco) {
                            case 0:
                                this.DecoS2s();
                                break;
                            case 1:
                                this.DecoS2r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS2rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS2rY);
                                break;
                        }
                    
                        switch (this.game.s3Deco) {
                            case 0:
                                this.DecoS3s();
                                break;
                            case 1:
                                this.DecoS3r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS3rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS3rY);
                                break;
                        }
                        break;
                    case 2:
                        switch (this.game.s1Deco) {
                            case 0:
                                this.DecoS1s();
                                break;
                            case 1:
                                this.DecoS1r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS1rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS1rY);
                                break;
                        }
                    
                        switch (this.game.s3Deco) {
                            case 0:
                                this.DecoS3s();
                                break;
                            case 1:
                                this.DecoS3r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS3rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS3rY);
                                break;
                        }
                        break;
                }
        }
        
        if (this.game.lakeGen === 7 || this.game.lakeGen === 8) {
            if (this.game.multiRiv !== 0){
                switch(this.game.riverGen) {
                    case 1:
                        switch (this.game.s3Deco) {
                            case 0:
                                this.DecoS3s();
                                break;
                            case 1:
                                this.DecoS3r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS3rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS3rY);
                                break;
                        }
                        
                        switch (this.game.s2Deco) {
                            case 0:
                                this.DecoS2s();
                                break;
                        case 1:
                                this.DecoS2r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS2rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS2rY);
                                break;
                        }
                        break;
                    case 2:
                        switch (this.game.s3Deco) {
                            case 0:
                                this.DecoS3s();
                                break;
                            case 1:
                                this.DecoS3r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS3rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS3rY);
                                break;
                        }
                        
                        switch (this.game.s1Deco) {
                            case 0:
                                this.DecoS1s();
                                break;
                            case 1:
                                this.DecoS1r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS1rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS1rY);
                                break;
                        }
                        break;
                    case 3:
                        switch (this.game.s1Deco) {
                            case 0:
                                this.DecoS1s();
                                break;
                            case 1:
                                this.DecoS1r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS1rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS1rY);
                                break;
                        }
                        
                        switch (this.game.s2Deco) {
                            case 0:
                                this.DecoS2s();
                                break;
                            case 1:
                                this.DecoS2r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS2rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS2rY);
                                break;
                        }
                        break;
                }
            }
            else {
                switch(this.game.riverGen) {
                    case 1:
                        switch (this.game.s2Deco) {
                            case 0:
                                this.DecoS2s();
                                break;
                            case 1:
                                this.DecoS2r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS2rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS2rY);
                                break;
                        }
                        break;
                    case 2:
                        switch (this.game.s1Deco) {
                            case 0:
                                this.DecoS1s();
                                break;
                            case 1:
                                this.DecoS1r();
                                this.game.spawnExclX = this.game.spawnExclX.concat(this.game.decoS1rX);
                                this.game.spawnExclY = this.game.spawnExclY.concat(this.game.decoS1rY);
                                break;
                        }
                        break;
                }
            }
        }
    },
    
    setBoundary: function() {
        /* CREATE ENTRANCE AND SUPPLY BOUNDS */
        this.entranceSpawn = this.boundary.create(4 * this.game.posMult, 14 * this.game.posMult, 'entrance');
        this.entranceSpawn.body.immovable = true;
        this.entranceSpawn = this.boundary.create(5 * this.game.posMult, 14 * this.game.posMult, 'entrance');
        this.entranceSpawn.body.immovable = true;
        this.entranceSpawn = this.boundary.create(5 * this.game.posMult, 15 * this.game.posMult, 'entrance');
        this.entranceSpawn.body.immovable = true;
        this.entranceSpawn = this.boundary.create(17 * this.game.posMult, 0 * this.game.posMult, 'boundary');
        this.entranceSpawn.body.immovable = true;
        this.entranceSpawn = this.boundary.create(17 * this.game.posMult, 1 * this.game.posMult, 'boundary');
        this.entranceSpawn.body.immovable = true;
        this.entranceSpawn = this.boundary.create(17 * this.game.posMult, 2 * this.game.posMult, 'boundary');
        this.entranceSpawn.body.immovable = true;
        this.entranceSpawn = this.boundary.create(18 * this.game.posMult, 2 * this.game.posMult, 'boundary');
        this.entranceSpawn.body.immovable = true;
        this.entranceSpawn = this.boundary.create(19 * this.game.posMult, 2 * this.game.posMult, 'boundary');
        this.entranceSpawn.body.immovable = true;
        
        this.safe = this.game.map.createLayer('safe_haven');
        this.game.map.setCollisionBetween(4,5);
        this.grid = this.add.sprite(0, 0, 'grid');
    },
    
    /* Supply Zone Creation */
    Sup1: function() {
        for (i = 0; i < 9; i++){
            this.rockSpawn = this.rock.create(this.game.sup1X[i] * this.game.posMult, this.game.sup1Y[i] * this.game.posMult, 'rock');
            this.rockSpawn.body.immovable = true;
        }
    },
    
    Sup2: function() {
        for (i = 0; i < 9; i++){
            this.rockSpawn = this.rock.create(this.game.sup2X[i] * this.game.posMult, this.game.sup2Y[i] * this.game.posMult, 'rock');
            this.rockSpawn.body.immovable = true;
        }
    },
    
    /* Lake Creation */
    Lake1a: function() {
         for (i = 0; i < 36; i++)
            this.lakeSpawn = this.lake.create(this.game.lake1aX[i] * this.game.posMult, this.game.lake1aY[i] * this.game.posMult, 'water');
    },
    
    Lake1b: function() {
        for (i = 0; i < 36; i++)
            this.lakeSpawn = this.lake.create(this.game.lake1bX[i] * this.game.posMult, this.game.lake1bY[i] * this.game.posMult, 'water');
    },
    
    Lake2a: function() {
        for (i = 0; i < 36; i++)
            this.lakeSpawn = this.lake.create(this.game.lake2aX[i] * this.game.posMult, this.game.lake2aY[i] * this.game.posMult, 'water');
    },
    
     Lake2b: function() {
        for (i = 0; i < 36; i++)
            this.lakeSpawn = this.lake.create(this.game.lake2bX[i] * this.game.posMult, this.game.lake2bY[i] * this.game.posMult, 'water');
    },
    
    Lake3a: function() {
        for (i = 0; i < 36; i++)
            this.lakeSpawn = this.lake.create(this.game.lake3aX[i] * this.game.posMult, this.game.lake3aY[i] * this.game.posMult, 'water');
    },
    
    Lake3b: function() {
        for (i = 0; i < 36; i++)
            this.lakeSpawn = this.lake.create(this.game.lake3bX[i] * this.game.posMult, this.game.lake3bY[i] * this.game.posMult, 'water');
    },
    
    Lake4a: function() {
        for (i = 0; i < 36; i++)
            this.lakeSpawn = this.lake.create(this.game.lake4aX[i] * this.game.posMult, this.game.lake4aY[i] * this.game.posMult, 'water');
    },
    
    Lake4b: function() {
        for (i = 0; i < 36; i++)
            this.lakeSpawn = this.lake.create(this.game.lake4bX[i] * this.game.posMult, this.game.lake4bY[i] * this.game.posMult, 'water');
    },
    
    /* Zone Creation */
    Zone1r: function() {
        for (i = 0; i < 16; i++){
            this.rockSpawn = this.rock.create(this.game.zone1rX[i] * this.game.posMult, this.game.zone1rY[i] * this.game.posMult, 'rock');
            this.rockSpawn.body.immovable = true;
        }
    },
    
    Zone1s: function() {
        for (i = 0; i < 16; i++)
            this.sandSpawn = this.sand.create(this.game.zone1sX[i] * this.game.posMult, this.game.zone1sY[i] * this.game.posMult, 'sand');
    },
    
    Zone2r: function() {
        for (i = 0; i < 16; i++){
            this.rockSpawn = this.rock.create(this.game.zone2rX[i] * this.game.posMult, this.game.zone2rY[i] * this.game.posMult, 'rock');
            this.rockSpawn.body.immovable = true;
        }
    },
    
    Zone2s: function() {
        for (i = 0; i < 16; i++)
            this.sandSpawn = this.sand.create(this.game.zone2sX[i] * this.game.posMult, this.game.zone2sY[i] * this.game.posMult, 'sand');
    },
    
    Zone3r: function() {
        for (i = 0; i < 16; i++){
            this.rockSpawn = this.rock.create(this.game.zone3rX[i] * this.game.posMult, this.game.zone3rY[i] * this.game.posMult, 'rock');
            this.rockSpawn.body.immovable = true;
        }
    },
    
    Zone3s: function() {
        for (i = 0; i < 16; i++)
            this.sandSpawn = this.sand.create(this.game.zone3sX[i] * this.game.posMult, this.game.zone3sY[i] * this.game.posMult, 'sand');
    },
    
    Zone4r: function() {
        for (i = 0; i < 16; i++){
            this.rockSpawn = this.rock.create(this.game.zone4rX[i] * this.game.posMult, this.game.zone4rY[i] * this.game.posMult, 'rock');
            this.rockSpawn.body.immovable = true;
        }
    },
    
    Zone4s: function() {
        for (i = 0; i < 16; i++)
            this.sandSpawn = this.sand.create(this.game.zone4sX[i] * this.game.posMult, this.game.zone4sY[i] * this.game.posMult, 'sand');
    },
    
    Zone5r: function() {
        for (i = 0; i < 16; i++){
            this.rockSpawn = this.rock.create(this.game.zone5rX[i] * this.game.posMult, this.game.zone5rY[i] * this.game.posMult, 'rock');
            this.rockSpawn.body.immovable = true;
        }
    },
    
    Zone5s: function() {
        for (i = 0; i < 16; i++)
            this.sandSpawn = this.sand.create(this.game.zone5sX[i] * this.game.posMult, this.game.zone5sY[i] * this.game.posMult, 'sand');
    },
    
    Zone6r: function() {
        for (i = 0; i < 16; i++){
            this.rockSpawn = this.rock.create(this.game.zone6rX[i] * this.game.posMult, this.game.zone6rY[i] * this.game.posMult, 'rock');
            this.rockSpawn.body.immovable = true;
        }
    },
    
    Zone6s: function() {
        for (i = 0; i < 16; i++)
            this.sandSpawn = this.sand.create(this.game.zone6sX[i] * this.game.posMult, this.game.zone6sY[i] * this.game.posMult, 'sand');
    },
    
    Zone7r: function() {
        for (i = 0; i < 16; i++){
            this.rockSpawn = this.rock.create(this.game.zone7rX[i] * this.game.posMult, this.game.zone7rY[i] * this.game.posMult, 'rock');
            this.rockSpawn.body.immovable = true;
        }
    },
    
    Zone7s: function() {
        for (i = 0; i < 16; i++)
            this.sandSpawn = this.sand.create(this.game.zone7sX[i] * this.game.posMult, this.game.zone7sY[i] * this.game.posMult, 'sand');
    },
    
    /* River Creation */
    River1a: function() {
        for (i = 0; i < 24; i++)
            this.riverSpawn = this.river.create(this.game.river1aX[i] * this.game.posMult, this.game.river1aY[i] * this.game.posMult, 'water');
    },
    
    River1b: function() {
        for (i = 0; i < 24; i++)
            this.riverSpawn = this.river.create(this.game.river1bX[i] * this.game.posMult, this.game.river1bY[i] * this.game.posMult, 'water');
    },
    
    River2a: function() {
        for (i = 0; i < 24; i++)
            this.riverSpawn = this.river.create(this.game.river2aX[i] * this.game.posMult, this.game.river2aY[i] * this.game.posMult, 'water');
    },
    
    River2b: function() {
        for (i = 0; i < 24; i++)
            this.riverSpawn = this.river.create(this.game.river2bX[i] * this.game.posMult, this.game.river2bY[i] * this.game.posMult, 'water');
    },
    
    /* Decoration Creation */
    Deco1ar: function() {
        for (i = 0; i < 5; i++){
            this.rockSpawn = this.rock.create(this.game.deco1arX[i] * this.game.posMult, this.game.deco1arY[i] * this.game.posMult, 'rock');
            this.rockSpawn.body.immovable = true;
        }
    },
    
    Deco1as: function() {
        for (i = 0; i < 5; i++)
            this.sandSpawn = this.sand.create(this.game.deco1asX[i] * this.game.posMult, this.game.deco1asY[i] * this.game.posMult, 'sand');
    },
    
    Deco1br: function() {
        for (i = 0; i < 5; i++){
            this.rockSpawn = this.rock.create(this.game.deco1brX[i] * this.game.posMult, this.game.deco1brY[i] * this.game.posMult, 'rock');
            this.rockSpawn.body.immovable = true;
        }
    },
    
    Deco1bs: function() {
        for (i = 0; i < 5; i++)
            this.sandSpawn = this.sand.create(this.game.deco1bsX[i] * this.game.posMult, this.game.deco1bsY[i] * this.game.posMult, 'sand');
    },
    
    Deco2ar: function() {
        for (i = 0; i < 5; i++){
            this.rockSpawn = this.rock.create(this.game.deco2arX[i] * this.game.posMult, this.game.deco2arY[i] * this.game.posMult, 'rock');
            this.rockSpawn.body.immovable = true;
        }
    },
    
    Deco2as: function() {
        for (i = 0; i < 5; i++)
            this.sandSpawn = this.sand.create(this.game.deco2asX[i] * this.game.posMult, this.game.deco2asY[i] * this.game.posMult, 'sand');
    },
    
    Deco2br: function() {
        for (i = 0; i < 5; i++){
            this.rockSpawn = this.rock.create(this.game.deco2brX[i] * this.game.posMult, this.game.deco2brY[i] * this.game.posMult, 'rock');
            this.rockSpawn.body.immovable = true;
        }
    },
    
    Deco2bs: function() {
        for (i = 0; i < 5; i++)
            this.sandSpawn = this.sand.create(this.game.deco2bsX[i] * this.game.posMult, this.game.deco2bsY[i] * this.game.posMult, 'sand');
    },
    
    DecoCr: function() {
        for (i = 0; i < 3; i++){
            this.rockSpawn = this.rock.create(this.game.decoCrX[i] * this.game.posMult, this.game.decoCrY[i] * this.game.posMult, 'rock');
            this.rockSpawn.body.immovable = true;
        }
    },
    
    DecoCs: function() {
        for (i = 0; i < 3; i++)
            this.sandSpawn = this.sand.create(this.game.decoCsX[i] * this.game.posMult, this.game.decoCsY[i] * this.game.posMult, 'sand');
    },
    
    DecoS1r: function() {
        for (i = 0; i < 5; i++){
            this.rockSpawn = this.rock.create(this.game.decoS1rX[i] * this.game.posMult, this.game.decoS1rY[i] * this.game.posMult, 'rock');
            this.rockSpawn.body.immovable = true;
        }
    },
    
    DecoS1s: function() {
        for (i = 0; i < 5; i++)
            this.sandSpawn = this.sand.create(this.game.decoS1sX[i] * this.game.posMult, this.game.decoS1sY[i] * this.game.posMult, 'sand');
    },
    
    DecoS2r: function() {
        for (i = 0; i < 5; i++){
            this.rockSpawn = this.rock.create(this.game.decoS2rX[i] * this.game.posMult, this.game.decoS2rY[i] * this.game.posMult, 'rock');
            this.rockSpawn.body.immovable = true;
        }
    },
    
    DecoS2s: function() {
        for (i = 0; i < 5; i++)
            this.sandSpawn = this.sand.create(this.game.decoS2sX[i] * this.game.posMult, this.game.decoS2sY[i] * this.game.posMult, 'sand');
    },
    
    DecoS3r: function() {
        for (i = 0; i < 5; i++){
            this.rockSpawn = this.rock.create(this.game.decoS3rX[i] * this.game.posMult, this.game.decoS3rY[i] * this.game.posMult, 'rock');
            this.rockSpawn.body.immovable = true;
        }
    },
    
    DecoS3s: function() {
        for (i = 0; i < 5; i++)
            this.sandSpawn = this.sand.create(this.game.decoS3sX[i] * this.game.posMult, this.game.decoS3sY[i] * this.game.posMult, 'sand');
    },
    
    DecoS4r: function() {
        for (i = 0; i < 5; i++){
            this.rockSpawn = this.rock.create(this.game.decoS4rX[i] * this.game.posMult, this.game.decoS4rY[i] * this.game.posMult, 'rock');
            this.rockSpawn.body.immovable = true;
        }
    },
    
    DecoS4s: function() {
        for (i = 0; i < 5; i++)
            this.sandSpawn = this.sand.create(this.game.decoS4sX[i] * this.game.posMult, this.game.decoS4sY[i] * this.game.posMult, 'sand');
    },
};