import playerpng from "../assets/player.png";
import shippng from "../assets/ship.png";
import skeldpng from "../assets/skeld.png";
import audioIconpng from "../assets/audioIcon.png";
import mute_button from "../assets/button_sprite_sheet.png";
import Phaser from 'phaser';
import io from 'socket.io-client';
import { SPRITE_WIDTH, SPRITE_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT, SERVER_ADDRESS } from "../constants"
import webRTCClientManager from "../webRTCClientManager"
export default class gameScene extends Phaser.Scene {
    constructor() {
        super("gameScene")
    }

    init(roomObj) {
        this.socket = io(SERVER_ADDRESS);
        this.players = {};
        this.audioIcons = {};
        this.speed = roomObj.speed;
        this.roomCode = roomObj.roomCode;
        // Calling webRTC manager here
        this.webRTC = new webRTCClientManager();
        this.webRTC.init(roomObj, this.socket);
        this.webRTC.create();
        this.mute_button = null;
        this.mute_flag = true;
    }

    preload() {
        this.load.image('ship', shippng);
        this.load.image('skeld', skeldpng);
        this.load.spritesheet('player', playerpng,
            {frameWidth: SPRITE_WIDTH, frameHeight: SPRITE_HEIGHT}
        );
        console.log("I'm loading sprite")
        this.load.spritesheet('audioIcon', audioIconpng,
            {frameWidth: 500, frameHeight: 500}
        );
        this.load.spritesheet('mute_button_on', mute_button, {frameWidth: 193, frameHeight:71});
        this.load.spritesheet('mute_button_off', mute_button, {frameWidth: 386, frameHeight:71});
        console.log("I'm loading sprite")
    }
    
    create() {
        this.add.image(50, 300, 'ship');
        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        this.mute_button = this.add.text(100, 100, 'Mute')
        .setOrigin(0.5)
        .setPadding(10)
        .setStyle({ backgroundColor: '#111' })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', (event) => {
            this.mute_flag = this.webRTC.mute(this.mute_flag);
            if (!this.mute_flag) {
                this.mute_button.setText("Unmute");
            }
            else {
                this.mute_button.setText("Mute");
            }
        })
        .on('pointerover', () => this.mute_button.setStyle({ fill: '#f39c12' }))
        .on('pointerout', () => this.mute_button.setStyle({ fill: '#FFF' }))
    
        this.socket.emit('roomJoin', {roomCode: this.roomCode});

        this.socket.on('roomJoinResponse', (roomObj) => {
            for (let playerId in roomObj.players) {
                this.createSprite(playerId, roomObj.players[playerId].x, roomObj.players[playerId].y);
                this.createAudioSprite(playerId, roomObj.players[playerId].x, roomObj.players[playerId].y);
            }
        });
    
        this.socket.on('move', (playerObj) => {
            this.players[playerObj.id].x = playerObj.x;
            this.players[playerObj.id].y = playerObj.y;

            this.audioIcons[playerObj.id].x = playerObj.x;
            this.audioIcons[playerObj.id].y = playerObj.y - PLAYER_HEIGHT/2;
        });

        this.socket.on('webRTC_speaking', (config) => {
            // console.log("received" + config.bool);
            if(config.bool == true) {
                this.audioIcons[config.id].visible = true;
            }
            else {
                this.audioIcons[config.id].visible = false;
            }
        });
    

        this.socket.on('join', (playerObj) => {
            this.createSprite(playerObj.id, playerObj.x, playerObj.y)
            this.createAudioSprite(playerObj.id, playerObj.x, playerObj.y)
            console.log('player joined ' + playerObj.id);
        });
        
        this.socket.on('leave', (playerObj) => {
            this.destroySprite(playerObj.id);
            this.destroyAudioSprite(playerObj.id)
            console.log('player left ' + playerObj.id);
        });
    }
    
    update() {
        if (this.players[this.socket.id]) {
            this.cameras.main.centerOn(this.players[this.socket.id].x, this.players[this.socket.id].y);
            if (this.movePlayer()) {
                this.socket.emit('move', {
                    x: this.players[this.socket.id].x,
                    y: this.players[this.socket.id].y
                });
            }
        }
        this.webRTC.update(this.players);

    }
    
    createSprite(playerId, x, y) {
        this.players[playerId] = this.add.sprite(x, y, 'player');
        this.players[playerId].displayHeight = PLAYER_HEIGHT;
        this.players[playerId].displayWidth = PLAYER_WIDTH;
    }

    createAudioSprite(playerId, x, y) {

        this.audioIcons[playerId] = this.add.sprite(x , y - PLAYER_WIDTH, 'audioIcon')
        this.audioIcons[playerId].displayHeight = PLAYER_HEIGHT/2;
        this.audioIcons[playerId].displayWidth = PLAYER_WIDTH/2;
        this.audioIcons[playerId].visible = false;
    }
    
    destroySprite(playerId) {
        this.players[playerId].destroy();
        delete this.players[playerId];
    }

    destroyAudioSprite(playerId) {
        this.audioIcons[playerId].destroy();
        delete this.audioIcons[playerId];
    }
    
    movePlayer() {
        let moved = false;
        if (this.keyUp.isDown) {
            this.players[this.socket.id].y -= this.speed;
            this.mute_button.y -= this.speed;
            moved = true;
        }
        if (this.keyDown.isDown) {
            this.players[this.socket.id].y += this.speed;
            this.mute_button.y += this.speed;
            moved = true;
        }
        if (this.keyLeft.isDown) {
            this.players[this.socket.id].x -= this.speed;
            this.mute_button.x -= this.speed;
            moved = true;
        }
        if (this.keyRight.isDown) {
            this.players[this.socket.id].x += this.speed;
            this.mute_button.x += this.speed;
            moved = true;
        }
        this.audioIcons[this.socket.id].x = this.players[this.socket.id].x
        this.audioIcons[this.socket.id].y = this.players[this.socket.id].y - PLAYER_HEIGHT/2;
        return moved;
    }
}