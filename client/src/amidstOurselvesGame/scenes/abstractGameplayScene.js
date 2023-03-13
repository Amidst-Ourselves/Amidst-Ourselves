import Phaser from 'phaser';
import {
    PLAYER_HEIGHT,
    PLAYER_STATE,
    PLAYER_WIDTH,
    MAP_SCALE,
    MAP1_WALLS,
    FRAMES_PER_COLOUR
} from "../constants"


export default class AbstractGameplayScene extends Phaser.Scene {
    constructor(config) {
        super(config);
        this.players = {};
        this.playerNames = {};
        this.audioIcons = {};
        this.deadBodies = {};
    }

    movePlayer(speed, oldX, oldY, up, down, left, right) {
        let newX = oldX;
        let newY = oldY;
    
        let moved = false;
        if (up) {
            newY -= speed;
            moved = true;
        }
        if (down) {
            newY += speed;
            moved = true;
        }
        if (left) {
            newX -= speed;
            moved = true;
        }
        if (right) {
            newX += speed;
            moved = true;
        }
        if (!moved) return;
    
        let wallnewX = Math.floor(newX/MAP_SCALE);
        let wallnewY = Math.floor(newY/MAP_SCALE);
        let walloldX = Math.floor(oldX/MAP_SCALE);
        let walloldY = Math.floor(oldY/MAP_SCALE);
    
        if (!MAP1_WALLS.has(`${wallnewX}-${wallnewY}`)) {
            this.updateLocalPlayerPosition(newX, newY);
        }
        else if (!MAP1_WALLS.has(`${walloldX}-${wallnewY}`)) {
            this.updateLocalPlayerPosition(oldX, newY);
        }
        else if (!MAP1_WALLS.has(`${wallnewX}-${walloldY}`)) {
            this.updateLocalPlayerPosition(newX, oldY);
        }
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
        console.log(playerObj);

        this.players[playerObj.id] = this.add.sprite(playerObj.x, playerObj.y, 'player', playerObj.colour * FRAMES_PER_COLOUR).setOrigin(0.5, 1);
        this.players[playerObj.id].displayHeight = PLAYER_HEIGHT;
        this.players[playerObj.id].displayWidth = PLAYER_WIDTH;
        this.players[playerObj.id].colour = playerObj.colour;
        this.players[playerObj.id].playerState = playerObj.playerState;
        this.players[playerObj.id].tasks = playerObj.tasks;

        this.deadBodies[playerObj.id] = this.add.sprite(0 , 0, 'player', 8).setOrigin(0.5, 1);
        this.deadBodies[playerObj.id].displayHeight = PLAYER_HEIGHT;
        this.deadBodies[playerObj.id].displayWidth = PLAYER_WIDTH;
        this.deadBodies[playerObj.id].visible = false;

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

        this.deadBodies[playerId].destroy();
        delete this.deadBodies[playerId];
    }

    isWithinManhattanDist(x1, y1, x2, y2, minDist) {
        return Math.abs(x1-x2) + Math.abs(y1-y2) < minDist;
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