import audioIconpng from "../assets/audioIcon.png";
import Phaser from 'phaser';
import { SPRITE_WIDTH, SPRITE_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT, MAP_SCALE, MAP1_SPAWN_X, MAP1_SPAWN_Y } from "../constants"
import lobbyScene from "./lobbyScene";
import { movePlayer } from '../utils/gameplay';


export default class gameScene extends Phaser.Scene {
    constructor() {
        super("gameScene")
    }

    init(roomObj) {
        this.socket = this.registry.get('socket');
        this.roomCode = roomObj.roomCode;
        this.host = roomObj.host;
        this.tempPlayers = roomObj.players;
        this.speed = roomObj.playerSpeed;
        this.players = {};
        this.audioIcons = {};
        this.webRTC = this.registry.get('webRTC');
    }

    preload() {
        this.load.image('map1', 'amidstOurselvesAssets/map1.png');
        this.load.spritesheet('player', 'amidstOurselvesAssets/player.png', {frameWidth: SPRITE_WIDTH, frameHeight: SPRITE_HEIGHT});
        this.load.spritesheet('audioIcon', audioIconpng,
            {frameWidth: 500, frameHeight: 500}
        );
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
            this.audioIcons[playerObj.id].x = playerObj.x;
            this.audioIcons[playerObj.id].y = playerObj.y - PLAYER_HEIGHT/2;
            this.webRTC.move(playerObj);
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
            this.createSprite(playerObj);
            this.createAudioSprite(playerObj.id, playerObj.x, playerObj.y)
            console.log('player joined ' + playerObj.id);
        });
        
        this.socket.on('leave', (playerObj) => {
            this.destroySprite(playerObj.id);
            this.destroyAudioSprite(playerObj.id)
            console.log('player left ' + playerObj.id);
        });

        this.socket.on('teleportToLobby', (roomObj) => {
            this.cleanupSocketio();
            this.scene.add("lobbyScene", lobbyScene, true, roomObj);
            this.scene.remove("gameScene");
        });

        this.add.text(100, 350, 'game', { font: '32px Arial', fill: '#FFFFFF' }).setScrollFactor(0);
        this.add.text(100, 400, this.roomCode, { font: '32px Arial', fill: '#FFFFFF' }).setScrollFactor(0);
        this.createEndButtonForHost();
        this.createMuteButton();
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
            this.createAudioSprite(this.tempPlayers[playerId].id, this.tempPlayers[playerId].x, this.tempPlayers[playerId].y)
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

    createEndButtonForHost() {
        if (this.socket.id !== this.host) {
            return;
        }
        this.startText = this.add.text(100, 450, 'end', { font: '32px Arial', fill: '#FFFFFF' });
        this.startText.setInteractive().setScrollFactor(0);
        this.startText.on('pointerover', () => {
            this.startText.setTint(0x00FF00);
        });
        this.startText.on('pointerout', () => {
            this.startText.setTint(0xFFFFFF);
        });
        this.startText.on('pointerdown', () => {
            this.socket.emit('endGame');
        });
    }

    createMuteButton() {
        this.mute_button = this.add.text(100, 100, 'Mute')
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setPadding(10)
        .setStyle({ backgroundColor: '#111' })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', (event) => {
            let mute_flag = this.webRTC.mute();
            if (!mute_flag) {
                this.mute_button.setText("Unmute");
            }
            else {
                this.mute_button.setText("Mute");
            }
        })
        .on('pointerover', () => this.mute_button.setStyle({ fill: '#f39c12' }))
        .on('pointerout', () => this.mute_button.setStyle({ fill: '#FFF' }));
    }

    cleanupSocketio() {
        this.socket.off('move');
        this.socket.off('webRTC_speaking')
        this.socket.off('join');
        this.socket.off('leave');
        this.socket.off('teleportToLobby');
    }
}