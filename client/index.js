const SPRITE_WIDTH = 84;
const SPRITE_HEIGHT = 128;
const PLAYER_WIDTH = 34;
const PLAYER_HEIGHT = 46;
const SERVER_ADDRESS = 'http://localhost:3000';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    scene: [titleScene, loadGameScene, gameScene]
};

const game = new Phaser.Game(config);
