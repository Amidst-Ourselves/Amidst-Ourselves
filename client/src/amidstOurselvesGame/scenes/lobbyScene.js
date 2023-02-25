import playerpng from "../assets/player.png";
import shippng from "../assets/ship.png";
import skeldpng from "../assets/skeld.png";
import Phaser from 'phaser';
import { SPRITE_WIDTH, SPRITE_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT } from "../constants"
import gameScene from "./gameScene";


let webRTC_flag = false;
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
        if (!webRTC_flag) {
            this.webRTC.init(roomObj, this.socket);
            this.webRTC.create();
            this.webRTC.update();
            webRTC_flag = true;
        }
    }

    preload() {
        this.load.image('ship', shippng);
        this.load.image('skeld', skeldpng);
        this.load.spritesheet('player', playerpng,
            {frameWidth: SPRITE_WIDTH, frameHeight: SPRITE_HEIGHT}
        );
    }
    
    create() {
        this.add.image(50, 300, 'ship');
        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.createSpritesFromTempPlayers();
        // this.webRTC.update();
        // this.webRTC.update(this.players);
    
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

        this.add.text(100, 350, 'lobby', { font: '32px Arial', fill: '#FFFFFF' });
        this.add.text(100, 400, this.roomCode, { font: '32px Arial', fill: '#FFFFFF' });
        this.createStartButtonForHost();
    }
    
    update() {
        if (this.players[this.socket.id]) {
            this.cameras.main.centerOn(this.players[this.socket.id].x, this.players[this.socket.id].y);
            if (this.movePlayer()) {
                this.socket.emit('move', {
                    x: this.players[this.socket.id].x,
                    y: this.players[this.socket.id].y
                });
                this.webRTC.move({
                    id: this.socket.id,
                    x: this.players[this.socket.id].x,
                    y: this.players[this.socket.id].y
                });
            }
        }
    }

    createSpritesFromTempPlayers() {
        for (let playerId in this.tempPlayers) {
            this.createSprite(this.tempPlayers[playerId]);
        }
        delete this.tempPlayers;
    }
    
    createSprite(playerObj) {
        console.log(playerObj.playerState);
        this.players[playerObj.id] = this.add.sprite(playerObj.x, playerObj.y, 'player');
        this.players[playerObj.id].displayHeight = PLAYER_HEIGHT;
        this.players[playerObj.id].displayWidth = PLAYER_WIDTH;
        this.webRTC.move(playerObj);
    }
    
    destroySprite(playerId) {
        this.players[playerId].destroy();
        delete this.players[playerId];
    }
    
    movePlayer() {
        let moved = false;
        if (this.keyUp.isDown) {
            this.players[this.socket.id].y -= this.speed;
            moved = true;
        }
        if (this.keyDown.isDown) {
            this.players[this.socket.id].y += this.speed;
            moved = true;
        }
        if (this.keyLeft.isDown) {
            this.players[this.socket.id].x -= this.speed;
            moved = true;
        }
        if (this.keyRight.isDown) {
            this.players[this.socket.id].x += this.speed;
            moved = true;
        }
        return moved;
    }

    createStartButtonForHost() {
        if (this.socket.id !== this.host) {
            return;
        }

        this.startText = this.add.text(100, 450, 'start', { font: '32px Arial', fill: '#FFFFFF' });
        this.startText.setInteractive();
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