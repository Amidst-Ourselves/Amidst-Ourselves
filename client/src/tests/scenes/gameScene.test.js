import 'jest-canvas-mock';
import Phaser from 'phaser';
import gameEndScene from '../../amidstOurselvesGame/scenes/gameEndScene';
import { PLAYER_STATE } from '../../amidstOurselvesGame/constants';
import LobbyScene from '../../amidstOurselvesGame/scenes/lobbyScene';
import GameScene from '../../amidstOurselvesGame/scenes/gameScene';

jest.mock('phaser', () => {
    const original = jest.requireActual('phaser');
    return {
        ...original,
        Scene: jest.fn(original.Scene)
    };
});

jest.mock('../../amidstOurselvesGame/containers/notificationManager', () => {
    return jest.fn().mockImplementation(() => {});
});

jest.mock('../../amidstOurselvesGame/containers/minimap', () => {
    return jest.fn().mockImplementation(() => {});
});

jest.mock('../../amidstOurselvesGame/containers/taskManager', () => {
    return jest.fn().mockImplementation(() => {});
});

jest.mock('../../amidstOurselvesGame/containers/imposter', () => {
    return jest.fn().mockImplementation(() => {});
});

jest.mock('../../amidstOurselvesGame/containers/meeting', () => {
    return jest.fn().mockImplementation(() => {});
});

beforeEach(() => {
    Phaser.Scene.mockClear();
});

