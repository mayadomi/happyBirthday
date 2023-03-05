
var StartScene = new Phaser.Class({

    Extends: Phaser.Scene,
    initialize: function()
    {
        Phaser.Scene.call(this, {"key" : "StartScene"});
    },

    init: function (){},

    preload: function ()
    {
        this.load.image('intro', 'assets/intro.png');
    },

    create: function ()
    {
        cursors = this.input.keyboard.createCursorKeys();
        this.add.image(400, 300, 'intro'); //  Suave.
    },

update: function (){

     if (cursors.space.isDown)
        {
            this.scene.start("MainGameScene"); // Game oN!
        }

}
});
