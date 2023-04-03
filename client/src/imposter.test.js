import "jest-canvas-mock";
import Phaser from 'phaser';
import { Input, Scene, AUTO } from 'phaser';
import Imposter from '../src/amidstOurselvesGame/containers/imposter';
import { PLAYER_STATE } from '../src/amidstOurselvesGame/constants';

// Mock the PLAYER_STATE constant
jest.mock('../src/amidstOurselvesGame/constants', () => ({
  PLAYER_STATE: {
    crewmate: 'crewmate',
    ghost: 'ghost',
    imposter: 'imposter',
  },
}));

class MyScene extends Scene {
    constructor() {
      super('my-scene');
    }
  
    create() {
      // create an object to store players' data
      this.players = {};
    
      // add players to the object with their socket IDs as keys and their data as values
      this.players['socket-1'] = {
        x: 10,
        y: 10,
        playerState: 'crewmate',
      };
      this.players['socket-2'] = {
        x: 20,
        y: 20,
        playerState: 'ghost',
      };
      this.players['socket-3'] = {
        x: 30,
        y: 30,
        playerState: 'imposter',
      };
    }
  
    update() {
      // update game state
    }
  }


jest.mock('phaser', () => ({
    __esModule: true,
    GameObjects: {
        Container: jest.fn(),
    },
    Scene: jest.fn(),
    Input: {
        Keyboard: {
        KeyCodes: {
            D: 0,
            F: 1,
            J: 2,
            K: 3,
        },
        },
    },
}));
// const game = new Phaser.Game(config);

// Test the Imposter class
describe('Imposter', () => {
  let scene;
  let socket;
  let imposter;
  let game;
  let mockScene ;

  beforeEach(() => { // add a done parameter to the beforeEach callback
    // Create a mock socket
    socket = { id: 'socket-3' };
    mockScene = new Scene({
        init: jest.fn(),
        preload: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        players: {
          'socket-1': {
            x: 10,
            y: 10,
            playerState: 'crewmate',
          },
          'socket-2': {
            x: 20,
            y: 20,
            playerState: 'ghost',
          },
          'socket-3': {
            x: 30,
            y: 30,
            playerState: 'imposter',
          },
        },
        add: jest.fn(() => ({
            setScrollFactor: jest.fn(),
            setOrigin: jest.fn(),
            setPadding: jest.fn(),
            setStyle: jest.fn(),
          })),
        events: {
          once: jest.fn(),
        },
      });

    mockScene.players = {
        'socket-1': {
          x: 10,
          y: 10,
          playerState: 'crewmate',
        },
        'socket-2': {
          x: 20,
          y: 20,
          playerState: 'ghost',
        },
        'socket-3': {
          x: 30,
          y: 30,
          playerState: 'imposter',
        }
    }
    mockScene.socket = {
        id: "socket-3"
    }

    mockScene.add = {
        text: jest.fn().mockReturnThis(),
        setScrollFactor: jest.fn().mockReturnThis(),
        setOrigin: jest.fn().mockReturnThis(),
        setPadding: jest.fn().mockReturnThis(),
        setStyle: jest.fn(),
      };
    // Create a new instance of the Imposter class with the mock scene object
    console.log(mockScene.players);
    imposter = new Imposter(mockScene, socket);
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
      expect(imposter.player).toBe(mockScene.players[socket.id]);
    });
  });
});
