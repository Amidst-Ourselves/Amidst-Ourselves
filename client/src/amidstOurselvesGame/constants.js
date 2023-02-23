import Phaser from 'phaser';
import titleScene from './scenes/titleScene';
import loadGameScene from './scenes/loadGameScene';
import gameScene from './scenes/gameScene';
import gameSettingsScene from './scenes/gameSettingsScene';
import lobbyScene from './scenes/lobbyScene';

export const SPRITE_WIDTH = 84;
export const SPRITE_HEIGHT = 128;
export const PLAYER_WIDTH = 34;
export const PLAYER_HEIGHT = 46;
export const HEIGHT = 600;
export const WIDTH = 800;
export const SERVER_ADDRESS = 'http://localhost:3000';

export const GAME_STATE = {
    lobby: "lobby",
    action: "action"
};
export const PLAYER_STATE = {
    crewmate: "crewmate",
    imposter: "imposter",
    ghost: "ghost"
};

export const config = {
    type: Phaser.AUTO,
    width: WIDTH,
    height: HEIGHT,
    scene: [titleScene, loadGameScene, gameSettingsScene, lobbyScene, gameScene]
};