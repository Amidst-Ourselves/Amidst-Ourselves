import Phaser from 'phaser';
import Imposter from '../src/amidstOurselvesGame/containers/imposter';
import { PLAYER_STATE } from '../src/amidstOurselvesGame/constants';
console.log(PLAYER_STATE.ghost);

jest.mock('phaser', () => {
  const PLAYER_STATE = require('../src/amidstOurselvesGame/constants').PLAYER_STATE;
  const scene = {
    players: {
      'socket-1': { x: 10, y: 10, playerState: PLAYER_STATE.crewmate },
      'socket-2': { x: 20, y: 20, playerState: PLAYER_STATE.ghost },
      'socket-3': { x: 30, y: 30, playerState: PLAYER_STATE.imposter },
    }
  };
  return {
    GameObjects: {
      Container: class {},
    },
    Math: {
      abs: jest.fn(),
    },
    Scene: class {
      constructor(key) {
        this.key = key;
        this.players = scene.players;
      }
    },
    time: {
      addEvent: jest.fn(),
    },
  };
});

describe('Imposter', () => {
  let scene;
  let socket;
  let players;
  let deadBodies;
  let imposter;

  beforeEach(() => {
    scene = new Phaser.Scene('test');
    scene.players = {
      'socket-1': { x: 10, y: 10, playerState: PLAYER_STATE.crewmate },
      'socket-2': { x: 20, y: 20, playerState: PLAYER_STATE.ghost },
      'socket-3': { x: 30, y: 30, playerState: PLAYER_STATE.imposter },
    };
    socket = { id: 'socket-3' };
    players = {
      'socket-1': { x: 10, y: 10, playerState: PLAYER_STATE.crewmate },
      'socket-2': { x: 20, y: 20, playerState: PLAYER_STATE.ghost },
      'socket-3': { x: 30, y: 30, playerState: PLAYER_STATE.imposter },
    };
    deadBodies = {
      'socket-1': { x: 0, y: 0, visible: false },
      'socket-2': { x: 0, y: 0, visible: false },
      'socket-3': { x: 0, y: 0, visible: false },
    };
    imposter = new Imposter(scene, socket);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('constructor', () => {
    it('should set the initial state of the object', () => {
      expect(imposter.killCooldown).toBe(10000);
      expect(imposter.socket).toBe(socket);
      expect(imposter.lastActionTime).toBe(0);
      expect(imposter.countdown).toBeUndefined();
      expect(imposter.cooldownTimer).toBeUndefined();
      expect(imposter.killReady).toBe(true);
      expect(imposter.player).toBe(scene.players[socket.id]);
    });

    it('should create a kill cooldown', () => {
      imposter.createKillCooldown();

      expect(imposter.countdown).toBeDefined();
      expect(imposter.countdown.visible).toBe(true);
      expect(imposter.countdown.text).toBe('Kill Ready');
    });

    it('should hide the kill cooldown if the player is not the imposter', () => {
      scene.players[socket.id].playerState = PLAYER_STATE.crewmate;
      imposter.createKillCooldown();

      expect(imposter.countdown.visible).toBe(false);
    });
  });

  describe('update', () => {
    it('should update the player property', () => {
      imposter.update(players['socket-1']);

      expect(imposter.player).toBe(players['socket-1']);
    });
  });
});