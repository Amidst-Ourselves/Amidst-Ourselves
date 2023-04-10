import "jest-canvas-mock";
import Phaser from 'phaser';
import { Input, Scene, AUTO } from 'phaser';
import Imposter from '../amidstOurselvesGame/containers/imposter';
import { PLAYER_STATE } from '../amidstOurselvesGame/constants';

// Mock the PLAYER_STATE constant
jest.mock('../amidstOurselvesGame/constants', () => ({
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
    mockScene.updateLocalPlayerPosition = jest.fn();
    mockScene.time = {
        now: jest.fn().mockReturnThis(),
        addEvent: jest.fn()
          
      };
    // Create a new instance of the Imposter class with the mock scene object
    imposter = new Imposter(mockScene);
    imposter.create(socket);
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

  describe('update', () => {
    it('should update the player property correctly', () => {
      const player = { x: 40, y: 40, playerState: 'imposter' };
      imposter.update(player);
  
      expect(imposter.player).toBe(player);
    });
  });


  describe('kill', () => {
    it('should set player state to ghost and emit the kill event', () => {
  
      const players = {
        'socket-1': { x: 10, y: 10, playerState: 'crewmate' },
        'socket-2': { x: 20, y: 20, playerState: 'ghost' },
        'socket-3': { x: 30, y: 30, playerState: 'imposter' },
      };
  
      const deadBodies = {
        'socket-1': { x: 0, y: 0, visible: false },
        'socket-2': { x: 0, y: 0, visible: false },
        'socket-3': { x: 0, y: 0, visible: false },
      };
  
      const emitMock = jest.fn();
      imposter.socket.emit = emitMock;
      imposter.startCooldown = jest.fn();
  
      imposter.update(players[socket.id]);
      imposter.kill(players, deadBodies);
  
      expect(players['socket-1'].playerState).toBe('ghost');
      expect(emitMock).toHaveBeenCalledWith('kill', {
        id: 'socket-1',
        x: players['socket-1'].x,
        y: players['socket-1'].y,
      });
      expect(deadBodies['socket-1'].x).toBe(players['socket-1'].x);
      expect(deadBodies['socket-1'].y).toBe(players['socket-1'].y);
      expect(deadBodies['socket-1'].visible).toBe(true);
    });
  });


  describe('killWrapper', () => {
    it('should return the updated lastActionTime if enough time has passed and a kill has been made', () => {
        const players = {
          'socket-1': { x: 10, y: 10, playerState: 'crewmate' },
          'socket-2': { x: 20, y: 20, playerState: 'ghost' },
          'socket-3': { x: 30, y: 30, playerState: 'imposter' },
        };
      
        const deadBodies = {
          'socket-1': { x: 0, y: 0, visible: false },
          'socket-2': { x: 0, y: 0, visible: false },
          'socket-3': { x: 0, y: 0, visible: false },
        };
        
        const id = 'socket-1';
        const time = 5000;
        const lastActionTime = 1000;
        imposter.killCooldown = 4000;
        const expectedResult = time;
    
        imposter.update = jest.fn();
        imposter.kill = jest.fn().mockReturnValue(true);
      
        const result = imposter.killWrapper(time, lastActionTime, players, id, deadBodies);
      
        expect(result).toEqual(expectedResult);
      });

    it('should return the original lastActionTime if not enough time has passed or no kill has been made', () => {
        const players = {
          'socket-1': { x: 10, y: 10, playerState: 'crewmate' },
          'socket-2': { x: 20, y: 20, playerState: 'ghost' },
          'socket-3': { x: 30, y: 30, playerState: 'imposter' },
        };
      
        const deadBodies = {
          'socket-1': { x: 0, y: 0, visible: false },
          'socket-2': { x: 0, y: 0, visible: false },
          'socket-3': { x: 0, y: 0, visible: false },
        };
        
        const id = 'socket-1';
        const time = 2000;
        const lastActionTime = 1000;
        imposter.killCooldown = 4000;
        const expectedResult = lastActionTime;
    
        imposter.update = jest.fn();
        imposter.kill = jest.fn().mockReturnValue(false);
      
        const result = imposter.killWrapper(time, lastActionTime, players, id, deadBodies);
      
        expect(result).toEqual(expectedResult);
      });
  });

  describe('attemptKill', () => {
    it('should update lastActionTime when kill succeeds', () => {
      const players = {
        'socket-1': { x: 10, y: 10, playerState: 'crewmate' },
        'socket-2': { x: 20, y: 20, playerState: 'ghost' },
        'socket-3': { x: 30, y: 30, playerState: 'imposter' },
      };
    
      const deadBodies = {
        'socket-1': { x: 0, y: 0, visible: false },
        'socket-2': { x: 0, y: 0, visible: false },
        'socket-3': { x: 0, y: 0, visible: false },
      };
  
      imposter.killWrapper = jest.fn((time, lastActionTime, players, id, deadBodies) => {
        // Fake implementation of killWrapper that always succeeds
        return time;
      });
      mockScene.time = {
        now: 2000
      };
  
      imposter.lastActionTime = 1000;
      const expectedTime = 2000;
      imposter.attemptKill(players, deadBodies);
  
      expect(imposter.lastActionTime).toEqual(expectedTime);
      expect(imposter.killWrapper).toHaveBeenCalledTimes(1);
    });
  
    it('should not update lastActionTime when kill fails', () => {
      const players = {
        'socket-1': { x: 10, y: 10, playerState: 'crewmate' },
        'socket-2': { x: 20, y: 20, playerState: 'ghost' },
        'socket-3': { x: 30, y: 30, playerState: 'imposter' },
      };
    
      const deadBodies = {
        'socket-1': { x: 0, y: 0, visible: false },
        'socket-2': { x: 0, y: 0, visible: false },
        'socket-3': { x: 0, y: 0, visible: false },
      };

      imposter.killWrapper = jest.fn((time, lastActionTime, players, id, deadBodies) => {
        // Fake implementation of killWrapper that always fails
        return lastActionTime;
      });
  
      imposter.lastActionTime = 1000;
      const expectedTime = 1000;
      imposter.attemptKill(players, deadBodies);
  
      expect(imposter.lastActionTime).toEqual(expectedTime);
      expect(imposter.killWrapper).toHaveBeenCalledTimes(1);
    });
  });

    describe('createKillCooldown', () => {
        it('should create a countdown text with correct styles and visibility', () => {
            const players = {
                'socket-1': { playerState: PLAYER_STATE.imposter },
                'socket-2': { playerState: PLAYER_STATE.crewmate },
            };
            const socket = { id: 'socket-1' };

            mockScene.socket = socket;
            mockScene.players = players;
            const fakeObject = {
                visible: false
              };
            imposter.countdown = fakeObject;
            imposter.createKillCooldown();
        
            expect(mockScene.add.text).toHaveBeenCalledWith(500, 100, 'Kill Ready', { fontSize: '32px', fill: '#ffffff' });
        });
    });

    describe('startCooldown', () => {
        it('should start a cooldown timer only if "Kill Ready"', () => {
          imposter.killReady = false;
          imposter.countdown = {
            setText: jest.fn(),
          };
          imposter.startCooldown();
          expect(mockScene.time.addEvent).not.toHaveBeenCalled();
          expect(imposter.countdown.setText).not.toHaveBeenCalled();
          
          imposter.killReady = true;
          imposter.startCooldown();
          expect(mockScene.time.addEvent).toHaveBeenCalledWith({
            delay: 1000,
            repeat: 9,
            callback: expect.any(Function),
          });
          expect(imposter.countdown.setText).toHaveBeenCalledWith('10');
          expect(imposter.killReady).toBe(false);
        });
      });
});
