import audioIconpng from "../assets/audioIcon.png";
import minimapPlayer from "../assets/minimapPlayer.png";
import deadpng from "../assets/dead.png";
import Phaser from 'phaser';
import { MAP_SCALE, MAP1_SPAWN_X, MAP1_SPAWN_Y, SPRITE_CONFIG } from "../constants"
import LobbyScene from "./lobbyScene";
import AbstractGameplayScene from "./abstractGameplayScene";
import { SPRITE_WIDTH, SPRITE_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT } from "../constants"
import lobbyScene from "./lobbyScene";
import imposter from "../imposter"


export default class GameScene extends AbstractGameplayScene {
    constructor() {
        super("gameScene")
    }

    init(roomObj) {
        this.socket = this.registry.get('socket');
        this.webRTC = this.registry.get('webRTC');
        this.roomCode = roomObj.roomCode;
        this.host = roomObj.host;
        this.tempPlayers = roomObj.players;
        this.speed = roomObj.playerSpeed;
        this.imposter = new imposter(this.socket);
        this.lastActionTime = 0;
    }

    preload() {
        this.load.image('map1', 'amidstOurselvesAssets/map1.png');
        this.load.spritesheet('player', 'amidstOurselvesAssets/player.png', SPRITE_CONFIG);
        this.load.spritesheet('audioIcon', audioIconpng, {frameWidth: 500, frameHeight: 500});
        this.load.spritesheet('minimapPlayer', minimapPlayer,{frameWidth: 500, frameHeight: 500});
        this.load.spritesheet('dead', deadpng,{frameWidth: 500, frameHeight: 500});
    }
    
    create() {
        this.add.image(0, 0, 'map1').setOrigin(0, 0).setScale(MAP_SCALE);
        this.cameras.main.centerOn(MAP1_SPAWN_X, MAP1_SPAWN_Y);
        
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

        this.socket.on('teleportToLobby', (roomObj) => {
            this.cleanupSocketio();
            this.scene.add("lobbyScene", LobbyScene, true, roomObj);
            this.scene.remove("gameScene");
        });

        this.socket.on('kill', (playerObj) => {
            this.deadBodies[playerObj.id].x = playerObj.x;
            this.deadBodies[playerObj.id].y = playerObj.y;
            this.deadBodies[playerObj.id].visible = true;
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

        this.add.text(100, 350, 'game', { font: '32px Arial', fill: '#FFFFFF' }).setScrollFactor(0);
        this.add.text(100, 400, this.roomCode, { font: '32px Arial', fill: '#FFFFFF' }).setScrollFactor(0);
        this.createEndButtonForHost();
        this.createMuteButton();

        this.keyMiniMap.on('down', () => {
            this.displayMiniMap();
        });

        this.killButton.on('down', () => {
            this.lastActionTime = this.imposter.killWrapper(this.time.now, this.lastActionTime, this.players, this.socket.id, this.deadBodies);
        });
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

    createSpritesFromTempPlayers() {
        for (let playerId in this.tempPlayers) {
            this.createSprite(this.tempPlayers[playerId]);
            this.createAudioSprite(this.tempPlayers[playerId].id, this.tempPlayers[playerId].x, this.tempPlayers[playerId].y)
            this.createDeadBody(this.tempPlayers[playerId].id, this.tempPlayers[playerId].x, this.tempPlayers[playerId].y);
        }
        delete this.tempPlayers;
    }

    destroyDeadBodySprite(playerId) {
        this.deadBodies[playerId].destroy();
        delete this.deadBodies[playerId];
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

    cleanupSocketio() {
        this.socket.off('move');
        this.socket.off('join');
        this.socket.off('leave');
        this.socket.off('teleportToLobby');
        this.socket.off('webRTC_speaking');
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
        if (!this.miniMap.visible) {
            this.miniMap.visible = true;
            this.graphics.visible = true;
            this.miniMapPlayer.visible = true;
        }
        else if (this.miniMap.visible) {
            this.miniMap.visible = false;
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
}