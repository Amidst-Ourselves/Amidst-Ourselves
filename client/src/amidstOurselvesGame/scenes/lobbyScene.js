import audioIconpng from "../assets/audioIcon.png";
import Phaser from 'phaser';
import {
    MAP_SCALE,
    MAP1_SPAWN_X,
    MAP1_SPAWN_Y,
    SPRITE_CONFIG,
    COLOUR_STATION_MIN_DIST,
    BUTTON_X,
    BUTTON_Y,
    NOTIFICATION_X,
    NOTIFICATION_Y,
    NOTIFICATION_INCREMENT_Y,
} from "../constants"
import GameScene from "./gameScene";
import AbstractGameplayScene from './abstractGameplayScene';
import ColourStation from "../containers/colourStation";
import NotificationManager from "../containers/notificationManager";


export default class LobbyScene extends AbstractGameplayScene {
    constructor() {
        super("lobbyScene");
        this.accumulator = 0;
    }

    init(roomObj) {
        this.socket = this.registry.get('socket');
        this.webRTC = this.registry.get('webRTC');
        this.roomCode = roomObj.roomCode;
        this.host = roomObj.host;
        this.tempPlayers = roomObj.players;
        this.speed = roomObj.playerSpeed;
        this.gameWinner = roomObj.gameWinner;

        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        this.notificationManager = new NotificationManager(
            this,
            NOTIFICATION_X,
            NOTIFICATION_Y,
            NOTIFICATION_INCREMENT_Y,
        );

        this.colourStation = new ColourStation(
            this,
            BUTTON_X * MAP_SCALE,
            BUTTON_Y * MAP_SCALE,
            COLOUR_STATION_MIN_DIST,
            Phaser.Input.Keyboard.KeyCodes.F,
            () => { this.socket.emit('colour'); },
        );
    }

    preload() {
        this.load.image('map1', 'amidstOurselvesAssets/map1.png');
        this.load.spritesheet('player', 'amidstOurselvesAssets/player.png', SPRITE_CONFIG);
        this.load.spritesheet('audioIcon', audioIconpng, {frameWidth: 500, frameHeight: 500});
        this.colourStation.preload();
    }
    
    create() {
        this.image = this.add.image(0, 0, 'map1').setOrigin(0, 0).setScale(MAP_SCALE);
        this.cameras.main.centerOn(MAP1_SPAWN_X, MAP1_SPAWN_Y);

        this.createPlayers(this.tempPlayers);

        this.colourStation.create(this.players[this.socket.id]);

        this.add.text(100, 350, 'lobby', { font: '32px Arial', fill: '#FFFFFF' }).setScrollFactor(0);
        this.add.text(100, 400, this.roomCode, { font: '32px Arial', fill: '#FFFFFF' }).setScrollFactor(0);
        this.createStartButtonForHost();
        this.createMuteButton();

        this.socket.on('colour', (playerObj) => {
            this.updatePlayerColour(playerObj.colour, playerObj.id);
        });
    
        this.socket.on('move', (playerObj) => {
            this.updatePlayerPosition(playerObj.x, playerObj.y, playerObj.id, playerObj.velocity);
            this.startMovingPlayer(playerObj.id);
        });

        this.socket.on('moveStop', (playerObj) => {
            this.stopMovingPlayer(playerObj.id);
        });
    
        this.socket.on('join', (playerObj) => {
            this.notificationManager.addNotification('player joined ' + playerObj.name);
            this.createPlayer(playerObj);
        });
        
        this.socket.on('leave', (playerObj) => {
            this.notificationManager.addNotification('player left ' + playerObj.name);
            this.destroySprite(playerObj.id);
        });

        this.socket.on('teleportToGame', (roomObj) => {
            this.cleanupSocketio();
            this.scene.add("gameScene", GameScene, true, roomObj);
            this.scene.remove("lobbyScene");
        });

        this.socket.on('webRTC_speaking', (config) => {
            this.audioIcons[config.id].visible = config.bool;
        });

        this.socket.on('host', (playerObj) => {
            this.host = playerObj.id;
            this.createStartButtonForHost();
        });
    }
    
    update(time, delta) {
        // cheap hack that slows the game to ~60fps for fast monitors
        this.accumulator += delta;
        if (this.accumulator < 15) return;
        this.accumulator = 0;

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
        this.colourStation.update();
        this.webRTC.updateState(this.players);
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
        this.socket.off('moveStop');
        this.socket.off('join');
        this.socket.off('leave');
        this.socket.off('teleportToGame');
        this.socket.off('webRTC_speaking');
        this.socket.off('host');
    }
}