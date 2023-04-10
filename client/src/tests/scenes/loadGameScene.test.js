import 'jest-canvas-mock';
import Phaser from 'phaser';
import io from 'socket.io-client';
import LoadGameScene from '../../amidstOurselvesGame/scenes/loadGameScene';
import webRTCClientManager from '../../amidstOurselvesGame/webRTCClientManager';
import LobbyScene from '../../amidstOurselvesGame/scenes/lobbyScene';

jest.mock('phaser', () => {
    const original = jest.requireActual('phaser');
    return {
        ...original,
        Scene: jest.fn(original.Scene)
    };
});

jest.mock('socket.io-client', () => {
    return jest.fn().mockImplementation(() => ({}));
});

jest.mock('../../amidstOurselvesGame/webRTCClientManager', () => {
    return jest.fn().mockImplementation(() => ({}));
});

describe('LoadGameScene', () => {
    let scene;

    beforeEach(() => {
        scene = new LoadGameScene();
        scene.add = {
            text: jest.fn(),
        };
        scene.scene = {
            start: jest.fn(),
            add: jest.fn(),
        };
        scene.socket = {
            on: jest.fn(),
            emit: jest.fn(),
        };
        scene.registry = {
            set: jest.fn(),
        };
        io.mockImplementation(() => {
            return scene.socket;
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should create a new LoadGameScene instance', () => {
        expect(scene).toBeInstanceOf(LoadGameScene);
    });

    test('should initialize roomCodeObj and webRTC', () => {
        const roomCodeObj = { roomCode: '1234' };
        scene.init(roomCodeObj);
        expect(scene.roomCodeObj).toEqual(roomCodeObj);
        expect(scene.webRTC).toBeInstanceOf(webRTCClientManager);
    });

    test('create', () => {
        scene.create();
        expect(io).toHaveBeenCalled();
        expect(scene.socket.on).toHaveBeenCalled();
    });

    test('connect and roomResponse', () => {
        scene.scene = {
            add: jest.fn(),
            remove: jest.fn(),
        };
        scene.initWebRTC = jest.fn();
        scene.init({roomCode: '1234'});
        scene.create();
        expect(scene.socket.on).toHaveBeenCalledTimes(1);

        findSecondElement(scene.socket.on.mock.calls, 'connect')({});
        expect(scene.socket.emit).toHaveBeenCalledTimes(1);
        expect(scene.socket.on).toHaveBeenCalledTimes(2);

        findSecondElement(scene.socket.on.mock.calls, 'roomResponse')({roomCode: '1234', gameState: 'lobby'});
        expect(scene.scene.add).toHaveBeenCalledWith('lobbyScene', LobbyScene, true, {roomCode: '1234', gameState: 'lobby'});
        expect(scene.initWebRTC).toHaveBeenCalledWith({roomCode: '1234', gameState: 'lobby'});
    });

    test('initWebRTC', () => {
        scene.webRTC = {
            init: jest.fn(),
            updateState: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        };
        scene.initWebRTC({});

        expect(scene.webRTC.init).toHaveBeenCalled();
        expect(scene.registry.set).toHaveBeenCalled();
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
