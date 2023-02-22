import Phaser from 'phaser';
import io from 'socket.io-client';
import { SERVER_ADDRESS } from '../constants';

export default class loadGameScene extends Phaser.Scene {
    constructor() {
        super("loadGameScene")
    }

    init(roomCodeObj) {
        this.roomCodeObj = roomCodeObj;
        this.socket = io(SERVER_ADDRESS);
    }
    
    create() {
        this.socket.emit('roomJoinCreate', this.roomCodeObj);

        this.socket.on('roomJoinCreateResponse', (roomObj) => {
            if (roomObj.roomCode === undefined) {
                this.scene.start("titleScene", {message: 'failed to join room'});
            } else {
                this.scene.start("gameScene", roomObj);
            }
            this.socket.disconnect();
        });
    }
}