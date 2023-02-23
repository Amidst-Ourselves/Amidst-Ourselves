import Phaser from 'phaser';
import io from 'socket.io-client';
import { SERVER_ADDRESS, GAME_STATE } from '../constants';


export default class loadGameScene extends Phaser.Scene {
    constructor() {
        super("loadGameScene")
    }

    init(roomCodeObj) {
        this.roomCodeObj = roomCodeObj;
    }
    
    create() {
        this.socket = io(SERVER_ADDRESS);

        this.socket.on('connect', () => {
            this.registry.set('socket', this.socket);

            if (this.roomCodeObj.roomCode === undefined) {
                this.socket.emit('roomCreate', this.roomCodeObj);
            } else {
                this.socket.emit('roomJoin', this.roomCodeObj);
            }
    
            this.socket.on('roomResponse', (roomObj) => {
                console.log("roomObj", roomObj)
                if (roomObj.message !== undefined) {
                    this.scene.start("titleScene", {message: roomObj.message});
                    this.socket.disconnect();
                } else if (roomObj.roomCode === undefined) {
                    this.scene.start("titleScene", {message: 'failed to join room'});
                    this.socket.disconnect();
                } else if (roomObj.gameState === GAME_STATE.lobby) {
                    this.scene.start("lobbyScene", roomObj);
                } else if (roomObj.gameState === GAME_STATE.action) {
                    this.scene.start("gameScene", roomObj);
                } else {
                    this.scene.start("titleScene", {message: 'unknown error'});
                    this.socket.disconnect();
                }
            });
        });
    }
}