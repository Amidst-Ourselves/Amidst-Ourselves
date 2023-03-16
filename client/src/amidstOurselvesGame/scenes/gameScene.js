import audioIconpng from "../assets/audioIcon.png";
import Phaser from 'phaser';
import {
    MAP_SCALE,
    MAP1_SPAWN_X,
    MAP1_SPAWN_Y,
    SPRITE_CONFIG,
    PLAYER_STATE,
    FRAMES_PER_COLOUR,
    GHOST_FRAME_OFFSET
} from "../constants";
import LobbyScene from "./lobbyScene";
import AbstractGameplayScene from "./abstractGameplayScene";
import Imposter from "../containers/imposter";
import MiniMap from "../containers/minimap";


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

        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.killButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);

        this.miniMap = new MiniMap(this, Phaser.Input.Keyboard.KeyCodes.M);
    }

    preload() {
        this.load.image('map1', 'amidstOurselvesAssets/map1.png');
        this.load.spritesheet('player', 'amidstOurselvesAssets/player.png', SPRITE_CONFIG);
        this.load.spritesheet('audioIcon', audioIconpng, {frameWidth: 500, frameHeight: 500});
    }
    
    create() {
        this.add.image(0, 0, 'map1').setOrigin(0, 0).setScale(MAP_SCALE);
        this.cameras.main.centerOn(MAP1_SPAWN_X, MAP1_SPAWN_Y);

        this.createSpritesFromTempPlayers();
        this.localPlayer = this.players[this.socket.id];

        this.miniMap.create(this.players[this.socket.id], 'player', 'map1');
        this.imposter = new Imposter(this, this.socket);

        this.add.text(100, 350, 'game', { font: '32px Arial', fill: '#FFFFFF' }).setScrollFactor(0);
        this.add.text(100, 400, this.roomCode, { font: '32px Arial', fill: '#FFFFFF' }).setScrollFactor(0);
        this.createEndButtonForHost();
        this.createMuteButton();

        this.killButton.on('down', () => {
            this.imposter.attemptKill(this.players, this.deadBodies);
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

        this.socket.on('teleportToLobby', (roomObj) => {
            this.cleanupSocketio();
            this.scene.add("lobbyScene", LobbyScene, true, roomObj);
            this.scene.remove("gameScene");
        });

        this.socket.on('kill', (playerObj) => {
            this.changePlayerToGhost(playerObj.id);
            this.showDeadBoby(playerObj.id, playerObj.x, playerObj.y);
        });

        this.socket.on('webRTC_speaking', (config) => {
            this.audioIcons[config.id].visible = config.bool;
        });
    }

    update() {
        this.miniMap.update();
        this.movePlayer(
            this.speed,
            this.players[this.socket.id].x,
            this.players[this.socket.id].y,
            this.keyUp.isDown,
            this.keyDown.isDown,
            this.keyLeft.isDown,
            this.keyRight.isDown,
            this.players[this.socket.id].playerState
        );
    }

    showDeadBoby(id, x, y) {
        this.deadBodies[id].x = x;
        this.deadBodies[id].y = y;
        this.deadBodies[id].visible = true;
    }

    changePlayerToGhost(id) {
        if (this.socket.id === id) {
            this.showAllPlayers();
            this.setImposterNameColours();
        } else if (this.players[this.socket.id].playerState !== PLAYER_STATE.ghost) {
            this.players[id].visible = false;
            this.playerNames[id].visible = false;
            this.audioIcons[id].visible = false;
        }

        this.players[id].setFrame(this.players[id].colour * FRAMES_PER_COLOUR + GHOST_FRAME_OFFSET);
        this.players[id].setAlpha(0.5);
        this.players[id].playerState = PLAYER_STATE.ghost;
    }

    showAllPlayers() {
        for (let player in this.players) {
            this.players[player].visible = true;
        }
        for (let playerName in this.playerNames) {
            this.playerNames[playerName].visible = true;
        }
        for (let audioIcon in this.audioIcons) {
            this.audioIcons[audioIcon].visible = true;
        }
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
}