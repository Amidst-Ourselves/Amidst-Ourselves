import audioIconpng from "../assets/audioIcon.png";
import Phaser from 'phaser';
import {
    MAP_SCALE,
    MAP1_SPAWN_X,
    MAP1_SPAWN_Y,
    SPRITE_CONFIG,
    PLAYER_STATE,
    TASK_CONFIG,
    BUTTON_X,
    BUTTON_Y,
    BUTTON_CONFIG,
    BUTTON_SPRITE_HEIGHT,
    BUTTON_SPRITE_WIDTH,
    NOTIFICATION_X,
    NOTIFICATION_Y,
    NOTIFICATION_INCREMENT_Y,
} from "../constants";
import LobbyScene from "./lobbyScene";
import gameEndScene from "./gameEndScene";
import AbstractGameplayScene from "./abstractGameplayScene";
import Imposter from "../containers/imposter";
import MiniMap from "../containers/minimap";
import TaskManager from "../containers/taskManager";
import Meeting from "../containers/meeting";
import NotificationManager from "../containers/notificationManager";


export default class GameScene extends AbstractGameplayScene {
    constructor() {
        super("gameScene");
        this.accumulator = 0;
    }

    init(roomObj) {
        this.socket = this.registry.get('socket');
        this.webRTC = this.registry.get('webRTC');
        this.roomCode = roomObj.roomCode;
        this.host = roomObj.host;
        this.tempPlayers = roomObj.players;
        this.speed = roomObj.playerSpeed;
        this.eButtonPressed = false;
        this.inMeeting = false;
        this.gameWinner = roomObj.gameWinner;

        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.killButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
        this.callButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        this.notificationManager = new NotificationManager(
            this,
            NOTIFICATION_X,
            NOTIFICATION_Y,
            NOTIFICATION_INCREMENT_Y,
        );

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

        this.imposter = new Imposter(this);
        this.meetingManager = new Meeting(this);

        this.canMove = true;
    }

    preload() {
        this.load.image('map1', 'amidstOurselvesAssets/map1.png');
        this.load.spritesheet('player', 'amidstOurselvesAssets/player.png', SPRITE_CONFIG);
        this.load.spritesheet('audioIcon', audioIconpng, {frameWidth: 500, frameHeight: 500});
        this.load.spritesheet('tab', 'amidstOurselvesAssets/tab.png', {frameWidth: 1000, frameHeight: 200});
        this.load.spritesheet('yes', 'amidstOurselvesAssets/yes.png', {frameWidth: 100, frameHeight: 100});
        this.load.spritesheet('no', 'amidstOurselvesAssets/no.png', {frameWidth: 100, frameHeight: 100});
        this.load.spritesheet('task', 'amidstOurselvesAssets/map1task.png', TASK_CONFIG);
        this.load.spritesheet('ebutton', 'amidstOurselvesAssets/map1button.png', BUTTON_CONFIG);
    }
    
