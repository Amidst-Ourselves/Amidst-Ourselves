import 'jest-canvas-mock';
import Phaser from 'phaser';
import { Scene } from 'phaser';
import AbstractGameplayScene from '../../amidstOurselvesGame/scenes/abstractGameplayScene';
import { COLOUR_NAMES, PLAYER_HEIGHT, PLAYER_STATE, PLAYER_WIDTH } from '../../amidstOurselvesGame/constants';

jest.mock('phaser', () => {
    const original = jest.requireActual('phaser');
    return {
        ...original,
        Scene: jest.fn(original.Scene)
    };
});

jest.mock('../../amidstOurselvesGame/wallData/col', () => {
    return {
        MAP1_COLLISION_WALLS: new Set(JSON.parse(`["0-0","1-1","2-2"]`)),
    };
});

jest.mock('../../amidstOurselvesGame/wallData/vis', () => {
    return {
        MAP1_VISUAL_WALLS: new Set(JSON.parse(`["0-0","1-1","2-2"]`)),
    };
});

jest.mock('../../amidstOurselvesGame/constants', () => {
    const original = jest.requireActual('../../amidstOurselvesGame/constants');
    return {
        ...original,
    };
});

const socketMock = {
    id: 'socketId',
    emit: jest.fn()
};

const playerId = 'playerId';

const webRTCMock = {
    move: jest.fn(),
    updateState: jest.fn(),
    updateWallBetween: jest.fn()
};

