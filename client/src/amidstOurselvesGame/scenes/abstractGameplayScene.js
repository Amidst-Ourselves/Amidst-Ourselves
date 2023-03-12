import Phaser from 'phaser';
import { PLAYER_HEIGHT, PLAYER_STATE, PLAYER_WIDTH } from "../constants"


export default class AbstractGameplayScene extends Phaser.Scene {
    constructor(config) {
        super(config);
        this.players = {};
        this.playerNames = {};
        this.audioIcons = {};
    }

    updateLocalPlayerPosition(newX, newY) {
        this.cameras.main.centerOn(newX, newY);
        this.socket.emit('move', {x: newX, y: newY});
        this.updatePlayerPosition(newX, newY, this.socket.id);
    }

    updatePlayerPosition(newX, newY, playerId) {
        this.players[playerId].x = newX;
        this.players[playerId].y = newY;
        this.playerNames[playerId].x = newX;
        this.playerNames[playerId].y = newY;
        this.audioIcons[playerId].x = newX;
        this.audioIcons[playerId].y = newY - PLAYER_HEIGHT/2;
        this.webRTC.move({id: playerId, x: newX, y: newY});
    }

    createSpritesFromTempPlayers() {
        for (let playerId in this.tempPlayers) {
            this.createSprite(this.tempPlayers[playerId]);
        }
        if (this.players[this.socket.id].playerState === PLAYER_STATE.imposter) {
            this.setImposterNameColours();
        }
        delete this.tempPlayers;
    }
    
    createSprite(playerObj) {
        console.log(playerObj.playerState);

        this.players[playerObj.id] = this.add.sprite(playerObj.x, playerObj.y, 'player').setOrigin(0.5, 1);
        this.players[playerObj.id].displayHeight = PLAYER_HEIGHT;
        this.players[playerObj.id].displayWidth = PLAYER_WIDTH;
        this.players[playerObj.id].playerState = playerObj.playerState;
        this.players[playerObj.id].tasks = playerObj.tasks;

        this.playerNames[playerObj.id] = this.add.text(playerObj.x, playerObj.y, playerObj.id, { font: '16px Arial', fill: '#FFFFFF' }).setOrigin(0.5, 0);

        this.audioIcons[playerObj.id] = this.add.sprite(playerObj.x, playerObj.y, 'audioIcon');
        this.audioIcons[playerObj.id].displayHeight = PLAYER_HEIGHT/2;
        this.audioIcons[playerObj.id].displayWidth = PLAYER_WIDTH/2;
        this.audioIcons[playerObj.id].visible = false;

        this.webRTC.move(playerObj);
    }

    setImposterNameColours() {
        for (let playerId in this.players) {
            if (this.players[playerId].playerState === PLAYER_STATE.imposter) {
                this.playerNames[playerId].setTint(0xff0000);
            }
        }
    }
    
    destroySprite(playerId) {
        this.players[playerId].destroy();
        delete this.players[playerId];

        this.playerNames[playerId].destroy();
        delete this.playerNames[playerId];

        this.audioIcons[playerId].destroy();
        delete this.audioIcons[playerId];
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
}