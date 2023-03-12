import Phaser from 'phaser';
import { SPRITE_WIDTH, SPRITE_HEIGHT, MAP_SCALE, MAP1_SPAWN_X, MAP1_SPAWN_Y, PLAYER_HEIGHT, PLAYER_WIDTH } from "../constants"
import gameScene from "./gameScene";
import { movePlayer } from '../utils/gameplay';


export default class lobbyScene extends Phaser.Scene {
    constructor() {
        super("lobbyScene")
    }

    init(roomObj) {
        this.socket = this.registry.get('socket');
        this.roomCode = roomObj.roomCode;
        this.host = roomObj.host;
        this.tempPlayers = roomObj.players;
        this.speed = roomObj.playerSpeed;
        this.players = {};
        this.webRTC = this.registry.get('webRTC');
    }

    preload() {
        this.load.image('map1', 'amidstOurselvesAssets/map1.png');
        this.load.spritesheet('player', 'amidstOurselvesAssets/player.png', {frameWidth: SPRITE_WIDTH, frameHeight: SPRITE_HEIGHT});
    }
    
    create() {
        this.add.image(0, 0, 'map1').setOrigin(0, 0).setScale(MAP_SCALE);
        this.cameras.main.centerOn(MAP1_SPAWN_X, MAP1_SPAWN_Y);

        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.createSpritesFromTempPlayers();
    
        this.socket.on('move', (playerObj) => {
            this.players[playerObj.id].x = playerObj.x;
            this.players[playerObj.id].y = playerObj.y;
            this.webRTC.move(playerObj);
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
            this.scene.add("gameScene", gameScene, true, roomObj);
            this.scene.remove("lobbyScene");
        });

        this.add.text(100, 350, 'lobby', { font: '32px Arial', fill: '#FFFFFF' }).setScrollFactor(0);
        this.add.text(100, 400, this.roomCode, { font: '32px Arial', fill: '#FFFFFF' }).setScrollFactor(0);
        this.createStartButtonForHost();
    }
    
    update() {
        let positionObj = movePlayer(
            this.speed,
            this.players[this.socket.id].x,
            this.players[this.socket.id].y,
            this.keyUp.isDown,
            this.keyDown.isDown,
            this.keyLeft.isDown,
            this.keyRight.isDown
        );
        if (positionObj) this.updatePlayerPosition(positionObj.x, positionObj.y);
    }

    updatePlayerPosition(newX, newY) {
        this.cameras.main.centerOn(newX, newY);
        this.players[this.socket.id].x = newX;
        this.players[this.socket.id].y = newY;
        this.socket.emit('move', {x: newX, y: newY});
        this.webRTC.move({id: this.socket.id, x: newX, y: newY});
    }

    createSpritesFromTempPlayers() {
        for (let playerId in this.tempPlayers) {
            this.createSprite(this.tempPlayers[playerId]);
        }
        delete this.tempPlayers;
    }
    
    createSprite(playerObj) {
        console.log(playerObj.playerState);
        this.players[playerObj.id] = this.add.sprite(playerObj.x, playerObj.y, 'player').setOrigin(0.5,1);
        this.players[playerObj.id].displayHeight = PLAYER_HEIGHT;
        this.players[playerObj.id].displayWidth = PLAYER_WIDTH;
        this.webRTC.move(playerObj);
    }
    
    destroySprite(playerId) {
        this.players[playerId].destroy();
        delete this.players[playerId];
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
        this.socket.off('move');
        this.socket.off('join');
        this.socket.off('leave');
        this.socket.off('teleportToGame');
    }
}