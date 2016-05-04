DA5Game.boss = function(game) {};

DA5Game.boss.prototype = {
    create: function(){
        this.initializeState = true;
        /* World Create */
        this.worldGen();
        this.setBoundary();
        this.initializeFood();
        this.initializeResources();
        
        this.spawnSupplyItem();
        
        this.initializeTurrets();
        
        this.timerInitialization();
        this.playerInitialization();
        this.initializeBoss();
        
        // TEST RESET
        //this.win = this.add.sprite((1 * this.game.posMult) + 8, (18 * this.game.posMult) + 8, 'win');
        //this.physics.enable(this.win, Phaser.Physics.ARCADE);
        /* DEMO USE */
        this.game.playerMaxHealth = 5;
        this.game.playerHealth = 5;
        this.game.playerMaxThirst = 5;
        this.game.playerThirst = 5;
        this.game.slot1 = 11;
        this.game.slot2 = 9;
        this.game.resourceCount = 500;
        
        this.initializeHUD();
        this.dialogueState = false;
        this.initializeDialogue();
        this.initializeState = false;
        this.initializeMenus();
        
        this.updateInventorySlots();
        this.camera.follow(this.game.player);
        this.exitState = false;
        this.endGame = false;
    },
    
    update: function(){
        /* COLLISION LIST START */
        this.physics.arcade.collide(this.game.player, this.safe);
        this.physics.arcade.collide(this.game.player, this.rock);
        this.physics.arcade.collide(this.game.player, this.turret);
        this.physics.arcade.overlap(this.game.player, this.sand, this.sandCollide, null, this);
        this.physics.arcade.overlap(this.game.player, this.lake, this.lakeCollide, null, this);
        this.physics.arcade.overlap(this.game.player, this.river, this.riverCollide, null, this);
        this.physics.arcade.overlap(this.game.player, this.win, this.GameOver, null, this);
        this.physics.arcade.overlap(this.game.player, this.food, this.collectFood, null, this);
        this.physics.arcade.overlap(this.game.player, this.resource, this.collectResource, null, this);
        this.physics.arcade.overlap(this.game.player, this.supplyItem, this.collectSupplyItem, null, this);
        this.physics.arcade.collide(this.pulse, this.safe, this.destroyPulse, null, this);
        this.physics.arcade.collide(this.pulse, this.rock, this.destroyPulse, null, this);
        this.physics.arcade.overlap(this.pulse, this.turret, this.stunTurret, null, this);
        this.physics.arcade.overlap(this.pulse, this.boss, this.damageBoss, null, this);
        
        this.physics.arcade.collide(this.boss, this.safe);
        this.physics.arcade.collide(this.boss, this.rock);
        this.physics.arcade.collide(this.boss, this.boundary);
        this.physics.arcade.overlap(this.boss, this.game.player, this.damagePlayer, null, this);
        this.physics.arcade.overlap(this.bulletArray, this.game.player, this.damagePlayer, null, this);
        this.physics.arcade.overlap(this.bulletArray, this.safe, this.destroyBossProjectile, null, this);
        this.physics.arcade.overlap(this.bulletArray, this.boundary, this.destroyBossProjectile, null, this);
        this.physics.arcade.overlap(this.bulletArray, this.rock, this.destroyBossProjectile, null, this);
        
        this.physics.arcade.overlap(this.enemyPulse, this.game.player, this.damagePlayer, null, this);
        this.physics.arcade.collide(this.enemyPulse, this.safe, this.destroyEnemyPulse, null, this);
        this.physics.arcade.collide(this.enemyPulse, this.boundary, this.destroyEnemyPulse, null, this);
        
        if (!this.dialogueState){
            this.movePlayer();
            this.movePlayerComponents();
        }
        
        if (this.BOSSMOVE && this.bossAction.running) {
            this.bossMove(this.BOSSMOVE);
            this.moveBossComponents();
        }
        this.postLogicCheck();
        
        if (this.game.phase1.isPlaying)
            this.game.phase1.stop();
        else if (this.game.phase2.isPlaying)
            this.game.phase2.stop();
        
        if (!this.dialogueState) {
            if (!this.game.bossMusic.isPlaying) {
                this.game.bossMusic.play();
                this.game.bossMusic.volume = 0.1;
            }
        }
        else 
            this.game.bossMusic.stop();
    },
    
    movePlayer: function() {
        if (this.game.interact || this.supplyState)
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
    },
    
    GameOver: function() {
        this.state.start('loseState');
    },
    
    
    /*---------------------------------------------------------- BOSS AI START ----------------------------------------------------------*/
    initializeBoss: function() {
        this.bossHealth = 20;
        this.bossActionTime = 3;
        
        // Change the attack rate of each projectile
        this.basicRate = 1;
        this.flameRate = .005;
        this.randomSpeedRate = .3;
        this.circularRate = 1;
        
        this.basicSpeed;
        this.flameSpeed;
        this.circularSpeed;
        
        this.bulletArray = this.add.group();
        this.bulletArray.enableBody = true;
        this.bulletArray.physicsBodyType = Phaser.Physics.ARCADE;
        this.bulletArray.setAll('outOfBoundsKill', true);
        this.bulletArray.setAll('checkWorldBounds', true);
        
        this.boss = this.add.sprite(320, 320, 'boss');
        this.physics.arcade.enable(this.boss);
        this.boss.anchor.setTo(0.5, 0.5);
        
        this.bossdamaged = this.add.sprite(320, 320, 'bossdamaged');
        this.bossdamaged.anchor.setTo(0.5, 0.5);
        this.bossdamaged.animations.add('damaged', [0, 1], 5, true);
        this.bossdamaged.frame = 1;
        
        this.bossbar = this.add.sprite(320, 256, 'bossbar');
        this.bossbar.anchor.setTo(0.5, 0.5);
        this.bossbar.frame = (20 - this.bossHealth);
        
        this.ChatBubble = this.add.text(this.game.player.body.x, this.game.player.body.y, 'Quick grabb ammo and shoot him while hes getting ready', { fontSize: '32px', fill: '#555' });
        this.ChatBubble.destroy();
    },
    
    damageBoss: function(boss, pulse) {          //originally named BossGetsHit
        pulse.kill();
        if (this.lethalState) {
            if (!this.damageImmuneBoss.running){
                if (!this.game.jab.isPlaying)
                    this.game.jab.play('', 0, 0.1, false);
                this.bossHealth--
                if(this.bossHealth == 0) {
                    boss.kill();
                    this.endingSequence();
                }
                else {
                    this.bossbar.frame++;
                    this.damageImmuneBoss = this.time.create(true);
                    this.damageImmuneBoss.add(this.game.damageImmuneTime, this.destroyImmuneTimerBoss, this);
                    this.damageImmuneBoss.start();
                }
            }
        }
    },
    
    destroyImmuneTimerBoss: function() {
        this.bossdamaged.animations.stop();
        this.bossdamaged.frame = 1;
        this.damageImmuneBoss.destroy();
    },
    
    destroyBossProjectile: function(projectile, object){
        projectile.kill();
    },
    
    bossMove: function(CanMove) {
        this.angle = Math.atan2(this.game.player.body.y - this.boss.body.y - 40, this.game.player.body.x - this.boss.body.x - 40);
        this.angle = this.angle * (180/Math.PI);
        this.boss.angle = 270 + this.angle;
        this.bossdamaged.angle = 270 + this.angle;

        if(Math.abs(((this.game.player.body.x - this.boss.body.x)^2 + (this.game.player.body.y - this.boss.body.y)^2)^(.5)) > 200 && CanMove == true) {
            if(this.game.player.body.x - this.boss.body.x > 40)             
                this.boss.body.velocity.x = 50;
            else if(this.game.player.body.x - this.boss.body.x < 40)
                this.boss.body.velocity.x = - 50;
            else
                this.boss.body.velocity.x = 0;

            if(this.game.player.body.y - this.boss.body.y > 40)
                this.boss.body.velocity.y = 50;
            else if(this.game.player.body.y - this.boss.body.y < 40)
                this.boss.body.velocity.y = -50;
            else
                this.boss.body.velocity.y = 0;
        }
        else {
            this.boss.body.velocity.y = 0;
            this.boss.body.velocity.x = 0;
        }
    },
    
    moveBossComponents: function(){
        this.bossbar.x = this.boss.x;
        this.bossbar.y = this.boss.y -  64;
        this.bossdamaged.x = this.boss.x;
        this.bossdamaged.y = this.boss.y;
    },
    
    bossAi: function() {
        this.boss.body.velocity.x = 0;
        this.boss.body.velocity.y = 0;
        
        if (this.bossHealth > 15)
            this.rand = this.rnd.integerInRange(0, 1);
        else if (this.bossHealth > 10)
            this.rand = this.rnd.integerInRange(0, 2);
        else if (this.bossHealth > 5)
            this.rand = this.rnd.integerInRange(0, 3);
        else if (this.bossHealth > 0)
            this.rand = this.rnd.integerInRange(0, 4);
        this.bossAction = this.time.create(true);                   // This is used to calculate the boss's next attack pattern
        if (this.projectileFire != undefined)
            this.projectileFire.destroy();
        this.projectileFire = this.time.create(true);               // This will handle the firing rate of the selected projectile
        /*
        0: stand
        1: basic
        2: 4-direction
        3: random burst
        4: flame thrower
        */
        //this.rand = 4;
        switch (this.rand){
            case 0:
                this.BOSSMOVE=false;
                this.bossAction.add(this.bossActionTime * Phaser.Timer.SECOND, this.bossAi, this);
                break;
            case 1:
                this.BOSSMOVE=true;
                this.bossAction.add(this.bossActionTime * Phaser.Timer.SECOND, this.bossAi, this);
                this.projectileFire.add(this.basicRate * Phaser.Timer.SECOND, this.basicAttack, this);
                this.projectileFire.start();
                break;
            case 2:
                this.BOSSMOVE=false;
                this.bossAction.add(this.bossActionTime * Phaser.Timer.SECOND, this.bossAi, this);
                this.projectileFire.add(this.circularRate * Phaser.Timer.SECOND, this.circularAttack, this);
                this.projectileFire.start();
                break;
            case 3:
                this.BOSSMOVE=true;
                this.bossAction.add(this.bossActionTime * Phaser.Timer.SECOND, this.bossAi, this);
                this.projectileFire.add(this.randomSpeedRate * Phaser.Timer.SECOND, this.randomSpeedAttack, this);
                this.projectileFire.start();
                break;
            case 4:
                this.BOSSMOVE = false;
                this.bossAction.add(this.bossActionTime * Phaser.Timer.SECOND, this.bossAi, this);
                this.projectileFire.add(this.flameRate * Phaser.Timer.SECOND, this.flameAttack, this);
                this.projectileFire.start();
                break;
            default:
                break;
        }
        this.bossAction.start();
    },
    
    flameAttack: function() {
        this.bullet = this.bulletArray.create(this.boss.body.x + 40, this.boss.body.y + 40, 'bossFlame');
        this.physics.arcade.enable(this.bullet);
        this.bullet.anchor.setTo(0.5, 0.5);

        this.angle = Math.atan2(this.game.player.body.y - this.boss.body.y - 40, (this.game.player.body.x + 8) - this.boss.body.x - 40);
        this.angle = this.angle * (180/Math.PI);
        this.bullet.angle = 270 + this.angle;

        this.physics.arcade.moveToObject(this.bullet, this.game.player, 400);
        this.projectileFire.add(this.flameRate * Phaser.Timer.SECOND, this.flameAttack, this);
        this.projectileFire.start();
        
    },
    
    basicAttack: function () {
        this.bullet = this.bulletArray.create(this.boss.body.x + 40, this.boss.body.y + 40, 'bossBasic');
        this.physics.arcade.enable(this.bullet);
        this.bullet.anchor.setTo(0.5, 0.5);

        this.angle = Math.atan2(this.game.player.body.y - this.boss.body.y - 43, this.game.player.body.x - this.boss.body.x - 43);
        this.angle = this.angle * (180/Math.PI);
        this.bullet.angle = 270 + this.angle;

        this.physics.arcade.moveToObject(this.bullet, this.game.player, 400);
        
        this.projectileFire.add(this.basicRate * Phaser.Timer.SECOND, this.basicAttack, this);
        this.projectileFire.start();
    },

    randomSpeedAttack: function() {
        this.randx = this.rnd.integerInRange(-200, 200);
        this.randy = this.rnd.integerInRange(-200, 200);

        this.bullet = this.bulletArray.create(this.boss.body.x + 40, this.boss.body.y + 40, 'bossMissile');
        this.physics.arcade.enable(this.bullet);
        this.bullet.anchor.setTo(0.5, 0.5);

        this.angle = Math.atan2(this.game.player.body.y - this.boss.body.y - 40, this.game.player.body.x - this.boss.body.x - 40);
        this.angle = this.angle * (180/Math.PI);
        this.bullet.angle = 270 + this.angle;

        this.physics.arcade.moveToObject(this.bullet, this.game.player, 400);
        this.bullet.body.velocity.x += this.randx;
        this.bullet.body.velocity.y += this.randy;
        
        this.projectileFire.add(this.randomSpeedRate * Phaser.Timer.SECOND, this.randomSpeedAttack, this);
        this.projectileFire.start();
    },
    
    circularAttack: function() {
        this.randx = this.rnd.integerInRange(-200, 200);
        this.randy = this.rnd.integerInRange(-200, 200);

        this.bullet = this.bulletArray.create(this.boss.body.x + 40, this.boss.body.y + 40, 'bossBasic');
        this.physics.arcade.enable(this.bullet);
        this.bullet.body.velocity.x = 250;
        this.bullet.angle = 270;
        this.bullet.body.velocity.x += this.randx;
        this.bullet.body.velocity.y += this.randy;

        this.bullet = this.bulletArray.create(this.boss.body.x + 40, this.boss.body.y + 40, 'bossBasic');
        this.physics.arcade.enable(this.bullet);
        this.bullet.body.velocity.x = -250;
        this.bullet.angle = 90;
        this.bullet.body.velocity.x += this.randx;
        this.bullet.body.velocity.y += this.randy;

        this.bullet = this.bulletArray.create(this.boss.body.x + 40, this.boss.body.y + 40, 'bossBasic');
        this.physics.arcade.enable(this.bullet);
        this.bullet.body.velocity.y = 250;
        this.bullet.angle = 0;
        this.bullet.body.velocity.x += this.randx;
        this.bullet.body.velocity.y += this.randy;

        this.bullet = this.bulletArray.create(this.boss.body.x + 40, this.boss.body.y + 40, 'bossBasic');
        this.physics.arcade.enable(this.bullet);
        this.bullet.body.velocity.y = -250;
        this.bullet.angle = 180;
        this.bullet.body.velocity.x += this.randx;
        this.bullet.body.velocity.y += this.randy;
        
        this.projectileFire.add(this.circularRate * Phaser.Timer.SECOND, this.circularAttack, this);
        this.projectileFire.start();
    },
/*---------------------------------------------------------- BOSS AI END ----------------------------------------------------------*/
    
    /* ---------------------- EXTERNAL HELPER FUNCTIONS BEGIN HERE AND ONWARDS ---------------------- */
    initializeDialogue: function(){
        /*
        1d = 31 frames
        1n = 16 frames
        2d = 10 frames
        3d = 7 frames
        5d = 6 frames
        6d = 6 frames
        7d = 4 frames
        boss = 8 frames;
        conclusion = 7 frames */
        this.darken = this.add.sprite(0, 0, 'darken');
        this.darken.fixedToCamera = true;
        this.dialogue = this.add.sprite(0, 288, 'bossdialogue');
        this.dialogue.fixedToCamera = true;
        this.dialogueFrames = 8;
        this.dialoguePrompt = this.add.text((7 * this.game.posMult) + 24, (12 * this.game.posMult) + 14, 'Press ENTER to continue or ESC to skip', {font: '12px Arial', fill: '#FFF'});
        this.dialoguePrompt.fixedToCamera = true;
        this.dialogueState = true;
        this.pauseAllTimers();
    },
    
    endingSequence: function(){     // Conclusion
        this.darken.visible = true;
        this.dialogue.kill();
        this.dialogue = this.add.sprite(0, 288, 'conclusion');
        this.dialogue.fixedToCamera = true;
        this.dialogueFrames = 7;
        this.dialoguePrompt.visible = true;
        this.dialogueState = true;
        this.endGame = true;
    },
    
    progressDialogue: function() {
        if (this.dialogueState){
            if (this.dialogue.frame < this.dialogueFrames - 1){
                this.dialogue.frame++;
            }
            else {
                if (!this.endGame) {
                    this.dialogue.visible = false;
                    this.dialoguePrompt.visible = false;
                    this.dialogueState = false;
                    this.darken.visible = false;
                    this.resumeAllTimers();
                }
                else
                    this.state.start('winState');
            }
        }
    },
    
    initializeTurrets: function() {
        this.turret = this.add.group();
        this.physics.enable(this.turret, Phaser.Physics.PHASER);
        this.turret.enableBody = true;
        switch(this.game.maxTurrets){
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
                    if (canSpawn){
                        this.turret5 = this.turret.create((x * this.game.posMult) + 4, (y * this.game.posMult) + 4, 'turret');
                        this.game.spawnExclX.push(x);
                        this.game.spawnExclY.push(y);
                    }
                }
                this.turret5.body.immovable = true;
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
                    if (canSpawn){
                        this.turret4 = this.turret.create((x * this.game.posMult) + 4, (y * this.game.posMult) + 4, 'turret');
                        this.game.spawnExclX.push(x);
                        this.game.spawnExclY.push(y);
                    }
                }
                this.turret4.body.immovable = true;
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
                    if (canSpawn){
                        this.turret3 = this.turret.create((x * this.game.posMult) + 4, (y * this.game.posMult) + 4, 'turret');
                        this.game.spawnExclX.push(x);
                        this.game.spawnExclY.push(y);
                    }
                }
                this.turret3.body.immovable = true;
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
                    if (canSpawn){
                        this.turret2 = this.turret.create((x * this.game.posMult) + 4, (y * this.game.posMult) + 4, 'turret');
                        this.game.spawnExclX.push(x);
                        this.game.spawnExclY.push(y);
                    }
                }
                this.turret2.body.immovable = true;
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
                    if (canSpawn){
                        this.turret1 = this.turret.create((x * this.game.posMult) + 4, (y * this.game.posMult) + 4, 'turret');
                        this.game.spawnExclX.push(x);
                        this.game.spawnExclY.push(y);
                    }
                }
                this.turret1.body.immovable = true;
                break;
            default:
                break;
        }
        
        switch(this.game.maxTurrets){
            case 5:
                this.turret5.animations.add('stunned', [1, 2], 3, true);
                this.turret5.frame = 0;
            case 4:
                this.turret4.animations.add('stunned', [1, 2], 3, true);
                this.turret4.frame = 0;
            case 3:
                this.turret3.animations.add('stunned', [1, 2], 3, true);
                this.turret3.frame = 0;
            case 2:
                this.turret2.animations.add('stunned', [1, 2], 3, true);
                this.turret2.frame = 0;
            case 1:
                this.turret1.animations.add('stunned', [1, 2], 3, true);
                this.turret1.frame = 0;
                break;
            default:
                break;
        }
        
        this.enemyPulse = this.add.group();
        this.enemyPulse.enableBody = true;
        this.enemyPulse.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemyPulse.setAll('outOfBoundsKill', true);
        this.enemyPulse.setAll('checkWorldBounds', true);
    },
    
    collectSupplyItem: function() {
            this.supplyItem.kill();             // Destroys supply item
            
            this.pauseTimers();
            this.game.interact = true;          // Freezes player movement
            this.supplyState = true;            // Changes control listener to listen for 'Y' and 'N'
            this.supplyPrompt.visible = true;   // Makes the supply prompt visible
    },
    
    pauseTimers: function() {
        if (this.healthDrain.running)
            this.healthDrain.pause();
        this.hungerDrain.pause();
        this.thirstDrain.pause();
    },
    
    pauseAllTimers: function() {
        if (this.healthDrain.running)
            this.healthDrain.pause();
        this.hungerDrain.pause();
        this.thirstDrain.pause();
        this.bossAction.pause();
        switch(this.game.maxTurrets){
            case 5:
                this.turretFire5.pause();
            case 4:
                this.turretFire4.pause();
            case 3:
                this.turretFire3.pause();
            case 2:
                this.turretFire2.pause();
            case 1:
                this.turretFire1.pause();
                break;
            default:
                break;
        }
    },
    
    resumeTimers: function() {
        this.healthDrain.resume();
        this.hungerDrain.resume();
        this.thirstDrain.resume();
    },
    
    resumeAllTimers: function() {
        if (this.healthDrain.paused)
            this.healthDrain.resume();
        this.hungerDrain.resume();
        this.thirstDrain.resume();
        this.bossAction.resume();
        switch(this.game.maxTurrets){
            case 5:
                this.turretFire5.resume();
            case 4:
                this.turretFire4.resume();
            case 3:
                this.turretFire3.resume();
            case 2:
                this.turretFire2.resume();
            case 1:
                this.turretFire1.resume();
                break;
            default:
                break;
        }
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
                this.inventoryslot1 = this.add.sprite((13 * this.game.posMult), (14 * this.game.posMult), 'refrigerator');
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
                this.inventoryslot2 = this.add.sprite((14 * this.game.posMult), (14 * this.game.posMult), 'refrigerator');
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
            this.space.x = this.game.player.x;
            this.space.y = this.game.player.y - 16;
        }
        if (this.game.hasShield){
            this.shield.x = this.game.player.x;
            this.shield.y = this.game.player.y;
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
            this.inventoryslot3 = this.add.sprite((12 * this.game.posMult), (14 * this.game.posMult), 'pulsegun');
            this.inventoryslot3.fixedToCamera = true;
            if (this.inventoryState)
                this.inventoryslot3.visible = true;
            else
                this.inventoryslot3.visible = false;
            this.lethalState = true;
            this.resumeTimers();
        }
    },
    
    declineOption: function() {
        if (this.exitGameState){
            this.exitMenu.visible = false;
            this.exitGameState = false;
            this.game.paused = false;
        }
    },
    
    escapeSequence: function() {
        if(this.game.paused) {  // Dialogue State
            this.exitMenu.visible = false;
            this.exitGameState = false;
            this.game.paused = false;
        }
        else if (this.dialogueState){
            if (this.endGame) {
                this.state.start('winState');
            }
            else {
                this.dialogueState = false;
                this.dialogue.visible = false;
                this.dialoguePrompt.visible = false;
                this.darken.visible = false;
                this.resumeAllTimers();
            }
        }
        else if (this.craftState) {
            this.craftState = false;
            this.game.interact = false;
            this.resourceText.visible = false;
            this.numLabel.visible = false;
            this.craftMenu.visible = false;
        }
        else {
            this.exitState = true;
            this.exitMenu.visible = true;
            this.exitGameState = true;
            this.game.paused = true;
        }
    },
    
    destroyPulse: function(pulse, rock) {
        pulse.kill();
    },
    
    destroyEnemyPulse: function(pulse, rock) {
        pulse.kill();
    },
    
    stunTurret: function(pulse, turret){
        if (turret == this.turret1){
            this.turretstunned1 = true;
            this.turret1.animations.play('stunned');
            this.stunTimer16 = this.time.create(true);
            this.stunTimer16.add(this.game.stunDuration, this.killTurretStunTimer, this, 1);
            this.stunTimer16.start();
        }
        else if (turret == this.turret2){
            this.turretstunned2 = true;
            this.turret2.animations.play('stunned');
            this.stunTimer17 = this.time.create(true);
            this.stunTimer17.add(this.game.stunDuration, this.killTurretStunTimer, this, 2);
            this.stunTimer17.start();
        }
        else if (turret == this.turret3){
            this.turretstunned3 = true;
            this.turret3.animations.play('stunned');
            this.stunTimer18 = this.time.create(true);
            this.stunTimer18.add(this.game.stunDuration, this.killTurretStunTimer, this, 3);
            this.stunTimer18.start();
        }
        else if (turret == this.turret4){
            this.turretstunned4 = true;
            this.turret4.animations.play('stunned');
            this.stunTimer19 = this.time.create(true);
            this.stunTimer19.add(this.game.stunDuration, this.killTurretStunTimer, this, 4);
            this.stunTimer19.start();
        }
        else if (turret == this.turret5){
            this.turretstunned5 = true;
            this.turret5.animations.play('stunned');
            this.stunTimer20 = this.time.create(true);
            this.stunTimer20.add(this.game.stunDuration, this.killTurretStunTimer, this, 5);
            this.stunTimer20.start();
        }
    },
    
    killTurretStunTimer: function(turretNumber){
        switch (turretNumber) {
            case 1:
                this.turretstunned1 = false;
                this.turret1.animations.stop();
                this.turret1.frame = 0;
                break;
            case 2:
                this.turretstunned2 = false;
                this.turret2.animations.stop();
                this.turret2.frame = 0;
                break;
            case 3:
                this.turretstunned3 = false;
                this.turret3.animations.stop();
                this.turret3.frame = 0;
                break;
            case 4:
                this.turretstunned4 = false;
                this.turret4.animations.stop();
                this.turret4.frame = 0;
                break;
            case 5:
                this.turretstunned5 = false;
                this.turret5.animations.stop();
                this.turret5.frame = 0;
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
            this.shield.frame = 0;
            this.shield.visible = true;
        }
    },
    
    fireUp: function() {
        if (this.game.pulseRounds > 0 && !this.craftState){
            this.game.pulseRounds--;
            this.updateConsumables();
            this.pulseRound = this.pulse.create(this.game.player.x, this.game.player.y, 'pulse');
            this.pulseRound.anchor.x = 0.5;
            this.pulseRound.anchor.y = 0.5;
            this.pulseRound.body.velocity.y = -this.game.pulseSpeed;
        }
    },
    
    fireDown: function() {
        if (this.game.pulseRounds > 0 && !this.craftState){
            this.game.pulseRounds--;
            this.updateConsumables();
            this.pulseRound = this.pulse.create(this.game.player.x, this.game.player.y, 'pulse');
            this.pulseRound.anchor.x = 0.5;
            this.pulseRound.anchor.y = 0.5;
            this.pulseRound.body.velocity.y = this.game.pulseSpeed;
        }
    },
    
    fireLeft: function() {
        if (this.game.pulseRounds > 0 && !this.craftState){
            this.game.pulseRounds--;
            this.updateConsumables();
            this.pulseRound = this.pulse.create(this.game.player.x, this.game.player.y, 'pulse');
            this.pulseRound.anchor.x = 0.5;
            this.pulseRound.anchor.y = 0.5;
            this.pulseRound.body.velocity.x = -this.game.pulseSpeed;
        }
    },
    
    fireRight: function() {
        if (this.game.pulseRounds > 0 && !this.craftState){
            this.game.pulseRounds--;
            this.updateConsumables();
            this.pulseRound = this.pulse.create(this.game.player.x, this.game.player.y, 'pulse');
            this.pulseRound.anchor.x = 0.5;
            this.pulseRound.anchor.y = 0.5;
            this.pulseRound.body.velocity.x = this.game.pulseSpeed;
        }
    },
    
    fireEnemyPulse: function(turretNum) {
        switch (turretNum){
            case 1:
                if (!this.turretstunned1){
                    this.enemyPulseRound1 = this.enemyPulse.create(this.turret1.x + 6, this.turret1.y + 6, 'enemypulse');
                    this.physics.arcade.moveToXY(this.enemyPulseRound1, this.game.player.x, this.game.player.y, this.game.fireSpeed);
                }
                this.turretFire1 = this.time.create(true);
                this.turretFire1.add(this.game.fireRate * Phaser.Timer.SECOND, this.fireEnemyPulse, this, 1);
                this.turretFire1.start();
                break;
            case 2:
                if (!this.turretstunned2){
                    this.enemyPulseRound2 = this.enemyPulse.create(this.turret2.x + 6, this.turret2.y + 6, 'enemypulse');
                    this.physics.arcade.moveToXY(this.enemyPulseRound2, this.game.player.x, this.game.player.y, this.game.fireSpeed);
                }
                this.turretFire2 = this.time.create(true);
                this.turretFire2.add(this.game.fireRate * Phaser.Timer.SECOND, this.fireEnemyPulse, this, 2);
                this.turretFire2.start();
                break;
            case 3:
                if (!this.turretstunned3){
                    this.enemyPulseRound3 = this.enemyPulse.create(this.turret3.x + 6, this.turret3.y + 6, 'enemypulse');
                    this.physics.arcade.moveToXY(this.enemyPulseRound3, this.game.player.x, this.game.player.y, this.game.fireSpeed);
                }
                this.turretFire3 = this.time.create(true);
                this.turretFire3.add(this.game.fireRate * Phaser.Timer.SECOND, this.fireEnemyPulse, this, 3);
                this.turretFire3.start();
                break;
            case 4:
                if (!this.turretstunned4){
                    this.enemyPulseRound4 = this.enemyPulse.create(this.turret4.x + 6, this.turret4.y + 6, 'enemypulse');
                    this.physics.arcade.moveToXY(this.enemyPulseRound4, this.game.player.x, this.game.player.y, this.game.fireSpeed);
                }
                this.turretFire4 = this.time.create(true);
                this.turretFire4.add(this.game.fireRate * Phaser.Timer.SECOND, this.fireEnemyPulse, this, 4);
                this.turretFire4.start();
                break;
            case 5:
                if (!this.turretstunned5){
                    this.enemyPulseRound5 = this.enemyPulse.create(this.turret5.x + 6, this.turret5.y + 6, 'enemypulse');
                    this.physics.arcade.moveToXY(this.enemyPulseRound5, this.game.player.x, this.game.player.y, this.game.fireSpeed);
                }
                this.turretFire5 = this.time.create(true);
                this.turretFire5.add(this.game.fireRate * Phaser.Timer.SECOND, this.fireEnemyPulse, this, 5);
                this.turretFire5.start();
                break;
            default:
                break;
        }
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
        if (this.craftState === false && !this.dialogueState && !this.game.paused){
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
        
        if (this.damageImmuneBoss.running)
                this.bossdamaged.animations.play('damaged');
        
        // slows player down when player is on sand or in water
        if (!this.physics.arcade.overlap(this.game.player, this.sand) && !this.physics.arcade.overlap(this.game.player, this.lake) && !this.physics.arcade.overlap(this.game.player, this.river)){
            this.game.isSlowed = false;
            this.space.animations.stop();
        }
        
        // Hides spacebar when player is not touching a water block
        if (!this.physics.arcade.overlap(this.game.player, this.lake) && !this.physics.arcade.overlap(this.game.player, this.river))
                this.space.visible = false;
        
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
            if (!this.objectRespawnTimer.running){
                this.objectRespawnTimer = this.time.create(true);
                this.objectRespawnTimer.add(this.game.objectRespawn, this.updateFood, this);
                this.objectRespawnTimer.start();
            }
        }
        
        if (this.game.numResource < this.game.maxResource){
            if (!this.resourceRespawnTimer.running){
                this.resourceRespawnTimer = this.time.create(true);
                this.resourceRespawnTimer.add(this.game.objectRespawn, this.updateResource, this);
                this.resourceRespawnTimer.start();
            }
        }
        
        // end condition
        if (this.game.playerHealth === 0)
            this.GameOver();
    },
    
    spawnSupplyItem: function() {
        this.supplyItem = this.add.sprite((18 * this.game.posMult), (1 * this.game.posMult), 'pulsegun');
        this.physics.enable(this.supplyItem, Phaser.Physics.PHASER);
        this.lethalState = false;
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
    
    damagePlayer: function() {
        if (!this.game.hurt.isPlaying)
            this.game.hurt.play('', 0, 0.1, false);
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
        this.game.ring.play('', 0, 0.1, true);
        this.food.remove(food);
        this.objectRespawnTimer.destroy();
        this.updateHunger(false);
        this.game.numFood--;
    },
    
    collectResource: function(player, resource) {
        this.game.ring.play('', 0, 0.1, true);
        this.resource.remove(resource);
        this.resourceRespawnTimer.destroy();
        this.game.resourceCount++;
        this.updateResourceText();
        if (this.game.resourceCount < 10)
            this.resourceText = this.add.text((3 * this.game.posMult) - 13, (10 * this.game.posMult) + 20, '  ' + this.game.resourceCount, { font: '16px Arial', fill: '#FFF'});
        else if (this.game.resourceCount < 100)
            this.resourceText = this.add.text((3 * this.game.posMult) - 13, (10 * this.game.posMult) + 20, ' ' + this.game.resourceCount, { font: '16px Arial', fill: '#FFF'});
        else
            this.resourceText = this.add.text((3 * this.game.posMult) - 13, (10 * this.game.posMult) + 20, '' + this.game.resourceCount, { font: '16px Arial', fill: '#FFF'});
        this.game.numResource--;
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
                    if (this.game.playerMaxHealth > 4)
                        this.game.playerHealth = 5;
                    break;
                case 3:
                    this.health4.alpha = 1;
                    if (this.game.playerMaxHealth > 3)
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
    
    updateResource: function() {
        count = this.game.maxResource - this.game.numResource;
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
                this.game.numResource++;
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
        this.cursors = this.input.keyboard.createCursorKeys();
        
        this.enterKey = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.enterKey.onDown.add(this.progressDialogue, this);
        
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
        this.healKey.onDown.add(this.healPlayer, this);
        this.shieldKey.onDown.add(this.shieldPlayer, this);
        
        this.pulse = this.add.group();
        this.pulse.enableBody = true;
        this.pulse.physicsBodyType = Phaser.Physics.ARCADE;
        this.pulse.setAll('outOfBoundsKill', true);
        this.pulse.setAll('checkWorldBounds', true);
        
        this.game.player = this.add.sprite((2 * this.game.posMult) + 16, (17 * this.game.posMult) + 16, 'player');
        this.game.player.anchor.x = 0.5;
        this.game.player.anchor.y = 0.5;
        this.physics.enable(this.game.player, Phaser.Physics.ARCADE);
        this.game.player.body.collideWorldBounds = true;
        this.shield = this.add.sprite(this.game.player.x - 8, this.game.player.y - 8, 'shield');
        this.shield.anchor.x = 0.5;
        this.shield.anchor.y = 0.5;
        this.shield.visible = false;
        this.space = this.add.sprite(this.game.player.x - 8, this.game.player.y - 12, 'space');
        this.space.anchor.x = 0.5;
        this.space.anchor.y = 0.5;
        
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
        this.game.numFood = this.game.maxFood;
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
        this.game.maxResource = 10;
        this.game.numResource = this.game.maxResource;
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
        this.damageImmune = this.time.create(true);
        this.damageImmuneBoss = this.time.create(true);
        this.healthDrain = this.time.create(true);
        this.healthDrain.add(this.game.healthDecay, this.updatehealth, this, true);
        this.hungerDrain = this.time.create(false);
        this.hungerDrain.add(this.game.hungerDecay, this.updateHunger, this, true);
        this.thirstDrain = this.time.create(true);
        this.thirstDrain.add(this.game.thirstDecay, this.updateThirst, this, true);
        this.thirstGain = this.time.create(false);
        this.objectRespawnTimer = this.time.create(true);
        this.objectRespawnTimer.add(this.game.objectRespawn, this.updateFood, this);
        this.resourceRespawnTimer = this.time.create(true);
        this.resourceRespawnTimer.add(this.game.objectRespawn, this.updateResource, this);    // this.game.objectRespawn will be used again
        
        // 5 Turret Fire Time Groups
        this.turretFire1 = this.time.create(true);            
        this.turretFire1.add(this.game.fireTime1, this.fireEnemyPulse, this, 1);
        this.turretFire2 = this.time.create(true);
        this.turretFire2.add(this.game.fireTime2, this.fireEnemyPulse, this, 2);
        this.turretFire3 = this.time.create(true);
        this.turretFire3.add(this.game.fireTime3, this.fireEnemyPulse, this, 3);
        this.turretFire4 = this.time.create(true);
        this.turretFire4.add(this.game.fireTime4, this.fireEnemyPulse, this, 4);
        this.turretFire5 = this.time.create(true);
        this.turretFire5.add(this.game.fireTime5, this.fireEnemyPulse, this, 5);
        
        // Create Boss Timer
        this.bossAction = this.time.create(true);
        this.bossAction.add(3 * Phaser.Timer.SECOND, this.bossAi, this);
        
        switch(this.game.maxTurrets){
            case 5:
                this.turretFire5.start();
            case 4:
                this.turretFire4.start();
            case 3:
                this.turretFire3.start();
            case 2:
                this.turretFire2.start();
            case 1: 
                this.turretFire1.start();
                break;
            default:
                break;
        }
        this.hungerDrain.start();
        this.thirstDrain.start();
        this.bossAction.start();
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
        if (this.inventoryState === false && !this.dialogueState && !this.game.paused){
            this.inventoryState = true;
            this.inventoryIcon.visible = false;
            this.consumablesCanvas.visible = true;
            this.inventoryCanvas.visible = true;
            this.medKitInventory.visible = true;
            this.shieldInventory.visible = true;
            this.pulseInventory.visible = true;
            this.numLabel.visible = true;
            
            if (this.inventoryslot1 !== undefined)
                this.inventoryslot1.visible = true;
            
            if (this.inventoryslot2 !== undefined)
                this.inventoryslot2.visible = true;
            
            if (this.inventoryslot3 !== undefined)
                this.inventoryslot3.visible = true;
        }
        else if (this.inventoryState === true && !this.game.paused){
            this.inventoryState = false;
            this.inventoryIcon.visible = true;
            this.consumablesCanvas.visible = false;
            this.inventoryCanvas.visible = false;
            this.medKitInventory.visible = false;
            this.shieldInventory.visible = false;
            this.pulseInventory.visible = false;
            this.numLabel.visible = false;
            
            if (this.inventoryslot1 !== undefined)
                this.inventoryslot1.visible = false;
            
            if (this.inventoryslot2 !== undefined)
                this.inventoryslot2.visible = false;
            
            if (this.inventoryslot3 !== undefined)
                this.inventoryslot3.visible = false;
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
        this.numLabel = this.add.sprite(4, 0, 'day8');
        this.numLabel.fixedToCamera = true;
    },
    
    initializeMenus: function() {
        this.craftMenu = this.add.sprite(240, 240, 'craftMenu');
        this.craftMenu.anchor.x = 0.5;
        this.craftMenu.anchor.y = 0.5;
        this.craftMenu.visible = false;
        this.craftMenu.fixedToCamera = true;
        
        this.supplyPrompt = this.add.sprite(240, 240, 'supplyPromptBoss');
        this.supplyPrompt.anchor.x = 0.5;
        this.supplyPrompt.anchor.y = 0.5;
        this.supplyPrompt.visible = false;
        this.supplyPrompt.fixedToCamera = true;
        
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
        
        /* WORLD SEED */
        // 1's are rocks, 0's are sand
        this.game.lakeGen = 0;                                          //Only Rivers
        this.game.riverGen = this.rnd.integerInRange(1, 2);             //MultiRiver
        this.game.riverGenAlt = this.rnd.integerInRange(3, 4);
        this.game.zone1Gen = 1;
        this.game.zone2Gen = 0;
        this.game.zone3Gen = 0;
        this.game.zone4Gen = 0;
        this.game.zone5Gen = 0;
        this.game.zone6Gen = 0;
        this.game.zone7Gen = 1;
        this.game.riverDeco = 1;
        this.game.riverDecoAlt = 1;
        this.game.zone4Deco = 0;
        this.game.s1Deco = 0;
        this.game.s2Deco = 0;
        this.game.s3Deco = 0;
        this.game.s4Deco = 0;
        
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