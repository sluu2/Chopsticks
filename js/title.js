DA5Game.title = function(game) {};

DA5Game.title.prototype = {
    create: function(){
        var startKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        startKey.onDown.addOnce(this.openStartMenu, this);
        this.game.playerHealth = 0;
        
        /* EDIT BELOW */
        /* World Create */
        this.worldGen();
        this.setBoundary();
        
        this.initializeResources();
        this.initializeFood();
        
        this.initializeDrones();
        this.initializeTurrets();
        
        this.timerInitialization();
        this.playerInitialization();
        this.camera.follow(this.player);
        this.showcase = this.add.sprite(0, 0, 'showcase');
        this.showcase.fixedToCamera = true;
        this.title = this.add.sprite(240, 160, 'title');
        this.title.anchor.x = 0.5;
        this.title.anchor.y = 0.5;
        this.title.fixedToCamera = true;
        
        this.pressstart = this.add.sprite(240, 400, 'pressstart');
        this.pressstart.anchor.x = 0.5;
        this.pressstart.anchor.y = 0.5;
        this.pressstart.animations.add('blink', [0, 1, 2, 3, 4, 3, 2, 1], 20, true);
        this.pressstart.animations.play('blink');
        this.pressstart.fixedToCamera = true;
    },
    
    update: function(){
        /* COLLISION LIST START */
        this.physics.arcade.collide(this.drone, this.drone);
        this.physics.arcade.collide(this.drone, this.boundary);
        this.physics.arcade.collide(this.drone, this.rock);
        this.physics.arcade.collide(this.drone, this.safe);
        this.physics.arcade.collide(this.drone, this.turret);
        
        if (this.leftKey.isDown || this.cursors.left.isDown)
            this.player.body.velocity.x = -this.game.speed;
        else if (this.rightKey.isDown || this.cursors.right.isDown)
            this.player.body.velocity.x = this.game.speed;
        else
            this.player.body.velocity.x = 0;
        
        if (this.upKey.isDown || this.cursors.up.isDown)
            this.player.body.velocity.y = -this.game.speed;
        else if (this.downKey.isDown || this.cursors.down.isDown)
            this.player.body.velocity.y = this.game.speed;
        else 
            this.player.body.velocity.y = 0;
        
        /* AI */
        this.dronePatrol();
        
        if (this.game.menuTheme.volume != 0.2)
            this.game.menuTheme.volume = 0.2;
        if (!this.game.menuTheme.isPlaying){
            this.game.menuTheme.play();
        }
    },
    
    playerInitialization: function() {
        this.upKey = this.input.keyboard.addKey(Phaser.Keyboard.W);
        this.leftKey = this.input.keyboard.addKey(Phaser.Keyboard.A);
        this.downKey = this.input.keyboard.addKey(Phaser.Keyboard.S);
        this.rightKey = this.input.keyboard.addKey(Phaser.Keyboard.D);
        this.cursors = this.input.keyboard.createCursorKeys();
        
        this.player = this.add.sprite(320, 320, 'blank');
        this.player.anchor.x = 0.5;
        this.player.anchor.y = 0.5;
        this.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.collideWorldBounds = true;
        this.player.visible = false;
    },
    
    openStartMenu: function () {
		this.state.start('startMenu');
	},
    
    /* ---------------------- EXTERNAL HELPER FUNCTIONS BEGIN HERE AND ONWARDS ---------------------- */
    
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
                this.turret5.frame = 0;
            case 4:
                this.turret4.frame = 0;
            case 3:
                this.turret3.frame = 0;
            case 2:
                this.turret2.frame = 0;
            case 1:
                this.turret1.frame = 0;
                break;
            default:
                break;
        }
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
    
    dronePatrol: function() {
        if (this.dronePatrol1.running) {
            switch (this.game.maxDrones) {
                case 15:
                    switch (this.droneDir1) {
                        case 0:
                            this.drone11.body.velocity.x = 0;
                            this.drone11.body.velocity.y = 0;
                            this.drone6.body.velocity.x = 0;
                            this.drone6.body.velocity.y = 0;
                            this.drone1.body.velocity.x = 0;
                            this.drone1.body.velocity.y = 0;
                            break;
                        case 1:
                            this.drone11.body.velocity.x = 0;
                            this.drone11.body.velocity.y = -this.game.droneSpeed;
                            this.drone6.body.velocity.x = 0;
                            this.drone6.body.velocity.y = -this.game.droneSpeed;
                            this.drone1.body.velocity.x = 0;
                            this.drone1.body.velocity.y = -this.game.droneSpeed;
                            break;
                        case 2:
                            this.drone11.body.velocity.x = 0;
                            this.drone11.body.velocity.y = this.game.droneSpeed;
                            this.drone6.body.velocity.x = 0;
                            this.drone6.body.velocity.y = this.game.droneSpeed;
                            this.drone1.body.velocity.x = 0;
                            this.drone1.body.velocity.y = this.game.droneSpeed;
                            break;
                        case 3:
                            this.drone11.body.velocity.x = -this.game.droneSpeed;
                            this.drone11.body.velocity.y = 0;
                            this.drone6.body.velocity.x = -this.game.droneSpeed;
                            this.drone6.body.velocity.y = 0;
                            this.drone1.body.velocity.x = -this.game.droneSpeed;
                            this.drone1.body.velocity.y = 0;
                            break;
                        case 4:
                            this.drone11.body.velocity.x = this.game.droneSpeed;
                            this.drone6.body.velocity.x = this.game.droneSpeed;
                            this.drone1.body.velocity.x = this.game.droneSpeed;
                            this.drone11.body.velocity.y = 0;
                            this.drone6.body.velocity.y = 0;
                            this.drone1.body.velocity.y = 0;
                            break;
                        default:
                            break;
                    }
                    break;
                case 10:
                    switch (this.droneDir1) {
                        case 0:
                            this.drone6.body.velocity.x = 0;
                            this.drone6.body.velocity.y = 0;
                            this.drone1.body.velocity.x = 0;
                            this.drone1.body.velocity.y = 0;
                            break;
                        case 1:
                            this.drone6.body.velocity.x = 0;
                            this.drone6.body.velocity.y = -this.game.droneSpeed;
                            this.drone1.body.velocity.x = 0;
                            this.drone1.body.velocity.y = -this.game.droneSpeed;
                            break;
                        case 2:
                            this.drone6.body.velocity.x = 0;
                            this.drone6.body.velocity.y = this.game.droneSpeed;
                            this.drone1.body.velocity.x = 0;
                            this.drone1.body.velocity.y = this.game.droneSpeed;
                            break;
                        case 3:
                            this.drone6.body.velocity.x = -this.game.droneSpeed;
                            this.drone6.body.velocity.y = 0;
                            this.drone1.body.velocity.x = -this.game.droneSpeed;
                            this.drone1.body.velocity.y = 0;
                            break;
                        case 4:
                            this.drone6.body.velocity.x = this.game.droneSpeed;
                            this.drone6.body.velocity.y = 0;
                            this.drone1.body.velocity.x = this.game.droneSpeed;
                            this.drone1.body.velocity.y = 0;
                            break;
                        default:
                            break;
                    }
                    break;
                case 5:
                    switch (this.droneDir1) {
                        case 0:
                            this.drone1.body.velocity.x = 0;
                            this.drone1.body.velocity.y = 0;
                            break;
                        case 1:
                            this.drone1.body.velocity.x = 0;
                            this.drone1.body.velocity.y = -this.game.droneSpeed;
                            break;
                        case 2:
                            this.drone1.body.velocity.x = 0;
                            this.drone1.body.velocity.y = this.game.droneSpeed;
                            break;
                        case 3:
                            this.drone1.body.velocity.x = -this.game.droneSpeed;
                            this.drone1.body.velocity.y = 0;
                            break;
                        case 4:
                            this.drone1.body.velocity.x = this.game.droneSpeed;
                            this.drone1.body.velocity.y = 0;
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
                            this.drone12.body.velocity.x = 0;
                            this.drone12.body.velocity.y = 0;
                            this.drone7.body.velocity.x = 0;
                            this.drone7.body.velocity.y = 0;
                            this.drone2.body.velocity.x = 0;
                            this.drone2.body.velocity.y = 0;
                            break;
                        case 1:
                            this.drone12.body.velocity.x = 0;
                            this.drone12.body.velocity.y = -this.game.droneSpeed;
                            this.drone7.body.velocity.x = 0;
                            this.drone7.body.velocity.y = -this.game.droneSpeed;
                            this.drone2.body.velocity.x = 0;
                            this.drone2.body.velocity.y = -this.game.droneSpeed;
                            break;
                        case 2:
                            this.drone12.body.velocity.x = 0;
                            this.drone12.body.velocity.y = this.game.droneSpeed;
                            this.drone7.body.velocity.x = 0;
                            this.drone7.body.velocity.y = this.game.droneSpeed;
                            this.drone2.body.velocity.x = 0;
                            this.drone2.body.velocity.y = this.game.droneSpeed;
                            break;
                        case 3:
                            this.drone12.body.velocity.x = -this.game.droneSpeed;
                            this.drone12.body.velocity.y = 0;
                            this.drone7.body.velocity.x = -this.game.droneSpeed;
                            this.drone7.body.velocity.y = 0;
                            this.drone2.body.velocity.x = -this.game.droneSpeed;
                            this.drone2.body.velocity.y = 0;
                            break;
                        case 4:
                            this.drone12.body.velocity.x = this.game.droneSpeed;
                            this.drone12.body.velocity.y = 0;
                            this.drone7.body.velocity.x = this.game.droneSpeed;
                            this.drone7.body.velocity.y = 0;
                            this.drone2.body.velocity.x = this.game.droneSpeed;
                            this.drone2.body.velocity.y = 0;
                            break;
                        default:
                            break;
                    }
                    break;
                case 10:
                    switch (this.droneDir2) {
                        case 0:
                            this.drone7.body.velocity.x = 0;
                            this.drone7.body.velocity.y = 0;
                            this.drone2.body.velocity.x = 0;
                            this.drone2.body.velocity.y = 0;
                            break;
                        case 1:
                            this.drone7.body.velocity.x = 0;
                            this.drone7.body.velocity.y = -this.game.droneSpeed;
                            this.drone2.body.velocity.x = 0;
                            this.drone2.body.velocity.y = -this.game.droneSpeed;
                            break;
                        case 2:
                            this.drone7.body.velocity.x = 0;
                            this.drone7.body.velocity.y = this.game.droneSpeed;
                            this.drone2.body.velocity.x = 0;
                            this.drone2.body.velocity.y = this.game.droneSpeed;
                            break;
                        case 3:
                            this.drone7.body.velocity.x = -this.game.droneSpeed;
                            this.drone7.body.velocity.y = 0;
                            this.drone2.body.velocity.x = -this.game.droneSpeed;
                            this.drone2.body.velocity.y = 0;
                            break;
                        case 4:
                            this.drone7.body.velocity.x = this.game.droneSpeed;
                            this.drone7.body.velocity.y = 0;
                            this.drone2.body.velocity.x = this.game.droneSpeed;
                            this.drone2.body.velocity.y = 0;
                            break;
                        default:
                            break;
                    }
                    break;
                case 5:
                    switch (this.droneDir2) {
                        case 0:
                            this.drone2.body.velocity.x = 0;
                            this.drone2.body.velocity.y = 0;
                            break;
                        case 1:
                            this.drone2.body.velocity.x = 0;
                            this.drone2.body.velocity.y = -this.game.droneSpeed;
                            break;
                        case 2:
                            this.drone2.body.velocity.x = 0;
                            this.drone2.body.velocity.y = this.game.droneSpeed;
                            break;
                        case 3:
                            this.drone2.body.velocity.x = -this.game.droneSpeed;
                            this.drone2.body.velocity.y = 0;
                            break;
                        case 4:
                            this.drone2.body.velocity.x = this.game.droneSpeed;
                            this.drone2.body.velocity.y = 0;
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
                            this.drone13.body.velocity.x = 0;
                            this.drone13.body.velocity.y = 0;
                            this.drone8.body.velocity.x = 0;
                            this.drone8.body.velocity.y = 0;
                            this.drone3.body.velocity.x = 0;
                            this.drone3.body.velocity.y = 0;
                            break;
                        case 1:
                            this.drone13.body.velocity.x = 0;
                            this.drone13.body.velocity.y = -this.game.droneSpeed;
                            this.drone8.body.velocity.x = 0;
                            this.drone8.body.velocity.y = -this.game.droneSpeed;
                            this.drone3.body.velocity.x = 0;
                            this.drone3.body.velocity.y = -this.game.droneSpeed;
                            break;
                        case 2:
                            this.drone13.body.velocity.x = 0;
                            this.drone13.body.velocity.y = this.game.droneSpeed;
                            this.drone8.body.velocity.x = 0;
                            this.drone8.body.velocity.y = this.game.droneSpeed;
                            this.drone3.body.velocity.x = 0;
                            this.drone3.body.velocity.y = this.game.droneSpeed;
                            break;
                        case 3:
                            this.drone13.body.velocity.x = -this.game.droneSpeed;
                            this.drone13.body.velocity.y = 0;
                            this.drone8.body.velocity.x = -this.game.droneSpeed;
                            this.drone8.body.velocity.y = 0;
                            this.drone3.body.velocity.x = -this.game.droneSpeed;
                            this.drone3.body.velocity.y = 0;
                            break;
                        case 4:
                            this.drone13.body.velocity.x = this.game.droneSpeed;
                            this.drone13.body.velocity.y = 0;
                            this.drone8.body.velocity.x = this.game.droneSpeed;
                            this.drone8.body.velocity.y = 0;
                            this.drone3.body.velocity.x = this.game.droneSpeed;
                            this.drone3.body.velocity.y = 0;
                            break;
                        default:
                            break;
                    }
                    break;
                case 10:
                    switch (this.droneDir3) {
                        case 0:
                            this.drone8.body.velocity.x = 0;
                            this.drone8.body.velocity.y = 0;
                            this.drone3.body.velocity.x = 0;
                            this.drone3.body.velocity.y = 0;
                            break;
                        case 1:
                            this.drone8.body.velocity.x = 0;
                            this.drone8.body.velocity.y = -this.game.droneSpeed;
                            this.drone3.body.velocity.x = 0;
                            this.drone3.body.velocity.y = -this.game.droneSpeed;
                            break;
                        case 2:
                            this.drone8.body.velocity.x = 0;
                            this.drone8.body.velocity.y = this.game.droneSpeed;
                            this.drone3.body.velocity.x = 0;
                            this.drone3.body.velocity.y = this.game.droneSpeed;
                            break;
                        case 3:
                            this.drone8.body.velocity.x = -this.game.droneSpeed;
                            this.drone8.body.velocity.y = 0;
                            this.drone3.body.velocity.x = -this.game.droneSpeed;
                            this.drone3.body.velocity.y = 0;
                            break;
                        case 4:
                            this.drone8.body.velocity.x = this.game.droneSpeed;
                            this.drone8.body.velocity.y = 0;
                            this.drone3.body.velocity.x = this.game.droneSpeed;
                            this.drone3.body.velocity.y = 0;
                            break;
                        default:
                            break;
                    }
                    break;
                case 5:
                    switch (this.droneDir3) {
                        case 0:
                            this.drone3.body.velocity.x = 0;
                            this.drone3.body.velocity.y = 0;
                            break;
                        case 1:
                            this.drone3.body.velocity.x = 0;
                            this.drone3.body.velocity.y = -this.game.droneSpeed;
                            break;
                        case 2:
                            this.drone3.body.velocity.x = 0;
                            this.drone3.body.velocity.y = this.game.droneSpeed;
                            break;
                        case 3:
                            this.drone3.body.velocity.x = -this.game.droneSpeed;
                            this.drone3.body.velocity.y = 0;
                            break;
                        case 4:
                            this.drone3.body.velocity.x = this.game.droneSpeed;
                            this.drone3.body.velocity.y = 0;
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
                            this.drone14.body.velocity.x = 0;
                            this.drone14.body.velocity.y = 0;
                            this.drone9.body.velocity.x = 0;
                            this.drone9.body.velocity.y = 0;
                            this.drone4.body.velocity.x = 0;
                            this.drone4.body.velocity.y = 0;
                            break;
                        case 1:
                            this.drone14.body.velocity.x = 0;
                            this.drone14.body.velocity.y = -this.game.droneSpeed;
                            this.drone9.body.velocity.x = 0;
                            this.drone9.body.velocity.y = -this.game.droneSpeed;
                            this.drone4.body.velocity.x = 0;
                            this.drone4.body.velocity.y = -this.game.droneSpeed;
                            break;
                        case 2:
                            this.drone14.body.velocity.x = 0;
                            this.drone14.body.velocity.y = this.game.droneSpeed;
                            this.drone9.body.velocity.x = 0;
                            this.drone9.body.velocity.y = this.game.droneSpeed;
                            this.drone4.body.velocity.x = 0;
                            this.drone4.body.velocity.y = this.game.droneSpeed;
                            break;
                        case 3:
                            this.drone14.body.velocity.x = -this.game.droneSpeed;
                            this.drone14.body.velocity.y = 0;
                            this.drone9.body.velocity.x = -this.game.droneSpeed;
                            this.drone9.body.velocity.y = 0;
                            this.drone4.body.velocity.x = -this.game.droneSpeed;
                            this.drone4.body.velocity.y = 0;
                            break;
                        case 4:
                            this.drone14.body.velocity.x = this.game.droneSpeed;
                            this.drone14.body.velocity.y = 0;
                            this.drone9.body.velocity.x = this.game.droneSpeed;
                            this.drone9.body.velocity.y = 0;
                            this.drone4.body.velocity.x = this.game.droneSpeed;
                            this.drone4.body.velocity.y = 0;
                            break;
                        default:
                            break;
                    }
                    break;
                case 10:
                    switch (this.droneDir4) {
                        case 0:
                            this.drone9.body.velocity.x = 0;
                            this.drone9.body.velocity.y = 0;
                            this.drone4.body.velocity.x = 0;
                            this.drone4.body.velocity.y = 0;
                            break;
                        case 1:
                            this.drone9.body.velocity.x = 0;
                            this.drone9.body.velocity.y = -this.game.droneSpeed;
                            this.drone4.body.velocity.x = 0;
                            this.drone4.body.velocity.y = -this.game.droneSpeed;
                            break;
                        case 2:
                            this.drone9.body.velocity.x = 0;
                            this.drone9.body.velocity.y = this.game.droneSpeed;
                            this.drone4.body.velocity.x = 0;
                            this.drone4.body.velocity.y = this.game.droneSpeed;
                            break;
                        case 3:
                            this.drone9.body.velocity.x = -this.game.droneSpeed;
                            this.drone9.body.velocity.y = 0;
                            this.drone4.body.velocity.x = -this.game.droneSpeed;
                            this.drone4.body.velocity.y = 0;
                            break;
                        case 4:
                            this.drone9.body.velocity.x = this.game.droneSpeed;
                            this.drone9.body.velocity.y = 0;
                            this.drone4.body.velocity.x = this.game.droneSpeed;
                            this.drone4.body.velocity.y = 0;
                            break;
                        default:
                            break;
                    }
                    break;
                case 5:
                    switch (this.droneDir4) {
                        case 0:
                            this.drone4.body.velocity.x = 0;
                            this.drone4.body.velocity.y = 0;
                            break;
                        case 1:
                            this.drone4.body.velocity.x = 0;
                            this.drone4.body.velocity.y = -this.game.droneSpeed;
                            break;
                        case 2:
                            this.drone4.body.velocity.x = 0;
                            this.drone4.body.velocity.y = this.game.droneSpeed;
                            break;
                        case 3:
                            this.drone4.body.velocity.x = -this.game.droneSpeed;
                            this.drone4.body.velocity.y = 0;
                            break;
                        case 4:
                            this.drone4.body.velocity.x = this.game.droneSpeed;
                            this.drone4.body.velocity.y = 0;
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
                            this.drone15.body.velocity.x = 0;
                            this.drone15.body.velocity.y = 0;
                            this.drone10.body.velocity.x = 0;
                            this.drone10.body.velocity.y = 0;
                            this.drone5.body.velocity.x = 0;
                            this.drone5.body.velocity.y = 0;
                            break;
                        case 1:
                            this.drone15.body.velocity.x = 0;
                            this.drone15.body.velocity.y = -this.game.droneSpeed;
                            this.drone10.body.velocity.x = 0;
                            this.drone10.body.velocity.y = -this.game.droneSpeed;
                            this.drone5.body.velocity.x = 0;
                            this.drone5.body.velocity.y = -this.game.droneSpeed;
                            break;
                        case 2:
                            this.drone15.body.velocity.x = 0;
                            this.drone15.body.velocity.y = this.game.droneSpeed;
                            this.drone10.body.velocity.x = 0;
                            this.drone10.body.velocity.y = this.game.droneSpeed;
                            this.drone5.body.velocity.x = 0;
                            this.drone5.body.velocity.y = this.game.droneSpeed;
                            break;
                        case 3:
                            this.drone15.body.velocity.x = -this.game.droneSpeed;
                            this.drone15.body.velocity.y = 0;
                            this.drone10.body.velocity.x = -this.game.droneSpeed;
                            this.drone10.body.velocity.y = 0;
                            this.drone5.body.velocity.x = -this.game.droneSpeed;
                            this.drone5.body.velocity.y = 0;
                            break;
                        case 4:
                            this.drone15.body.velocity.x = this.game.droneSpeed;
                            this.drone15.body.velocity.y = 0;
                            this.drone10.body.velocity.x = this.game.droneSpeed;
                            this.drone10.body.velocity.y = 0;
                            this.drone5.body.velocity.x = this.game.droneSpeed;
                            this.drone5.body.velocity.y = 0;
                            break;
                        default:
                            break;
                    }
                    break;
                case 10:
                    switch (this.droneDir5) {
                        case 0:
                            this.drone10.body.velocity.x = 0;
                            this.drone10.body.velocity.y = 0;
                            this.drone5.body.velocity.x = 0;
                            this.drone5.body.velocity.y = 0;
                            break;
                        case 1:
                            this.drone10.body.velocity.x = 0;
                            this.drone10.body.velocity.y = -this.game.droneSpeed;
                            this.drone5.body.velocity.x = 0;
                            this.drone5.body.velocity.y = -this.game.droneSpeed;
                            break;
                        case 2:
                            this.drone10.body.velocity.x = 0;
                            this.drone10.body.velocity.y = this.game.droneSpeed;
                            this.drone5.body.velocity.x = 0;
                            this.drone5.body.velocity.y = this.game.droneSpeed;
                            break;
                        case 3:
                            this.drone10.body.velocity.x = -this.game.droneSpeed;
                            this.drone10.body.velocity.y = 0;
                            this.drone5.body.velocity.x = -this.game.droneSpeed;
                            this.drone5.body.velocity.y = 0;
                            break;
                        case 4:
                            this.drone10.body.velocity.x = this.game.droneSpeed;
                            this.drone10.body.velocity.y = 0;
                            this.drone5.body.velocity.x = this.game.droneSpeed;
                            this.drone5.body.velocity.y = 0;
                            break;
                        default:
                            break;
                    }
                    break;
                case 5:
                    switch (this.droneDir5) {    
                        case 0:
                            this.drone5.body.velocity.x = 0;
                            this.drone5.body.velocity.y = 0;
                            break;
                        case 1:
                            this.drone5.body.velocity.x = 0;
                            this.drone5.body.velocity.y = -this.game.droneSpeed;
                            break;
                        case 2:
                            this.drone5.body.velocity.x = 0;
                            this.drone5.body.velocity.y = this.game.droneSpeed;
                            break;
                        case 3:
                            this.drone5.body.velocity.x = -this.game.droneSpeed;
                            this.drone5.body.velocity.y = 0;
                            break;
                        case 4:
                            this.drone5.body.velocity.x = this.game.droneSpeed;
                            this.drone5.body.velocity.y = 0;
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
    
    timerInitialization: function() {
        /* LIST OF TIMERS */
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
            
        this.dronePatrol1.start();
        this.dronePatrol2.start();
        this.dronePatrol3.start();
        this.dronePatrol4.start();
        this.dronePatrol5.start();
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
                this.drone11.frame = 0;
                this.drone12.frame = 0;
                this.drone13.frame = 0;
                this.drone14.frame = 0;
                this.drone15.frame = 0;
            case 10:
                this.drone6.frame = 0;
                this.drone7.frame = 0;
                this.drone8.frame = 0;
                this.drone9.frame = 0;
                this.drone10.frame = 0;
            case 5:
                this.drone1.frame = 0;
                this.drone2.frame = 0;
                this.drone3.frame = 0;
                this.drone4.frame = 0;
                this.drone5.frame = 0;
                break;
            default:
                break;
        }
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