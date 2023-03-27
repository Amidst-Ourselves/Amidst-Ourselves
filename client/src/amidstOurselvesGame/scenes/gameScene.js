import audioIconpng from "../assets/audioIcon.png";
import Phaser from 'phaser';
import {
    MAP_SCALE,
    MAP1_SPAWN_X,
    MAP1_SPAWN_Y,
    SPRITE_CONFIG,
    PLAYER_STATE,
} from "../constants";
import LobbyScene from "./lobbyScene";
import AbstractGameplayScene from "./abstractGameplayScene";
import Imposter from "../containers/imposter";
import MiniMap from "../containers/minimap";
import TaskManager from "../containers/taskManager";
import Meeting from "../containers/meeting";


export default class GameScene extends AbstractGameplayScene {
    constructor() {
        super("gameScene")
    }

    init(roomObj) {
        this.socket = this.registry.get('socket');
        this.webRTC = this.registry.get('webRTC');
        this.roomCode = roomObj.roomCode;
        this.host = roomObj.host;
        this.tempPlayers = roomObj.players;
        this.speed = roomObj.playerSpeed;
        this.canMove = true;
    }

    preload() {
        this.load.image('map1', 'amidstOurselvesAssets/map1.png');
        this.load.spritesheet('player', 'amidstOurselvesAssets/player.png', SPRITE_CONFIG);
        this.load.spritesheet('audioIcon', audioIconpng, {frameWidth: 500, frameHeight: 500});
        this.load.spritesheet('tab', 'amidstOurselvesAssets/tab.png', {frameWidth: 1000,
            frameHeight: 200});
        this.load.spritesheet('yes', 'amidstOurselvesAssets/yes.png', {frameWidth: 100,
            frameHeight: 100});
        this.load.spritesheet('no', 'amidstOurselvesAssets/no.png', {frameWidth: 100,
            frameHeight: 100});
    }
    
    create() {
        this.add.image(0, 0, 'map1').setOrigin(0, 0).setScale(MAP_SCALE);
        this.cameras.main.centerOn(MAP1_SPAWN_X, MAP1_SPAWN_Y);
        
        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyMiniMap = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        this.killButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
        this.iteractButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.callButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        this.createSpritesFromTempPlayers();
        this.miniMap = new MiniMap(this, this.players[this.socket.id].colour, 'map1', 'player');
        if (this.players[this.socket.id].playerState === PLAYER_STATE.imposter) {
            this.imposter = new Imposter(this, this.socket);
        }
        this.taskManager = new TaskManager(this, this.socket);
        this.meetingManager = new Meeting(this);

        this.keyMiniMap.on('down', () => {
            this.miniMap.toggleMiniMap();
        });

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

        this.iteractButton.on('down', () => {
            const task = this.taskManager.findTask();
            if (task) {
                console.log("starting task");
                this.taskManager.taskAvailable = true;
                const index = this.taskManager.tasks.indexOf(task);
                this.taskManager.startTask(() => {
                    // console.log('Task completed!');
                    this.taskManager.updateCompletedTasks(index);
                    this.taskManager.updateTotalProgressBar();
                    this.socket.emit('taskCompleted', index);
                });
            }
            else {
                this.taskManager.taskAvailable = false;
            }
        });

        this.socket.on('taskCompleted', (index) => {
            this.taskManager.updateCompletedTasks(index);
            this.taskManager.updateTotalProgressBar();
        });
    
        this.socket.on('move', (playerObj) => {
            this.updatePlayerPosition(playerObj.x, playerObj.y, playerObj.id);
        });

        this.socket.on('join', (playerObj) => {
            this.createSprite(playerObj);
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
            this.deadBodies[playerObj.id].x = playerObj.x;
            this.deadBodies[playerObj.id].y = playerObj.y;
            this.deadBodies[playerObj.id].visible = true;
            this.players[playerObj.id].playerState = PLAYER_STATE.ghost;
        });

        this.socket.on('webRTC_speaking', (config) => {
            this.audioIcons[config.id].visible = config.bool;
        });

        this.socket.on('meeting', () => {
            // this.meetingManager.updateScene(this);
            this.meetingManager.show();
        });

        this.socket.on('meetingResult', (result) => {
            this.meetingManager.showResult(result);

        })

        this.socket.on('new_message', (config) => {
            this.meetingManager.addMessage(config.player, config.message);
        })

        this.add.text(100, 350, 'game', { font: '32px Arial', fill: '#FFFFFF' }).setScrollFactor(0);
        this.add.text(100, 400, this.roomCode, { font: '32px Arial', fill: '#FFFFFF' }).setScrollFactor(0);
        this.createEndButtonForHost();
        this.createMuteButton();
        if (this.players[this.socket.id].playerState === PLAYER_STATE.imposter) {
            this.imposter.createKillCooldown();
        }
        this.taskManager.addTask(1350, 650);
        this.taskManager.addTask(1650, 650);
        this.miniMap.createTaskSprites();
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
                this.keyRight.isDown
            );
        }
        this.miniMap.updateMiniMap(
            this.players[this.socket.id].x,
            this.players[this.socket.id].y,
        );
        if (this.players[this.socket.id].playerState === PLAYER_STATE.imposter) {
                this.imposter.updateCooldown();
        }
        this.taskManager.update();
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
        this.socket.off('move');
        this.socket.off('join');
        this.socket.off('leave');
        this.socket.off('teleportToLobby');
        this.socket.off('webRTC_speaking');
    }
}