    create() {
        this.add.image(0, 0, 'map1').setOrigin(0, 0).setScale(MAP_SCALE);
        this.cameras.main.centerOn(MAP1_SPAWN_X, MAP1_SPAWN_Y);

        this.eButton = this.add.sprite(BUTTON_X * MAP_SCALE, BUTTON_Y * MAP_SCALE, 'ebutton');
        this.eButton.displayHeight = BUTTON_SPRITE_HEIGHT * MAP_SCALE;
        this.eButton.displayWidth = BUTTON_SPRITE_WIDTH * MAP_SCALE;

        this.createPlayers(this.tempPlayers);

        this.taskManager.create(this.players[this.socket.id], 'task');
        this.miniMap.create(this.players[this.socket.id], 'player', 'map1');
        this.imposter.create(this.socket);
        this.meetingManager.create();
        this.imposter.startCooldown();

        this.add.text(100, 350, 'game', { font: '32px Arial', fill: '#FFFFFF' }).setScrollFactor(0);
        this.add.text(100, 400, this.roomCode, { font: '32px Arial', fill: '#FFFFFF' }).setScrollFactor(0);
        this.createEndButtonForHost();
        this.createMuteButton();

        this.killButton.on('down', () => {
            if (this.players[this.socket.id].playerState === PLAYER_STATE.imposter && !this.inMeeting) {
                this.imposter.attemptKill(this.players, this.deadBodies);
            }
        });

        this.callButton.on('down', () => {
            if(this.meetingManager.checkMeetingConditions()) {
                this.socket.emit('meeting');
                this.socket.emit('meetingCountdown');
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
            this.updatePlayerPosition(playerObj.x, playerObj.y, playerObj.id, playerObj.velocity);
            this.startMovingPlayer(playerObj.id);
        });

        this.socket.on('moveStop', (playerObj) => {
            this.stopMovingPlayer(playerObj.id);
        });

        this.socket.on('join', (playerObj) => {
            this.notificationManager.addNotification('player joined ' + playerObj.name);
            this.createPlayer(playerObj);
            this.changePlayerToGhost(playerObj.id);
        });
        
        this.socket.on('leave', (playerObj) => {
            this.notificationManager.addNotification('player left ' + playerObj.name);
            this.destroySprite(playerObj.id);
        });

        this.socket.on('teleportToLobby', (roomObj) => {
            this.cleanupSocketio();
            this.scene.add("lobbyScene", LobbyScene, true, roomObj);
            this.scene.remove("gameScene");
        });

        this.socket.on('teleportToEnd', (roomObj) => {
            this.cleanupSocketio();
            this.scene.add("gameEndScene", gameEndScene, true, roomObj);
            this.scene.remove("gameScene");
        });

        this.socket.on('kill', (playerObj) => {
            if (playerObj.id === this.socket.id) {
                this.changeLocalPlayerToGhost();
                this.taskManager.finishAllTasks();
            } else {
                this.changePlayerToGhost(playerObj.id);
            }

            this.spawnDeadBody(playerObj.id, playerObj.x, playerObj.y);
        });

        this.socket.on('webRTC_speaking', (config) => {
            if (this.players[this.socket.id].playerState !== PLAYER_STATE.ghost && this.players[config.id].playerState === PLAYER_STATE.ghost
                || Phaser.Math.Distance.Between(
                    this.players[this.socket.id].x,
                    this.players[this.socket.id].y,
                    this.players[config.id].x,
                    this.players[config.id].y
                  ) > 150 ) {
                this.audioIcons[config.id].visible = false;
            }
            else {
                this.audioIcons[config.id].visible = config.bool;
            }
        });

        this.socket.on('meeting', () => {
            let newDeadBodies = [];

            for (let playerId in this.players) {
                this.updatePlayerPosition(MAP1_SPAWN_X, MAP1_SPAWN_Y, playerId, 1);

                if (this.deadBodies[playerId].visible) {
                    this.cleanDeadBody(playerId);
                    newDeadBodies.push(playerId);
                }
            }

            this.meetingManager.show();
        });

        this.socket.on('meetingResult', (result) => {
            this.meetingManager.endMeeting();
            this.meetingManager.showResult(result);
            this.cameras.main.centerOn(this.players[this.socket.id].x, this.players[this.socket.id].y);
            this.imposter.killReady = true;
            this.imposter.startCooldown();
        })

        this.socket.on('new_message', (config) => {
            this.meetingManager.addMessage(this.players[config.player].name, config.message);
        });

        this.socket.on('host', (playerObj) => {
            this.host = playerObj.id;
            this.createEndButtonForHost();
        });
    }

    update(time, delta) {
        // cheap hack that slows the game to ~60fps for fast monitors
        this.accumulator += delta;
        if (this.accumulator < 15) return;
        this.accumulator = 0;

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

        this.webRTC.updateState(this.players);
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
        this.socket.off('moveStop');
        this.socket.off('join');
        this.socket.off('leave');
        this.socket.off('teleportToLobby');
        this.socket.off('teleportToEnd');
        this.socket.off('kill');
        this.socket.off('webRTC_speaking');
        this.socket.off('meeting');
        this.socket.off('meetingResult');
        this.socket.off('new_message');
        this.socket.off('host');
    }
}
