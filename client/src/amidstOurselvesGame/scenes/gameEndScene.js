import Phaser from 'phaser';
import { FRAMES_PER_COLOUR, HEIGHT, PLAYER_HEIGHT, PLAYER_STATE, PLAYER_WIDTH, SPRITE_CONFIG, WIDTH } from '../constants';
import LobbyScene from './lobbyScene';


export default class gameEndScene extends Phaser.Scene {
    constructor() {
        super("gameEndScene")
    }

    init(roomObj) {
        this.socket = this.registry.get('socket');
        this.webRTC = this.registry.get('webRTC');
        this.roomCode = roomObj.roomCode;
        this.host = roomObj.host;
        this.tempPlayers = roomObj.players;

        if (roomObj.winner) {
            this.winner = roomObj.winner;
        } else {
            this.winner = "ERROR: No winner";
        }
        if (roomObj.winMessage) {
            this.winMessage = roomObj.winMessage;
        } else {
            this.winMessage = "ERROR: No win message";
        }
        if (roomObj.initialPlayers) {
            this.initialPlayers = roomObj.initialPlayers;
        } else {
            this.initialPlayers = {};
        }

        if (this.winner === PLAYER_STATE.imposter) {
            this.textColour = "#FF0000";
        } else {
            this.textColour = "#FFFFFF";
        }

        this.incrementX = 100;
        this.currentX = 100;
        this.y = HEIGHT/2;
    }

    preload() {
        this.load.spritesheet('player', 'amidstOurselvesAssets/player.png', SPRITE_CONFIG);
        this.load.image('background', 'amidstOurselvesAssets/tech.png');
    }

    create() {
        this.add.text(WIDTH/2, 50, "Game Ended!", { font: '32px Arial', fill: '#FFFFFF' }).setOrigin(0.5);
        this.add.text(WIDTH/2, 100, this.winMessage, { font: '32px Arial', fill: '#FFFFFF', align: 'center' }).setOrigin(0.5);

        this.add.text(WIDTH/2, 450, "Game Developed by Logan Vaughan, Yongquan Zhang, and Chanpreet Singh.", { font: '16px Arial', fill: '#FFFFFF' }).setOrigin(0.5);

        //const image = this.add.image(WIDTH/2, 500, 'imageKey');
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background')
        .setDisplaySize(this.scale.width, this.scale.height);

        for (let playerId in this.initialPlayers) {

            if (this.initialPlayers[playerId].playerState !== this.winner) {
                continue;
            }

            const colour = this.initialPlayers[playerId].colour * FRAMES_PER_COLOUR;
            const player = this.add.sprite(this.currentX, this.y, 'player', colour).setOrigin(0.5, 1);
            player.displayHeight = PLAYER_HEIGHT;
            player.displayWidth = PLAYER_WIDTH;

            this.add.text(this.currentX, this.y, this.initialPlayers[playerId].name, { font: '16px Arial', fill: this.textColour }).setOrigin(0.5, 0);
            this.currentX += this.incrementX;
        }

        this.socket.on('teleportToLobby', (roomObj) => {
            this.cleanupSocketio();
            this.scene.add("lobbyScene", LobbyScene, true, roomObj);
            this.scene.remove("gameEndScene");
        });
    }

    cleanupSocketio() {
        this.socket.off('teleportToLobby');
    }
}
