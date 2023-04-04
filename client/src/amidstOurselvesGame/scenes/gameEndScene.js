import Phaser from 'phaser';
import { WIDTH } from '../constants';


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
        this.playersAtEnd = roomObj.playersAtEnd;

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
    }

    create() {
        const gameEndText = this.add.text(0, 50, "Game Ended!", { font: '32px Arial', fill: '#FFFFFF' });
        const winnerText = this.add.text(0, 100, this.winMessage, { font: '32px Arial', fill: '#FFFFFF', align: 'center' });
        winnerText.setX(WIDTH/2 - winnerText.displayWidth / 2);
        gameEndText.setX(WIDTH/2 - gameEndText.displayWidth / 2);
        
        setTimeout(() => {
            window.location.reload();
        }, 5000);
    }
}
