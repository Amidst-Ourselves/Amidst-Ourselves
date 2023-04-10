import 'jest-canvas-mock';
import Phaser from 'phaser';
import gameEndScene from '../../amidstOurselvesGame/scenes/gameEndScene';
import { PLAYER_STATE } from '../../amidstOurselvesGame/constants';
import LobbyScene from '../../amidstOurselvesGame/scenes/lobbyScene';

jest.mock('phaser', () => {
    const original = jest.requireActual('phaser');
    return {
        ...original,
        Scene: jest.fn(original.Scene)
    };
});

beforeEach(() => {
    Phaser.Scene.mockClear();
});

describe('gameEndScene', () => {
    test('should call super with "gameEndScene"', () => {
        new gameEndScene();
        expect(Phaser.Scene).toHaveBeenCalledWith("gameEndScene");
    });

    describe('init', () => {
        let scene;
        let roomObj;

        beforeEach(() => {
            scene = new gameEndScene();
            scene.registry = { get: jest.fn() };
            scene.socket = {};
            scene.webRTC = {};
            roomObj = {
                roomCode: '1234',
                host: 'player1',
                players: [],
                winner: 'imposter',
                winMessage: 'Imposter wins!',
                initialPlayers: {},
            };
        });

        test('should initialize from roomObj', () => {
            scene.init(roomObj);
            expect(scene.roomCode).toEqual(roomObj.roomCode);
            expect(scene.host).toEqual(roomObj.host);
            expect(scene.tempPlayers).toEqual(roomObj.players);
            expect(scene.winner).toEqual(roomObj.winner);
            expect(scene.winMessage).toEqual(roomObj.winMessage);
            expect(scene.initialPlayers).toEqual(roomObj.initialPlayers);
        });

        test('should set textColour of winner', () => {
            roomObj.winner = 'imposter';
            scene.init(roomObj);
            expect(scene.textColour).toEqual("#FF0000");

            roomObj.winner = 'crewmate';
            scene.init(roomObj);
            expect(scene.textColour).toEqual("#FFFFFF");
        });
    });
    
    describe('create', () => {
        let scene;
        let roomObj;
    
        beforeEach(() => {
            scene = new gameEndScene();
            scene.add = {
                text: jest.fn().mockReturnValue({
                    setOrigin: jest.fn().mockReturnThis(),
                }),
                image: jest.fn().mockReturnValue({
                    setDisplaySize: jest.fn().mockReturnThis(),
                }),
                sprite: jest.fn().mockReturnValue({
                    setOrigin: jest.fn().mockReturnThis(),
                }),
            };
            scene.cameras = { main: { centerX: 400, centerY: 300 } };
            scene.scale = { width: 800, height: 600 };
            scene.socket = { on: jest.fn(), emit: jest.fn() };
        
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
                        return {};
                    } else {
                        return null;
                    }
                }),
            };
            scene.init(roomObj);
        });
    
        test('should create text, images, sprites, and listener', () => {
            scene.winner = PLAYER_STATE.imposter;
            scene.create();
        
            expect(scene.add.text).toHaveBeenCalledTimes(4);
            expect(scene.add.image).toHaveBeenCalledTimes(1);
            expect(scene.add.sprite).toHaveBeenCalledTimes(1);
            expect(scene.socket.on).toHaveBeenCalledWith('teleportToLobby', expect.any(Function));
        });

        test('teleportToLobby', () => {
            scene.winner = PLAYER_STATE.imposter;
            scene.cleanupSocketio = jest.fn();
            scene.scene = {
                add: jest.fn(),
                remove: jest.fn(),
            };
            scene.create();

            findSecondElement(scene.socket.on.mock.calls, 'teleportToLobby')({});
            expect(scene.cleanupSocketio).toHaveBeenCalledTimes(1);
            expect(scene.scene.add).toHaveBeenCalledWith('lobbyScene', LobbyScene, true, {});
            expect(scene.scene.remove).toHaveBeenCalledWith('gameEndScene');
        });
    });
    
    describe('cleanupSocketio', () => {
        let scene;
    
        beforeEach(() => {
            scene = new gameEndScene();
            scene.socket = {
                off: jest.fn()
            };
        });
    
        test('should remove the socket listener', () => {
            scene.cleanupSocketio();
            expect(scene.socket.off).toHaveBeenCalledWith('teleportToLobby');
            expect(scene.socket.off).toHaveBeenCalledTimes(1);
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
  