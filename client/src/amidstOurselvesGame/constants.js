import Phaser from 'phaser';
import titleScene from './scenes/titleScene';
import loadGameScene from './scenes/loadGameScene';
import gameScene from './scenes/gameScene';

export const SPRITE_WIDTH = 84;
export const SPRITE_HEIGHT = 128;
export const PLAYER_WIDTH = 34;
export const PLAYER_HEIGHT = 46;
export const SERVER_ADDRESS = 'http://localhost:3000';

export const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    scene: [titleScene, loadGameScene, gameScene]
};
