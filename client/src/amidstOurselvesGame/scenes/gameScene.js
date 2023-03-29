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
import TaskManager from "../containers/taskManager";
import Meeting from "../containers/meeting";


export default class GameScene extends AbstractGameplayScene {
    constructor() {
        super("gameScene");
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
        this.callButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        this.miniMap = new MiniMap(
            this,
            Phaser.Input.Keyboard.KeyCodes.M,
        );
        this.taskManager = new TaskManager(
            this,
            Phaser.Input.Keyboard.KeyCodes.F,
            roomObj.totalTasks,
            roomObj.tasksComplete,
            (taskName) => { this.socket.emit('taskCompleted', {'name': taskName}); },
        );

        this.canMove = true;
    }

    preload() {
        this.load.image('map1', 'amidstOurselvesAssets/map1.png');
        this.load.spritesheet('player', 'amidstOurselvesAssets/player.png', SPRITE_CONFIG);
        this.load.spritesheet('audioIcon', audioIconpng, {frameWidth: 500, frameHeight: 500});
        this.load.spritesheet('tab', 'amidstOurselvesAssets/tab.png', {frameWidth: 1000, frameHeight: 200});
        this.load.spritesheet('yes', 'amidstOurselvesAssets/yes.png', {frameWidth: 100, frameHeight: 100});
        this.load.spritesheet('no', 'amidstOurselvesAssets/no.png', {frameWidth: 100, frameHeight: 100});
    }
    
    create() {
        this.add.image(0, 0, 'map1').setOrigin(0, 0).setScale(MAP_SCALE);
        this.cameras.main.centerOn(MAP1_SPAWN_X, MAP1_SPAWN_Y);

        this.createPlayers(this.tempPlayers);

        this.taskManager.create(this.players[this.socket.id]);
        this.miniMap.create(this.players[this.socket.id], 'player', 'map1');

        this.imposter = new Imposter(this, this.socket);
        this.meetingManager = new Meeting(this);

        this.add.text(100, 350, 'game', { font: '32px Arial', fill: '#FFFFFF' }).setScrollFactor(0);
        this.add.text(100, 400, this.roomCode, { font: '32px Arial', fill: '#FFFFFF' }).setScrollFactor(0);
        this.createEndButtonForHost();
        this.createMuteButton();

        this.killButton.on('down', () => {
            if (this.players[this.socket.id].playerState === PLAYER_STATE.imposter) {
                this.imposter.attemptKill(this.players, this.deadBodies);
            }
        });

        this.callButton.on('down', () => {
            if(this.meetingManager.checkMeetingConditions()) {
                this.socket.emit('meeting');
            }
        });

        this.socket.on('taskCompleted', (taskObj) => {
            if (taskObj.id === this.socket.id) {
                this.taskManager.finishTask(taskObj.name);
                this.miniMap.finishTask(taskObj.name);
            } else {
                this.taskManager.incrementTaskbar();
            }
        });
    
        this.socket.on('move', (playerObj) => {
            this.updatePlayerPosition(playerObj.x, playerObj.y, playerObj.id);
        });

        this.socket.on('join', (playerObj) => {
            this.createPlayer(playerObj);
            this.changePlayerToGhost(playerObj.id);
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
            if (playerObj.id === this.socket.id) {
                this.changeLocalPlayerToGhost();
                this.taskManager.finishAllTasks();
            } else {
                this.changePlayerToGhost(playerObj.id);
            }

            this.showDeadBoby(playerObj.id, playerObj.x, playerObj.y);
        });

        this.socket.on('webRTC_speaking', (config) => {
            this.audioIcons[config.id].visible = config.bool;
        });

        this.socket.on('meeting', () => {
            let newDeadBodies = [];

            for (let playerId in this.players) {
                this.updatePlayerPosition(MAP1_SPAWN_X, MAP1_SPAWN_Y, playerId);

                if (this.deadBodies[playerId].visible) {
                    this.hideDeadBody(playerId);
                    newDeadBodies.push(playerId);
                }
            }

            console.log('newDeadBodies', newDeadBodies);
            this.meetingManager.show();
        });

        this.socket.on('meetingResult', (result) => {
            this.meetingManager.showResult(result);

        })

        this.socket.on('new_message', (config) => {
            this.meetingManager.addMessage(config.player, config.message);
        })
    }

    update() {
        // I disabled player movement in the taskManager class to make sure 
        // players can not move around while pressing the F key.
        if (this.canMove) {
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
        if (this.players[this.socket.id].playerState === PLAYER_STATE.imposter) {
            this.imposter.updateCooldown();
        }
        this.visionUpdate(
            this.socket.id,
            this.players[this.socket.id].x,
            this.players[this.socket.id].y,
        );
        this.taskManager.update();
        this.miniMap.update();
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
        this.socket.off('taskCompleted');
        this.socket.off('move');
        this.socket.off('join');
        this.socket.off('leave');
        this.socket.off('teleportToLobby');
        this.socket.off('kill');
        this.socket.off('webRTC_speaking');
        this.socket.off('meeting');
        this.socket.off('meetingResult');
    }
}