describe('gameScene', () => {
    test('should call super with "gameScene"', () => {
        new GameScene();
        expect(Phaser.Scene).toHaveBeenCalledWith("gameScene");
    });

    describe('init', () => {
        let scene;
        let roomObj;

        beforeEach(() => {
            scene = new GameScene();
            scene.registry = { get: jest.fn() };
            scene.socket = {};
            scene.webRTC = {};
            roomObj = {
                roomCode: '1234',
                host: 'player1',
                players: [],
            };
            scene.input = {
                keyboard: {
                    addKey: jest.fn().mockReturnValue({}),
                },
            };
        });

        test('should initialize from roomObj', () => {
            scene.init(roomObj);
            expect(scene.roomCode).toEqual(roomObj.roomCode);
            expect(scene.host).toEqual(roomObj.host);
            expect(scene.tempPlayers).toEqual(roomObj.players);
            expect(scene.input.keyboard.addKey).toHaveBeenCalled();
            expect(scene.notificationManager).toBeDefined();
            expect(scene.miniMap).toBeDefined();
            expect(scene.taskManager).toBeDefined();
            expect(scene.imposter).toBeDefined();
            expect(scene.meetingManager).toBeDefined();
        });
    });
    
    describe('create', () => {
        let scene;
        let roomObj;
    
        beforeEach(() => {
            scene = new GameScene();
            scene.add = {
                text: jest.fn().mockReturnValue({
                    setOrigin: jest.fn().mockReturnThis(),
                    setScrollFactor: jest.fn().mockReturnThis(),
                    setPadding: jest.fn().mockReturnThis(),
                    setStyle: jest.fn().mockReturnThis(),
                    setInteractive: jest.fn().mockReturnThis(),
                    on: jest.fn().mockReturnThis(),
                }),
                image: jest.fn().mockReturnValue({
                    setDisplaySize: jest.fn().mockReturnThis(),
                    setOrigin: jest.fn().mockReturnThis(),
                    setScale: jest.fn().mockReturnThis(),
                }),
                sprite: jest.fn().mockReturnValue({
                    setOrigin: jest.fn().mockReturnThis(),
                }),
            };
            scene.cameras = { main: { centerOn: jest.fn() } };
            scene.scale = { width: 800, height: 600 };
            scene.socket = { on: jest.fn(), emit: jest.fn() };

            scene.input = {
                keyboard: {
                    addKey: jest.fn().mockReturnValue({
                        on: jest.fn(),
                    }),
                },
            };
        
            roomObj = {
                roomCode: '1234',
                host: 'player1',
                players: [],
                winner: PLAYER_STATE.imposter,
                winMessage: 'win message',
                initialPlayers: {
                    player1: {
                        name: 'player1Name',
                        colour: 0,
                        playerState: PLAYER_STATE.imposter,
                    },
                    player2: {
                        name: 'player2Name',
                        colour: 1,
                        playerState: PLAYER_STATE.crewmate,
                    },
                    player3: {
                        name: 'player3Name',
                        colour: 2,
                        playerState: PLAYER_STATE.crewmate,
                    },
                },
            };
            scene.registry = {
                get: jest.fn().mockImplementation((key) => {
                    if (key === 'socket') {
                        return {
                            id: 'socketId',
                            emit: jest.fn(),
                            on: jest.fn(),
                        };
                    } else if (key === 'webRTC') {
                        return {
                            updateState: jest.fn(),
                        };
                    } else {
                        return null;
                    }
                }),
            };
            scene.init(roomObj);

            scene.taskManager = {
                create: jest.fn(),
                incrementTaskbar: jest.fn(),
            };
            scene.notificationManager = {
                create: jest.fn(),
                addNotification: jest.fn(),
            };
            scene.miniMap = {
                create: jest.fn(),
            };
            scene.imposter = {
                startCooldown: jest.fn(),
                create: jest.fn(),
            };
            scene.meetingManager = {
                create: jest.fn(),
                show: jest.fn(),
                endMeeting: jest.fn(),
                showResult: jest.fn(),
                addMessage: jest.fn(),
            };

            scene.createPlayers = jest.fn();
            scene.createMuteButton = jest.fn();
            scene.createEndButtonForHost = jest.fn();
        });
    
        test('should create text, images, sprites, and listener', () => {
            scene.winner = PLAYER_STATE.imposter;
            scene.create();
        
            expect(scene.add.text).toHaveBeenCalledTimes(3);
            expect(scene.add.image).toHaveBeenCalledTimes(1);
            expect(scene.add.sprite).toHaveBeenCalledTimes(1);
            expect(scene.socket.on).toHaveBeenCalledTimes(13);
        });

        test('taskComplete', () => {
            scene.scene = {
                add: jest.fn(),
                remove: jest.fn(),
            };
            scene.create();

            findSecondElement(scene.socket.on.mock.calls, 'taskCompleted')({id: 1, name: 'task1'});
            expect(scene.taskManager.incrementTaskbar).toHaveBeenCalled();
        });

        test('move', () => {
            scene.updatePlayerPosition = jest.fn();
            scene.startMovingPlayer = jest.fn();
            scene.scene = {
                add: jest.fn(),
                remove: jest.fn(),
            };
            scene.create();

            findSecondElement(scene.socket.on.mock.calls, 'move')({x: 0, y: 0, id: 'player1', velocity: 0});
            expect(scene.updatePlayerPosition).toHaveBeenCalledWith(0, 0, 'player1', 0);
            expect(scene.startMovingPlayer).toHaveBeenCalledWith('player1');
        });

        test('moveStop', () => {
            scene.stopMovingPlayer = jest.fn();
            scene.scene = {
                add: jest.fn(),
                remove: jest.fn(),
            };
            scene.create();

            findSecondElement(scene.socket.on.mock.calls, 'moveStop')({id: 'player1'});
            expect(scene.stopMovingPlayer).toHaveBeenCalledWith('player1');
        });

        test('join', () => {
            scene.createPlayer = jest.fn();
            scene.changePlayerToGhost = jest.fn();
            scene.scene = {
                add: jest.fn(),
                remove: jest.fn(),
            };
            scene.create();

            findSecondElement(scene.socket.on.mock.calls, 'join')({id: 'player1', name: 'player1Name'});
            expect(scene.notificationManager.addNotification).toHaveBeenCalledWith('player joined player1Name');
            expect(scene.createPlayer).toHaveBeenCalledWith({id: 'player1', name: 'player1Name'});
            expect(scene.changePlayerToGhost).toHaveBeenCalledWith('player1');
        });

        test('leave', () => {
            scene.destroySprite = jest.fn();
            scene.scene = {
                add: jest.fn(),
                remove: jest.fn(),
            };
            scene.create();

            findSecondElement(scene.socket.on.mock.calls, 'leave')({id: 'player1', name: 'player1Name'});
            expect(scene.notificationManager.addNotification).toHaveBeenCalledWith('player left player1Name');
            expect(scene.destroySprite).toHaveBeenCalledWith('player1');
        });

        test('teleportToLobby', () => {
            scene.cleanupSocketio = jest.fn();
            scene.scene = {
                add: jest.fn(),
                remove: jest.fn(),
            };
            scene.create();

            findSecondElement(scene.socket.on.mock.calls, 'teleportToLobby')({});
            expect(scene.cleanupSocketio).toHaveBeenCalledTimes(1);
            expect(scene.scene.add).toHaveBeenCalledWith('lobbyScene', LobbyScene, true, {});
            expect(scene.scene.remove).toHaveBeenCalledWith('gameScene');
        });

        test('teleportToEnd', () => {
            scene.cleanupSocketio = jest.fn();
            scene.scene = {
                add: jest.fn(),
                remove: jest.fn(),
            };
            scene.create();

            findSecondElement(scene.socket.on.mock.calls, 'teleportToEnd')({});
            expect(scene.cleanupSocketio).toHaveBeenCalledTimes(1);
            expect(scene.scene.add).toHaveBeenCalledWith('gameEndScene', gameEndScene, true, {});
            expect(scene.scene.remove).toHaveBeenCalledWith('gameScene');
        });

        test('kill', () => {
            scene.spawnDeadBody = jest.fn();
            scene.changePlayerToGhost = jest.fn();
            scene.scene = {
                add: jest.fn(),
                remove: jest.fn(),
            };
            scene.create();

            findSecondElement(scene.socket.on.mock.calls, 'kill')({id: 'player1', x: 0, y: 0});
            expect(scene.spawnDeadBody).toHaveBeenCalledWith('player1', 0, 0);
            expect(scene.changePlayerToGhost).toHaveBeenCalledWith('player1');
        });

        test('meeting', () => {
            scene.updatePlayerPosition = jest.fn();
            scene.cleanDeadBody = jest.fn();
            scene.scene = {
                add: jest.fn(),
                remove: jest.fn(),
            };
            scene.players = {
                player1: {
                    id: 'player1',
                },
            };
            scene.deadBodies = {
                player1: {
                    id: 'player1',
                    visible: true,
                    available: true,
                },
            };
            scene.create();

            findSecondElement(scene.socket.on.mock.calls, 'meeting')();
            expect(scene.meetingManager.show).toHaveBeenCalledTimes(1);
            expect(scene.updatePlayerPosition).toHaveBeenCalledTimes(1);
            expect(scene.cleanDeadBody).toHaveBeenCalledTimes(1);
        });

        test('meetingResult', () => {
            scene.scene = {
                add: jest.fn(),
                remove: jest.fn(),
            };
            scene.players = {
                socketId: {
                    id: 'socketId',
                    x: 0,
                    y: 0,
                },
            };
            scene.create();

            findSecondElement(scene.socket.on.mock.calls, 'meetingResult')({});
            expect(scene.meetingManager.endMeeting).toHaveBeenCalled();
            expect(scene.meetingManager.showResult).toHaveBeenCalled();
            expect(scene.imposter.startCooldown).toHaveBeenCalled();
        });

        test('new_message', () => {
            scene.scene = {
                add: jest.fn(),
                remove: jest.fn(),
            };
            scene.players = {
                player1: {
                    id: 'player1',
                    name: 'player1Name',
                },
            };
            scene.create();

            findSecondElement(scene.socket.on.mock.calls, 'new_message')({message: 'message', player: 'player1'});
            expect(scene.meetingManager.addMessage).toHaveBeenCalledWith('player1Name', 'message');
        });

        test('host', () => {
            scene.host = 'oldHost'
            scene.scene = {
                add: jest.fn(),
                remove: jest.fn(),
            };
            scene.create();

            findSecondElement(scene.socket.on.mock.calls, 'host')({id: 'player1'});
            expect(scene.host).toEqual('player1');
            //expect(scene.createEndButtonForHost).toHaveBeenCalledTimes(2);
        });
    });

    describe('update', () => {
        let scene;
        let roomObj;
    
        beforeEach(() => {
            scene = new GameScene();

            scene.input = {
                keyboard: {
                    addKey: jest.fn().mockReturnValue({
                        on: jest.fn(),
                    }),
                },
            };
        
            roomObj = {
                roomCode: '1234',
                host: 'player1',
                players: [],
                winner: PLAYER_STATE.imposter,
                winMessage: 'win message',
                initialPlayers: {
                    player1: {
                        name: 'player1Name',
                        colour: 0,
                        playerState: PLAYER_STATE.imposter,
                    },
                    player2: {
                        name: 'player2Name',
                        colour: 1,
                        playerState: PLAYER_STATE.crewmate,
                    },
                    player3: {
                        name: 'player3Name',
                        colour: 2,
                        playerState: PLAYER_STATE.crewmate,
                    },
                },
            };
            scene.registry = {
                get: jest.fn().mockImplementation((key) => {
                    if (key === 'socket') {
                        return {
                            id: 'socketId',
                            emit: jest.fn(),
                            on: jest.fn(),
                        };
                    } else if (key === 'webRTC') {
                        return {
                            updateState: jest.fn(),
                        };
                    } else {
                        return null;
                    }
                }),
            };
            scene.init(roomObj);

            scene.taskManager = {
                create: jest.fn(),
                incrementTaskbar: jest.fn(),
                update: jest.fn(),
            };
            scene.notificationManager = {
                create: jest.fn(),
                addNotification: jest.fn(),
            };
            scene.miniMap = {
                create: jest.fn(),
                update: jest.fn(),
            };
            scene.imposter = {
                startCooldown: jest.fn(),
                updateCooldown: jest.fn(),
            };
            scene.meetingManager = {
                show: jest.fn(),
                endMeeting: jest.fn(),
                showResult: jest.fn(),
                addMessage: jest.fn(),
            };

            scene.createPlayers = jest.fn();
            scene.createMuteButton = jest.fn();
            scene.createEndButtonForHost = jest.fn();
        });
    
        test('update', () => {
            scene.winner = PLAYER_STATE.imposter;
            scene.canMove = true;
            scene.movePlayer = jest.fn();
            scene.visionUpdate = jest.fn();
            scene.players = {
                socketId: {
                    id: 'socketId',
                    x: 0,
                    y: 0,
                    playerState: PLAYER_STATE.imposter,
                },
            };
            scene.update(0, 16);
            
            expect(scene.movePlayer).toHaveBeenCalledTimes(1);
            expect(scene.imposter.updateCooldown).toHaveBeenCalledTimes(1);
            expect(scene.visionUpdate).toHaveBeenCalledTimes(1);
            expect(scene.miniMap.update).toHaveBeenCalledTimes(1);
            expect(scene.taskManager.update).toHaveBeenCalledTimes(1);
            expect(scene.webRTC.updateState).toHaveBeenCalledTimes(1);
        });
    });
    
    describe('cleanupSocketio', () => {
        let scene;
    
        beforeEach(() => {
            scene = new GameScene();
            scene.socket = {
                off: jest.fn()
            };
        });
    
        test('should remove the socket listener', () => {
            scene.cleanupSocketio();
            expect(scene.socket.off).toHaveBeenCalledTimes(13);
        });
    });
});

function findSecondElement(callbackList, callbackName) {
    for (let i = 0; i < callbackList.length; i++) {
        if (callbackList[i][0] === callbackName) {
            return callbackList[i][1];
        }
    }
    return undefined;
}
  