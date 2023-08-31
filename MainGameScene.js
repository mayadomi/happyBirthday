
var player;
var candles;
var fires;
var platforms;
var cursors;
var score = 0;
var scoreText;
var birthday;
var emitter;
var particles;
var candleOverlap;
var collectcandle;
var hitfire;


var MainGameScene = Phaser.Class ({
    Extends: Phaser.Scene,
    initialize: function() {
        Phaser.Scene.call(this, {"key": "MainGameScene"});
    },
    
    init: function () {},
    
    preload: function ()
    {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('candle', 'assets/candle.png');
        this.load.image('fire', 'assets/fire.png');
        this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 63, frameHeight: 96 });
        this.load.image('red', 'assets/red.png');
        this.load.image('birthday', 'assets/birthday.png');
    },
    
    create: function ()
    {
        //  Top left is 0,0... because why not.
        //  Add sky (we need sky)
        this.add.image(400, 300, 'sky');
        
        //  Add a group to contain ground ledges... they need some containing.
        platforms = this.physics.add.staticGroup();
        
        //  Create the ground. Be godlike.
        //  It needs to fit tho.... so make it the width of Rlandia.
        platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        
        //  Create some sweeeeet ledges.
        platforms.create(600, 400, 'ground');
        platforms.create(-30, 150, 'ground');
        platforms.create(750, 220, 'ground');
        platforms.create(30, 300, 'ground');
        
        //  What's Rlandia without a R? Add the little dude.
        player = this.physics.add.sprite(100, 400, 'dude');
        
        //  Give the little dude a slight bounce, you know, being his birthday and all.
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);
        
        //  Make him able to, you know, move. Boring otherwise.
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });
        
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        
        //  Where are the keeeeeys?
        cursors = this.input.keyboard.createCursorKeys();
        
        //  Finally, the birthday candles! Nice and evenly spaced at 70 pixels apart. Artwerk.
        candles = this.physics.add.group({
            key: 'candle',
            repeat: 9,
            setXY: { x: 12, y: 0, stepX: 70 },
            setRotation: { value: 45, step: 30}
        });
        
        candles.children.iterate(function (child) {
            //  Give each candle a slightly different bounce - make them funlike.
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
            child.allowGravity=false;
        });
        
        fires = this.physics.add.group();
        
        //  The candle score - not the musical variety, sadly.
        scoreText = this.add.text(16, 16, 'Candles collected: 0', { fontSize: '32px', fill: '#000' });
        
        //  Time to collide all the things !
        this.physics.add.collider(player, platforms);
        this.physics.add.collider(candles, platforms);
        this.physics.add.collider(fires, platforms);
        
        //  Check to see if the R dude bumps any candles, if he does, stash them in the collectcandle function.
        candleOverlap = this.physics.add.overlap(player, candles, this.collectcandle, null, this);

        //  But if R dude bumps into FIRE! It ouchies.
        fireCollider = this.physics.add.collider(player, fires, this.hitfire, null, this);
        
        //  Prepare the particles!
        particles = this.add.particles('red');
        particles.visible = false;
        //  Particles need to be emitted from somewhere.
        emitter = particles.createEmitter({
            speed: 100,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD'
        });
        emitter.visible = false;
        //  Shhhhh, it's the cake
        birthday = this.physics.add.image(400, 100, 'birthday');
        birthday.disableBody(true, true)
        birthday.visible = false;
    },
    
    //  Spies
    update: function ()
    {
        if (cursors.left.isDown)
        {
            player.setVelocityX(-160);
            player.anims.play('left', true);
        }
        else if (cursors.right.isDown)
        {
            player.setVelocityX(160);
            player.anims.play('right', true);
        }
        else
        {
            player.setVelocityX(0);
            player.anims.play('turn');
        }
        
        if (cursors.up.isDown && player.body.touching.down)
        {
            player.setVelocityY(-330);
        }
    },
    
    //  Yay R is doing the things!
    collectcandle: function (player, candle)
    {
        //  Turn off candle now that it's caught
        candle.disableBody(true, true);
        
        //  Add and update the score, because duh.
        score += 1;
        scoreText.setText('Candles collected ' + score);
        
        if ( score >= 0 && score < 38 ) {
            if (candles.countActive(true) === 0) 
            {
                //  But wait! Moarrr candles! Coz we not the youth.
                candles.children.iterate(function (child) {
                    child.enableBody(true, child.x, 0, true, true);
                });
                var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
                
                //  Throw in some fire to spice it up - R doesn't like being burnt by fire
                if  (fires.countActive(true) < 2){
                    var fire = fires.create(x, 2, 'fire');
                    fire.setBounce(1);
                    fire.setCollideWorldBounds(true);
                    fire.setVelocity(Phaser.Math.Between(-200, 200), 30);
                    fire.allowGravity = false;
                }
            }
        }
        else if (score = 38)   // Most mature (ಠ_ృ)
        //  Cake time oh yeah~!
        {
            this.gameWon();
            this.physics.world.removeCollider(candleOverlap);
            this.physics.world.removeCollider(fireCollider);
            fires.setVisible(false);
            candles.setVisible(false);
        }
        
    },
    
    gameWon: function ()
    {
        //  Eat da cake, forget the diabetus.
        scoreText.setText('Happy Birthday R!');
        birthday.enableBody(true,true)
        birthday.visible = true;
        birthday.setVelocity(100, 200);
        birthday.setBounce(1, 1);
        birthday.setCollideWorldBounds(true);
        emitter.startFollow(birthday);
        particles.visible = true;
        emitter.visible = true;
    },
    
    hitfire: function ()
    {
        //  Burnt R is.... burnt. Ouchies.
        score -=3; // harsh, but necessary.
        scoreText.setText('Candles collected: ' + score);
        
        if (score < 0) {
            //  Ruhoh.... Got too much burny :'(
            scoreText.setText('oH No! yOu CaNt CeLeBrAtE wItHoUt CANDLES (✖╭╮✖)');
            scoreText.setFontSize('24px');
            scoreText.setColor('red');
            player.setTint(0xff0000);
            player.anims.play('turn');
            this.physics.pause();
        }
    }
});