describe('AbstractGameplayScene', () => {
    let scene;

    beforeEach(() => {
        scene = new AbstractGameplayScene({ key: 'AbstractGameplayScene' });
        scene.socket = socketMock;
        scene.webRTC = webRTCMock;

        scene.add = {
            text: jest.fn().mockReturnValue({
                setOrigin: jest.fn().mockReturnThis(),
                destroy: jest.fn(),
                setScrollFactor: jest.fn().mockReturnThis(),
                setPadding: jest.fn().mockReturnThis(),
                setStyle: jest.fn().mockReturnThis(),
                setInteractive: jest.fn().mockReturnThis(),
                on: jest.fn().mockReturnThis(),
            }),
            sprite: jest.fn().mockReturnValue({
                displayHeight: 0,
                displayWidth: 0,
                setOrigin: jest.fn().mockReturnThis(),
                setAlpha: jest.fn(),
                setDepth: jest.fn(),
                destroy: jest.fn(),
            }),
            image: jest.fn().mockReturnValue({
                setOrigin: jest.fn().mockReturnThis(),
                destroy: jest.fn(),
            }),
        };

        scene.cameras = {
            main: {
                centerOn: jest.fn()
            }
        };

        scene.anims = {
            create: jest.fn(),
            generateFrameNumbers: jest.fn(),
            stop: jest.fn(),
            load: jest.fn()
        };

        scene.players[playerId] = {
            moving: false,
            colour: 0,
            x: 0,
            y: 0,
            setDepth: jest.fn(),
            anims: {
                load: jest.fn(),
                play: jest.fn(),
                stop: jest.fn(),
            },
            setFrame: jest.fn(),
            setFlipX: jest.fn(),
            setAlpha: jest.fn(),
        };

        scene.players[socketMock.id] = {
            moving: false,
            colour: 0,
            x: 0,
            y: 0,
            setDepth: jest.fn(),
            anims: {
                load: jest.fn(),
                play: jest.fn(),
                stop: jest.fn(),
            },
            setFrame: jest.fn(),
            setFlipX: jest.fn(),
            setAlpha: jest.fn(),
        };

        scene.playerNames[playerId] = {
            x: 0,
            y: 0,
            setTint: jest.fn(),
        };

        scene.playerNames[socketMock.id] = {
            x: 0,
            y: 0,
            setTint: jest.fn(),
        };

        scene.deadBodies[playerId] = {
            x: 0,
            y: 0,
        };

        scene.deadBodies[socketMock.id] = {
            x: 0,
            y: 0,
        };

        scene.audioIcons[playerId] = {
            x: 0,
            y: 0,
            setDepth: jest.fn(),
        };

        scene.audioIcons[socketMock.id] = {
            x: 0,
            y: 0,
            setDepth: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should be an instance of Phaser.Scene', () => {
        expect(scene).toBeInstanceOf(Scene);
    });

    test('movePlayer moving', () => {
        scene.updateLocalPlayerPosition = jest.fn();
        scene.stopLocalPlayer = jest.fn();
        scene.startLocalPlayer = jest.fn();

        const val = scene.movePlayer(2, 0, 0, true, false, false, false, PLAYER_STATE.crewmate);

        expect(val).toEqual(true);
        expect(scene.startLocalPlayer).toHaveBeenCalled();
        expect(scene.updateLocalPlayerPosition).toHaveBeenCalledWith(0, -2, 0);
    });

    test('movePlayer not moving', () => {
        scene.updateLocalPlayerPosition = jest.fn();
        scene.stopLocalPlayer = jest.fn();
        scene.startLocalPlayer = jest.fn();

        const val = scene.movePlayer(2, 0, 0, false, false, false, false, PLAYER_STATE.crewmate);

        expect(val).toEqual(undefined);
        expect(scene.stopLocalPlayer).toHaveBeenCalled(); 
        expect(scene.updateLocalPlayerPosition).not.toHaveBeenCalled();
    });

    test('movePlayer moving as ghost', () => {
        scene.updateLocalPlayerPosition = jest.fn();
        scene.stopLocalPlayer = jest.fn();
        scene.startLocalPlayer = jest.fn();
        
        const val = scene.movePlayer(2, 0, 0, true, false, false, false, PLAYER_STATE.ghost);

        expect(val).toEqual(true);
        expect(scene.startLocalPlayer).toHaveBeenCalled();
        expect(scene.updateLocalPlayerPosition).toHaveBeenCalledWith(0, -2, 0);
    });

    test('movePlayer not moving to wall', () => {
        scene.updateLocalPlayerPosition = jest.fn();
        scene.stopLocalPlayer = jest.fn();
        scene.startLocalPlayer = jest.fn();
        
        const val = scene.movePlayer(2, 0, 2, true, false, false, false, PLAYER_STATE.crewmate);

        expect(val).toEqual(true);
        expect(scene.startLocalPlayer).toHaveBeenCalled();
        expect(scene.updateLocalPlayerPosition).not.toHaveBeenCalledWith(0, 2, 0);
    });

    test('startMovingPlayer', () => {
        scene.startMovingPlayer(playerId);
        expect(scene.players[playerId].moving).toBe(true);
    });

    test('stopMovingPlayer', () => {
        scene.players[playerId].moving = true;
        scene.stopMovingPlayer(playerId);
        expect(scene.players[playerId].moving).toBe(false);
    });

    test('startLocalPlayer', () => {
        scene.startMovingPlayer = jest.fn();
        scene.startLocalPlayer();
        expect(scene.startMovingPlayer).toHaveBeenCalledWith(socketMock.id);
    });

    test('stopLocalPlayer', () => {
        scene.stopMovingPlayer = jest.fn();
        scene.players[socketMock.id].moving = true;
        scene.stopLocalPlayer();
        expect(scene.stopMovingPlayer).toHaveBeenCalledWith(socketMock.id);
        expect(scene.socket.emit).toHaveBeenCalledWith('moveStop');
    });

    test('updateLocalPlayerPosition', () => {
        const newX = 50;
        const newY = 50;
        const newVelocity = 1;
        scene.updatePlayerPosition = jest.fn();

        scene.updateLocalPlayerPosition(newX, newY, newVelocity);
        expect(scene.cameras.main.centerOn).toHaveBeenCalledWith(newX, newY);
        expect(scene.socket.emit).toHaveBeenCalledWith('move', { x: newX, y: newY, velocity: newVelocity });
        expect(scene.updatePlayerPosition).toHaveBeenCalledWith(newX, newY, scene.socket.id, newVelocity);
    });

    test('updatePlayerPosition', () => {
        const newX = 50;
        const newY = 50;
        const newVelocity = 1;
        
        scene.updatePlayerPosition(newX, newY, playerId, newVelocity);
        expect(scene.players[playerId].x).toEqual(newX);
        expect(scene.players[playerId].y).toEqual(newY);
        expect(scene.players[playerId].setDepth).toHaveBeenCalledWith(newY);
        expect(scene.webRTC.move).toHaveBeenCalledWith({id: playerId, x: newX, y: newY});
    });

    test('createPlayers', () => {
        scene.createSprite = jest.fn();
        scene.setPlayerImposter = jest.fn();
        scene.setPlayerGhost = jest.fn();

        scene.createPlayers(scene.players);

        expect(scene.createSprite).toHaveBeenCalledTimes(2);
        expect(scene.setPlayerImposter).toHaveBeenCalledTimes(2);
        expect(scene.setPlayerGhost).toHaveBeenCalledTimes(2);
    });

    test('createPlayer', () => {
        scene.createSprite = jest.fn();
        scene.setPlayerImposter = jest.fn();
        scene.setPlayerGhost = jest.fn();

        scene.createPlayer(scene.players[playerId]);

        expect(scene.createSprite).toHaveBeenCalledTimes(1);
        expect(scene.setPlayerImposter).toHaveBeenCalledTimes(1);
        expect(scene.setPlayerGhost).toHaveBeenCalledTimes(1);
    });

    test('createSprite and destroySprite', () => {
        const newPlayerObj = {
            x: 0,
            y: 0,
            id: 'newPlayerId',
            tasks: [],
            name: 'newPlayerName',
            colour: 0,
            playerState: PLAYER_STATE.crewmate,
        };

        scene.generateAnimations = jest.fn();
        scene.updateAnimationColour = jest.fn();

        scene.createSprite(newPlayerObj);
        expect(scene.playerNames[newPlayerObj.id]).toBeDefined();
        expect(scene.players[newPlayerObj.id]).toBeDefined();
        expect(scene.players[newPlayerObj.id].displayHeight).toEqual(PLAYER_HEIGHT/2);
        expect(scene.players[newPlayerObj.id].displayWidth).toEqual(PLAYER_WIDTH/2);
        expect(scene.players[newPlayerObj.id].playerState).toEqual(PLAYER_STATE.crewmate);
        expect(scene.deadBodies[newPlayerObj.id]).toBeDefined();
        expect(scene.deadBodies[newPlayerObj.id].displayHeight).toEqual(PLAYER_HEIGHT/2);
        expect(scene.deadBodies[newPlayerObj.id].displayWidth).toEqual(PLAYER_WIDTH/2);
        expect(scene.deadBodies[newPlayerObj.id].visible).toEqual(false);
        expect(scene.audioIcons[newPlayerObj.id]).toBeDefined();
        expect(scene.audioIcons[newPlayerObj.id].displayHeight).toEqual(PLAYER_HEIGHT/2);
        expect(scene.audioIcons[newPlayerObj.id].displayWidth).toEqual(PLAYER_WIDTH/2);
        expect(scene.audioIcons[newPlayerObj.id].visible).toEqual(false);

        scene.destroySprite(newPlayerObj.id);
        expect(scene.playerNames[newPlayerObj.id]).not.toBeDefined();
        expect(scene.players[newPlayerObj.id]).not.toBeDefined();
        expect(scene.deadBodies[newPlayerObj.id]).not.toBeDefined();
        expect(scene.audioIcons[newPlayerObj.id]).not.toBeDefined();
    });

    test('setPlayerImposter', () => {
        scene.players[socketMock.id].playerState = PLAYER_STATE.ghost;
        scene.players[playerId].playerState = PLAYER_STATE.imposter;

        scene.setPlayerImposter(playerId);
        expect(scene.playerNames[playerId].setTint).toHaveBeenCalledWith(0xff0000);
    });

    test('setPlayerGhost', () => {
        scene.players[socketMock.id].playerState = PLAYER_STATE.ghost;
        scene.players[playerId].playerState = PLAYER_STATE.ghost;

        scene.hidePlayer = jest.fn();
        scene.showPlayer = jest.fn();

        scene.setPlayerGhost(playerId);
        expect(scene.showPlayer).toHaveBeenCalledWith(playerId);
    });

    test('hidePlayer', () => {
        scene.players[playerId].visible = true;
        scene.playerNames[playerId].visible = true;

        scene.hidePlayer(playerId);

        expect(scene.players[playerId].visible).toEqual(false);
        expect(scene.playerNames[playerId].visible).toEqual(false);
    });

    test('showPlayer', () => {
        scene.players[playerId].visible = false;
        scene.playerNames[playerId].visible = false;

        scene.showPlayer(playerId);

        expect(scene.players[playerId].visible).toEqual(true);
        expect(scene.playerNames[playerId].visible).toEqual(true);
    });

    test('hideDeadBody', () => {
        scene.deadBodies[playerId].visible = true;
        scene.hideDeadBody(playerId);
        expect(scene.deadBodies[playerId].visible).toEqual(false);
    });

    test('showDeadBody', () => {
        scene.deadBodies[playerId].visible = false;
        scene.showDeadBody(playerId);
        expect(scene.deadBodies[playerId].visible).toEqual(true);
    });

    test('cleanDeadBody', () => {
        scene.deadBodies[playerId].x = 10;
        scene.deadBodies[playerId].y = 10;
        scene.deadBodies[playerId].available = true;

        scene.cleanDeadBody(playerId);

        expect(scene.deadBodies[playerId].x).toEqual(0);
        expect(scene.deadBodies[playerId].y).toEqual(0);
        expect(scene.deadBodies[playerId].available).toEqual(false);
    });

    test('spawnDeadBody', () => {
        scene.deadBodies[playerId].x = 0;
        scene.deadBodies[playerId].y = 0;
        scene.deadBodies[playerId].available = false;

        scene.spawnDeadBody(playerId, 10, 10);

        expect(scene.deadBodies[playerId].x).toEqual(10);
        expect(scene.deadBodies[playerId].y).toEqual(10);
        expect(scene.deadBodies[playerId].available).toEqual(true);
    });

    test('changeLocalPlayerToGhost', () => {
        scene.players[socketMock.id].playerState = PLAYER_STATE.crewmate;

        scene.changeLocalPlayerToGhost();

        expect(scene.players[socketMock.id].playerState).toEqual(PLAYER_STATE.ghost);
    });

    test('changePlayerToGhost', () => {
        scene.players[playerId].playerState = PLAYER_STATE.crewmate;

        scene.changePlayerToGhost(playerId);

        expect(scene.players[playerId].playerState).toEqual(PLAYER_STATE.ghost);
    });

    test('updatePlayerColour', () => {
        scene.updateAnimationColour = jest.fn();
        scene.players[playerId].colour = 0;

        scene.updatePlayerColour(1, playerId);

        expect(scene.players[playerId].colour).toEqual(1);
    });

    test('updateAnimationColour', () => {
        scene.updateAnimationColour(1, playerId);

        expect(scene.players[playerId].anims.stop).toHaveBeenCalled();
        expect(scene.players[playerId].anims.load).toHaveBeenCalled();
    });

    test('generateAnimations', () => {
        scene.generateAnimations(1, playerId);

        expect(scene.anims.create).toHaveBeenCalledTimes(COLOUR_NAMES.length);
    });

    test('wallBetween', () => {
        expect(scene.wallBetween(-2, 0, 2, 0, 1, 100)).toEqual(true);
        expect(scene.wallBetween(10, 10, 11, 11, 1, 100)).toEqual(false);
    });

    test('visionUpdate', () => {
        scene.wallBetween = jest.fn().mockReturnValue(false);
        scene.deadBodies[playerId].available = true;

        scene.visionUpdate(socketMock.id, 0, 0);

        expect(scene.wallBetween).toHaveBeenCalledTimes(2);
    });

    test('createMuteButton', () => {
        expect(scene.mute_button).not.toBeDefined();

        scene.createMuteButton();

        expect(scene.mute_button).toBeDefined();
    });
});
