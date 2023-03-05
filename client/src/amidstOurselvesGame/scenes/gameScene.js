import playerpng from "../assets/player.png";
import shippng from "../assets/ship.png";
import skeldpng from "../assets/skeld.png";
import audioIconpng from "../assets/audioIcon.png";
import minimapPlayer from "../assets/minimapPlayer.png";
import deadpng from "../assets/dead.png";
import Phaser from 'phaser';
import { SPRITE_WIDTH, SPRITE_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT } from "../constants"
import lobbyScene from "./lobbyScene";
import imposter from "../imposter"


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
        this.deadBodies = {};
        this.audioIcons = {};
        this.webRTC = this.registry.get('webRTC');
        this.imposter = new imposter();
        // this.imposter.init();
        this.imposter.init(this.socket);
        this.lastActionTime = 0;
    }

    preload() {
        this.load.image('ship', shippng);
        this.load.image('skeld', skeldpng);
        this.load.spritesheet('player', playerpng,
            {frameWidth: SPRITE_WIDTH, frameHeight: SPRITE_HEIGHT}
        );
        this.load.spritesheet('audioIcon', audioIconpng,
            {frameWidth: 500, frameHeight: 500}
        );
        this.load.spritesheet('minimapPlayer', minimapPlayer,
            {frameWidth: 500, frameHeight: 500}
        );
        this.load.spritesheet('dead', deadpng,
            {frameWidth: 500, frameHeight: 500}
        );
    }
    
    create() {
        this.add.image(50, 300, 'ship');
        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyMiniMap = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        this.killButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
        this.createSpritesFromTempPlayers();
        this.createMiniMap();
        // this.createDeadBody();
    
        this.socket.on('move', (playerObj) => {
            this.players[playerObj.id].x = playerObj.x;
            this.players[playerObj.id].y = playerObj.y;
            this.audioIcons[playerObj.id].x = playerObj.x;
            this.audioIcons[playerObj.id].y = playerObj.y - PLAYER_HEIGHT/2;
            this.webRTC.move(playerObj);
        });

        this.socket.on('kill', (playerObj) => {
            this.deadBodies[playerObj.id].x = playerObj.x;
            this.deadBodies[playerObj.id].y = playerObj.y;
            this.deadBodies[playerObj.id].visible = true;
            // this.audioIcons[playerObj.id].x = playerObj.x;
            // this.audioIcons[playerObj.id].y = playerObj.y - PLAYER_HEIGHT/2;
            // this.webRTC.move(playerObj);
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

        this.add.text(100, 350, 'game', { font: '32px Arial', fill: '#FFFFFF' });
        this.add.text(100, 400, this.roomCode, { font: '32px Arial', fill: '#FFFFFF' });
        this.createEndButtonForHost();
        this.createMuteButton();
    }
    
    update(time, deltaTime) {
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

            this.counter += deltaTime;
            // Call a function every 200 milliseconds
            if (this.counter > 200) {
                this.displayMiniMap();
                this.killWrapper(time);
                this.counter = 0;
            }
        }
    }

    createSpritesFromTempPlayers() {
        for (let playerId in this.tempPlayers) {
            this.createSprite(this.tempPlayers[playerId]);
            this.createAudioSprite(this.tempPlayers[playerId].id, this.tempPlayers[playerId].x, this.tempPlayers[playerId].y)
            this.createDeadBody(this.tempPlayers[playerId].id, this.tempPlayers[playerId].x, this.tempPlayers[playerId].y);
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
        this.audioIcons[this.socket.id].x = this.players[this.socket.id].x
        this.audioIcons[this.socket.id].y = this.players[this.socket.id].y - PLAYER_HEIGHT/2;
        this.miniMapPlayer.x = (this.players[this.socket.id].x - 50) * 0.4 + 433;
        this.miniMapPlayer.y = (this.players[this.socket.id].y - 300) * 0.4 + 230;
        return moved;
    }

    createEndButtonForHost() {
        if (this.socket.id !== this.host) {
            return;
        }
        this.startText = this.add.text(100, 450, 'end', { font: '32px Arial', fill: '#FFFFFF' });
        this.startText.setInteractive();
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

    createMiniMap() {

        this.graphics = this.add.graphics();
        this.graphics.fillStyle(0x000000, 1);
        this.graphics.fillCircle(this.cameras.main.width/2, this.cameras.main.height/2,
             1000);
        this.graphics.setAlpha(0.7);
        this.graphics.setScrollFactor(0);

        this.miniMap = this.add.image(0, 0, 'ship');
        this.miniMap.setOrigin(0,0);
        this.miniMap.setScale(0.4);
        this.miniMap.setAlpha(0.9);
        this.miniMap.setScrollFactor(0);
        this.miniMap.visible = false;
        this.miniMap_bool = false;
        this.counter = 0;
        this.miniMapPlayer = this.add.sprite((this.players[this.socket.id].x - 50) * 0.4 + 433,
         (this.players[this.socket.id].y - 300) * 0.4 + 230, 'minimapPlayer');
        this.miniMapPlayer.displayHeight = PLAYER_HEIGHT/2;
        this.miniMapPlayer.displayWidth = PLAYER_WIDTH;
        this.miniMapPlayer.setScrollFactor(0);
        this.miniMapPlayer.visible = false;
        this.graphics.visible = false;
    }

    displayMiniMap() {
        if (this.keyMiniMap.isDown && !this.miniMap_bool) {
            this.miniMap.visible = true;
            this.miniMap_bool = true;
            this.graphics.visible = true;
            this.miniMapPlayer.visible = true;
        }
        else if (this.keyMiniMap.isDown && this.miniMap_bool) {
            this.miniMap.visible = false;
            this.miniMap_bool = false;
            this.miniMapPlayer.visible = false;
            this.graphics.visible = false;
        }
    }

    createDeadBody(playerId, x, y) {
        this.deadBodies[playerId] = this.add.sprite(x , y, 'dead')
        this.deadBodies[playerId].displayHeight = PLAYER_HEIGHT/2;
        this.deadBodies[playerId].displayWidth = PLAYER_WIDTH/2;
        this.deadBodies[playerId].visible = false;
    }

    killWrapper(time) {

        if (time - this.lastActionTime >= this.imposter.killCooldown && this.killButton.isDown) {
            console.log("kill");
            this.imposter.update(this.players[this.socket.id]);
            let kill_flag = this.imposter.kill(this.players, this.deadBodies);
            if (kill_flag) {
                this.lastActionTime = time;
            }
        }
    }
}