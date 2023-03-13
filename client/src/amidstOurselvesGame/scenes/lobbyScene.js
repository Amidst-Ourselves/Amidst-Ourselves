import audioIconpng from "../assets/audioIcon.png";
import Phaser from 'phaser';
import {
    MAP_SCALE,
    MAP1_SPAWN_X,
    MAP1_SPAWN_Y,
    SPRITE_CONFIG,
    LOBBY_COLOUR_X,
    LOBBY_COLOUR_Y,
    LOBBY_COLOUR_MIN_DISTANCE,
    FRAMES_PER_COLOUR
} from "../constants"
import GameScene from "./gameScene";
import AbstractGameplayScene from './abstractGameplayScene';


export default class LobbyScene extends AbstractGameplayScene {
    constructor() {
        super("lobbyScene")
    }

    init(roomObj) {
        this.socket = this.registry.get('socket');
        this.webRTC = this.registry.get('webRTC');
        this.roomCode = roomObj.roomCode;
        this.host = roomObj.host;
        this.tempPlayers = roomObj.players;
        this.speed = roomObj.playerSpeed;
    }

    preload() {
        this.load.image('map1', 'amidstOurselvesAssets/map1.png');
        this.load.spritesheet('player', 'amidstOurselvesAssets/player.png', SPRITE_CONFIG);
        this.load.spritesheet('audioIcon', audioIconpng, {frameWidth: 500, frameHeight: 500});
    }
    
    create() {
        this.add.image(0, 0, 'map1').setOrigin(0, 0).setScale(MAP_SCALE);
        this.cameras.main.centerOn(MAP1_SPAWN_X, MAP1_SPAWN_Y);

        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.createSpritesFromTempPlayers();

        this.keyF.on('down', () => {
            if (!this.isWithinManhattanDist(
                this.players[this.socket.id].x,
                this.players[this.socket.id].y,
                LOBBY_COLOUR_X,
                LOBBY_COLOUR_Y,
                LOBBY_COLOUR_MIN_DISTANCE
            )) return;
            this.socket.emit('colour');
        });

        this.socket.on('colour', (playerObj) => {
            this.updatePlayerColour(playerObj.colour, playerObj.id);
        });
    
        this.socket.on('move', (playerObj) => {
            this.updatePlayerPosition(playerObj.x, playerObj.y, playerObj.id);
        });
    
        this.socket.on('join', (playerObj) => {
            this.createSprite(playerObj);
            console.log('player joined ' + playerObj.id);
        });
        
        this.socket.on('leave', (playerObj) => {
            this.destroySprite(playerObj.id);
            console.log('player left ' + playerObj.id);
        });

        this.socket.on('teleportToGame', (roomObj) => {
            this.cleanupSocketio();
            this.scene.add("gameScene", GameScene, true, roomObj);
            this.scene.remove("lobbyScene");
        });

        this.socket.on('webRTC_speaking', (config) => {
            this.audioIcons[config.id].visible = config.bool;
        });

        this.add.text(100, 350, 'lobby', { font: '32px Arial', fill: '#FFFFFF' }).setScrollFactor(0);
        this.add.text(100, 400, this.roomCode, { font: '32px Arial', fill: '#FFFFFF' }).setScrollFactor(0);
        this.createStartButtonForHost();
        this.createMuteButton();
    }
    
    update() {
        this.movePlayer(
            this.speed,
            this.players[this.socket.id].x,
            this.players[this.socket.id].y,
            this.keyUp.isDown,
            this.keyDown.isDown,
            this.keyLeft.isDown,
            this.keyRight.isDown
        );
    }

    updatePlayerColour(newColour, playerId) {
        this.players[playerId].setFrame(newColour * FRAMES_PER_COLOUR);
    }

    createStartButtonForHost() {
        if (this.socket.id !== this.host) {
            return;
        }

        this.startText = this.add.text(100, 450, 'start', { font: '32px Arial', fill: '#FFFFFF' });
        this.startText.setInteractive().setScrollFactor(0);
        this.startText.on('pointerover', () => {
            this.startText.setTint(0x00FF00);
        });
        this.startText.on('pointerout', () => {
            this.startText.setTint(0xFFFFFF);
        });
        this.startText.on('pointerdown', () => {
            this.socket.emit('startGame');
        });
    }

    cleanupSocketio() {
        this.socket.off('colour');
        this.socket.off('move');
        this.socket.off('join');
        this.socket.off('leave');
        this.socket.off('teleportToGame');
        this.socket.off('webRTC_speaking');
    }
}