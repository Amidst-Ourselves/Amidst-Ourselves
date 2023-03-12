import Phaser from 'phaser';
import io from 'socket.io-client';
import { SERVER_ADDRESS, GAME_STATE } from '../constants';
import LobbyScene from './lobbyScene';
import GameScene from './gameScene';
import webRTCClientManager from "../webRTCClientManager"


export default class LoadGameScene extends Phaser.Scene {
    constructor() {
        super("loadGameScene")
    }

    init(roomCodeObj) {
        this.roomCodeObj = roomCodeObj;
        this.webRTC = new webRTCClientManager();
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

                    this.initWebRTC(roomObj);
                    this.scene.add("lobbyScene", LobbyScene, true, roomObj);

                } else if (roomObj.gameState === GAME_STATE.action) {

                    this.initWebRTC(roomObj);
                    this.scene.add("gameScene", GameScene, true, roomObj);
                    
                } else {
                    this.scene.start("titleScene", {message: 'unknown error'});
                    this.socket.disconnect();
                }
            });
        });
    }

    initWebRTC(roomObj) {
        this.webRTC.init(roomObj, this.socket);
        this.webRTC.create();
        this.webRTC.update();
        this.registry.set('webRTC', this.webRTC);
    }
}