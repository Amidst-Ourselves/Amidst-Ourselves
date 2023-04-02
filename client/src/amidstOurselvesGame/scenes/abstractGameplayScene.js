import Phaser from 'phaser';
import {
    PLAYER_HEIGHT,
    PLAYER_STATE,
    PLAYER_WIDTH,
    MAP_SCALE,
    MAP1_WALLS,
    FRAMES_PER_COLOUR,
    GHOST_FRAME_OFFSET,
    DEAD_BODY_FRAME_OFFSET,
    VIEW_DISTANCE,
} from "../constants"




export default class AbstractGameplayScene extends Phaser.Scene {
    constructor(config) {
        super(config);
        this.players = {};
        this.playerNames = {};
        this.audioIcons = {};
        this.deadBodies = {};
    }




    movePlayer(speed, oldX, oldY, up, down, left, right, state) {
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

        if (state === PLAYER_STATE.ghost) {
            this.updateLocalPlayerPosition(newX, newY);
            return;
        }
    
        let wallnewX = Math.floor(newX/MAP_SCALE);
        let wallnewY = Math.floor(newY/MAP_SCALE);
        let walloldX = Math.floor(oldX/MAP_SCALE);
        let walloldY = Math.floor(oldY/MAP_SCALE);

        if (!MAP1_WALLS.has(`${wallnewX}-${wallnewY}`)) {
            this.updateLocalPlayerPosition(newX, newY);
        } else if (!MAP1_WALLS.has(`${walloldX}-${wallnewY}`)) {
            this.updateLocalPlayerPosition(oldX, newY);
        } else if (!MAP1_WALLS.has(`${wallnewX}-${walloldY}`)) {
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




    createPlayers(playerObjs) {
        for (let playerId in playerObjs) {
            this.createSprite(playerObjs[playerId]);
            this.webRTC.move(playerObjs[playerId]);
        }

        for (let playerId in this.players) {
            this.setPlayerImposter(playerId);
            this.setPlayerGhost(playerId);
        }
    }

    createPlayer(playerObj) {
        this.createSprite(playerObj);
        this.webRTC.move(playerObj);

        this.setPlayerImposter(playerObj.id);
        this.setPlayerGhost(playerObj.id);
    }
    
    createSprite(playerObj) {
        let startingDeadBodyFrame = playerObj.colour * FRAMES_PER_COLOUR + DEAD_BODY_FRAME_OFFSET;
        let startingPlayerFrame;
        let startingAlpha;
        if (playerObj.playerState === PLAYER_STATE.ghost) {
            startingPlayerFrame = playerObj.colour * FRAMES_PER_COLOUR + GHOST_FRAME_OFFSET;
            startingAlpha = 0.5;
        } else {
            startingPlayerFrame = playerObj.colour * FRAMES_PER_COLOUR;
            startingAlpha = 1;
        }

        this.playerNames[playerObj.id] = this.add.text(playerObj.x, playerObj.y, playerObj.id, { font: '16px Arial', fill: '#FFFFFF' }).setOrigin(0.5, 0);

        this.players[playerObj.id] = this.add.sprite(playerObj.x, playerObj.y, 'player', startingPlayerFrame).setOrigin(0.5, 1);
        this.players[playerObj.id].displayHeight = PLAYER_HEIGHT;
        this.players[playerObj.id].displayWidth = PLAYER_WIDTH;
        this.players[playerObj.id].colour = playerObj.colour;
        this.players[playerObj.id].playerState = playerObj.playerState;
        this.players[playerObj.id].tasks = playerObj.tasks;
        //this.players[playerObj.id].name = playerObj.id;
        this.players[playerObj.id].name = playerObj.id;
        this.players[playerObj.id].setAlpha(startingAlpha);

        this.deadBodies[playerObj.id] = this.add.sprite(0 , 0, 'player', startingDeadBodyFrame).setOrigin(0.5, 1);
        this.deadBodies[playerObj.id].displayHeight = PLAYER_HEIGHT;
        this.deadBodies[playerObj.id].displayWidth = PLAYER_WIDTH;
        this.deadBodies[playerObj.id].visible = false;

        this.audioIcons[playerObj.id] = this.add.sprite(playerObj.x, playerObj.y, 'audioIcon');
        this.audioIcons[playerObj.id].displayHeight = PLAYER_HEIGHT/2;
        this.audioIcons[playerObj.id].displayWidth = PLAYER_WIDTH/2;
        this.audioIcons[playerObj.id].visible = false;
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

    setPlayerImposter(playerId) {
        let localPlayerState = this.players[this.socket.id].playerState;
        let currentPlayerState = this.players[playerId].playerState;

        if (localPlayerState === PLAYER_STATE.imposter || localPlayerState === PLAYER_STATE.ghost) {
            if (currentPlayerState === PLAYER_STATE.imposter) {
                this.playerNames[playerId].setTint(0xff0000);
            }
        }
    }

    setPlayerGhost(playerId) {
        let localPlayerState = this.players[this.socket.id].playerState;
        let currentPlayerState = this.players[playerId].playerState;

        if (localPlayerState === PLAYER_STATE.crewmate || localPlayerState === PLAYER_STATE.imposter) {
            if (currentPlayerState === PLAYER_STATE.ghost) {
                this.hidePlayer(playerId);
            } else {
                this.showPlayer(playerId);
            }
        } else {
            this.showPlayer(playerId);
        }
    }

    hidePlayer(playerId) {
        this.players[playerId].visible = false;
        this.playerNames[playerId].visible = false;
    }

    showPlayer(playerId) {
        this.players[playerId].visible = true;
        this.playerNames[playerId].visible = true;
    }

    hideDeadBody(playerId) {
        this.deadBodies[playerId].x = 0;
        this.deadBodies[playerId].y = 0;
        this.deadBodies[playerId].visible = false;
    }

    showDeadBoby(playerId, x, y) {
        this.deadBodies[playerId].x = x;
        this.deadBodies[playerId].y = y;
        this.deadBodies[playerId].visible = true;
    }

    changeLocalPlayerToGhost() {
        let startingFrame = this.players[this.socket.id].colour * FRAMES_PER_COLOUR + GHOST_FRAME_OFFSET

        this.players[this.socket.id].setFrame(startingFrame);
        this.players[this.socket.id].setAlpha(0.5);
        this.players[this.socket.id].playerState = PLAYER_STATE.ghost;

        for (let playerId in this.players) {
            this.showPlayer(playerId);
            this.setPlayerImposter(playerId);
        }
    }

    changePlayerToGhost(playerId) {
        let startingFrame = this.players[playerId].colour * FRAMES_PER_COLOUR + GHOST_FRAME_OFFSET

        this.players[playerId].setFrame(startingFrame);
        this.players[playerId].setAlpha(0.5);
        this.players[playerId].playerState = PLAYER_STATE.ghost;

        if (this.players[this.socket.id].playerState === PLAYER_STATE.ghost) {
            this.showPlayer(playerId);
        } else {
            this.hidePlayer(playerId);
        }
    }

    updatePlayerColour(newColour, playerId) {
        let newColourFrame;
        if (this.players[playerId].playerState === PLAYER_STATE.ghost) {
            newColourFrame = newColour * FRAMES_PER_COLOUR + GHOST_FRAME_OFFSET;
        } else {
            newColourFrame = newColour * FRAMES_PER_COLOUR;
        }

        this.players[playerId].setFrame(newColourFrame);
        this.players[playerId].colour = newColour
    }




    wallBetween(x0, y0, x1, y1, stepSize, iterations) {
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = (x0 < x1) ? stepSize : -stepSize;
        const sy = (y0 < y1) ? stepSize : -stepSize;

        const initialX = x0;
        const initialY = y0;
        const lenientX = dx - stepSize;
        const lenientY = dy - stepSize;

        let err = dx - dy;
     
        for (let i=0; i < iterations; i++) {
            let exceedsX = Math.abs(x0 - initialX) >= lenientX;
            let exceedsY = Math.abs(y0 - initialY) >= lenientY;
            if (exceedsX && exceedsY) return false;

            let wallX = Math.floor(x0/MAP_SCALE);
            let wallY = Math.floor(y0/MAP_SCALE);
            if (MAP1_WALLS.has(`${wallX}-${wallY}`)) return true;

            let e2 = 2*err;
            if (e2 > -dy) {
                err -= dy;
                x0  += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0  += sy;
            }
        }

        return true;
    }

    visionUpdate(localId, localX, localY) {
        if (this.players[localId].playerState === PLAYER_STATE.ghost) {
            for (let playerId in this.players) {
                this.showPlayer(playerId);
            }
            return;
        }

        for (let playerId in this.players) {
            if (playerId === localId) {
                continue;
            }
            if (this.players[playerId].playerState === PLAYER_STATE.ghost) {
                this.hidePlayer(playerId);
                continue;
            }

            const wallBetween = this.wallBetween(
                localX,
                localY,
                this.players[playerId].x,
                this.players[playerId].y,
                MAP_SCALE,
                VIEW_DISTANCE,
            );
            if (wallBetween) {
                this.hidePlayer(playerId);
            } else {
                this.showPlayer(playerId);
            }
        }
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
