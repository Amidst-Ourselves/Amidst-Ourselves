import "jest-canvas-mock";
import Phaser from 'phaser';
import { Input, Scene, AUTO } from 'phaser';
import NotificationManager from '../amidstOurselvesGame/containers/notificationManager';
import { PLAYER_STATE } from '../amidstOurselvesGame/constants';

const WIDTH = 800

const HEIGHT = 600
const MAP_SCALE = 6
const FRAMES_PER_COLOUR =  11
const PLAYER_HEIGHT = 13*800/430
const MAP1_MINIMAP_PLAYER_HEIGHT = 13*800/430
const MAP1_MINIMAP_PLAYER_WIDTH = 13*13*800/430
// Mock the PLAYER_STATE constant
jest.mock('../amidstOurselvesGame/constants', () => ({
  PLAYER_STATE: {
    crewmate: 'crewmate',
    ghost: 'ghost',
    imposter: 'imposter',
  },
  MAP1_MINIMAP_PLAYER_HEIGHT: 13*800/430,
  MAP1_MINIMAP_PLAYER_WIDTH: 13*13*800/430,
  MAP1_TASKS : {
    'upperEngine': {x: 75, y: 98},
    'lowerEngine': {x: 75, y: 227},
    'security': {x: 124, y: 148},
    'reactor': {x: 39, y: 193},
    'medbay': {x: 175, y: 162},
    'electrical': {x: 155, y: 189},
    'storage': {x: 243, y: 236},
    'o2': {x: 291, y: 153},
    'weapons': {x: 369, y: 84},
    'sheilds': {x: 323, y: 236},
    'admin': {x: 305, y: 174},
    'navigation': {x: 387, y: 156},
    'communications': {x: 274, y: 247},
    //'cafeteria': {x: 0, y: 0}
},
  WIDTH: 800,

  HEIGHT: 600,
  MAP_SCALE: 6,
  FRAMES_PER_COLOUR: 11,
  PLAYER_HEIGHT: 13*800/430,
  MAP1_MINIMAP_SCALE: 800/430,
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


// jest.mock('phaser', () => ({
//     __esModule: true,
//     GameObjects: {
//         Container: jest.fn(),
//     },
//     Scene: jest.fn(),
//     Input: {
//         Keyboard: {
//             addKey: jest.fn(),
//             KeyCodes: {
//                 D: 0,
//                 F: 1,
//                 J: 2,
//                 K: 3,
//                 M: 4,
//             },
//         },
//     },
// }));
jest.mock('phaser', () => ({
    __esModule: true,
    GameObjects: {
      Container: jest.fn(),
    },
    Scene: jest.fn(),
    Input: {
      Keyboard: {
        addKey: jest.fn(),
        KeyCodes: {
          D: 0,
          F: 1,
          J: 2,
          K: 3,
          M: 4,
        },
      },
    },
  }));

// Test the Imposter class
describe('minimap', () => {
  let scene;
  let socket;
  let nm;
  let game;
  let mockScene;
  let keyCode;

  beforeEach(() => { // add a done parameter to the beforeEach callback
    // Create a mock socket
    // Phaser.Input.Keyboard.addKey.mockClear();
    socket = { id: 'socket-3',
              emit: jest.fn() };
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
          name: 'a',
        },
        'socket-2': {
          x: 20,
          y: 20,
          playerState: 'ghost',
          name: 'b',
        },
        'socket-3': {
          x: 30,
          y: 30,
          playerState: 'imposter',
          name: 'c',
        }
    }
    mockScene.socket = {
        id: "socket-3",
        emit: jest.fn(),
    }

    const overlay = {
    //   fillColor: 0x000000, // Add default value
    //   alpha: 0.0,
    //   depth: 1,
      fillStyle: jest.fn((color) => {
        // console.log('fillStyle called with color', color);
        overlay.fillColor = color;
      }),
      fillRect: jest.fn(),
      setAlpha: jest.fn((alpha) => {
        overlay.alpha = alpha;
      }),
      setScrollFactor: jest.fn().mockReturnThis(),
      visible: jest.fn(()=>false),
      setDepth: jest.fn((depth)=>{overlay.depth = depth}),
    };

    const voting_board = {
      fillStyle: jest.fn(),
      fillRect: jest.fn(),
      setAlpha: jest.fn(),
      setScrollFactor: jest.fn().mockReturnThis(),
      visible: jest.fn(()=>false),
      setDepth: jest.fn(()=>voting_board),
      lineStyle: jest.fn(),
      fillRoundedRect: jest.fn(),
      strokeRoundedRect: jest.fn(),
      setScale: jest.fn(),
      setOrigin: jest.fn(()=>voting_board),
      player: jest.fn(),
      setInteractive: jest.fn(),
      on: jest.fn(),
    };

    const messageDisplay = {
      fillStyle: jest.fn(),
      fillRect: jest.fn(),
      setAlpha: jest.fn(),
      setScrollFactor: jest.fn().mockReturnThis(),
      visible: jest.fn(()=>false),
      setDepth: jest.fn(()=>voting_board),
      lineStyle: jest.fn(),
      fillRoundedRect: jest.fn(),
      strokeRoundedRect: jest.fn(),
      setScale: jest.fn(),
      setBackgroundColor: jest.fn().mockReturnThis(),
      setColor: jest.fn().mockReturnThis(),
      setOrigin: jest.fn(),
      on: jest.fn(),
    };

    mockScene.add = {
        text: jest.fn().mockReturnThis(),
        setScrollFactor: jest.fn().mockReturnThis(),
        setOrigin: jest.fn().mockReturnThis(),
        setPadding: jest.fn().mockReturnThis(),
        setBackgroundColor: jest.fn().mockReturnThis(),
        setColor: jest.fn(),
        setStyle: jest.fn(),
        graphics: jest.fn().mockReturnValueOnce(overlay)
                    .mockReturnValueOnce(voting_board)
                    .mockReturnValueOnce(voting_board)
                    .mockReturnValueOnce(voting_board),
        // graphics: jest.fn(()=>voting_board),
        container: jest.fn(()=>messageDisplay),
        sprite: jest.fn(()=>voting_board),
        setScale: jest.fn(),
        visible: jest.fn(),
        setDepth: jest.fn(),
        setDepth: jest.fn(()=>voting_board),
        setDepth: jest.fn(()=>messageDisplay),
        setInteractive: jest.fn(),
        on: jest.fn(),
        image: jest.fn(() => ({
            setOrigin: jest.fn(),
            setScale: jest.fn(),
            setAlpha: jest.fn(),
            setDepth: jest.fn(),
            setScrollFactor: jest.fn(),
          })),
      };
    mockScene.updateLocalPlayerPosition = jest.fn();
    mockScene.time = {
        now: jest.fn().mockReturnThis(),
        addEvent: jest.fn()
          
      };
    mockScene.cameras = {
      main: jest.fn().mockReturnThis(),
      centerX: jest.fn(),
      centerY: jest.fn(),
        
    };
    keyCode = Input.Keyboard.KeyCodes.M;
    mockScene.input = {
        keyboard: {
            addKey: jest.fn(() => ({
                on: jest.fn(),
              })),
        },
    }
    // Create a new instance of the Imposter class with the mock scene object
    nm = new NotificationManager(mockScene, 0, 0, 0);
  });


  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('constructor', () => {
    it('should set the correct properties', () => {
      const mockX = 100;
      const mockY = 200;
      const mockIncrementY = 10;
  
      nm = new NotificationManager(mockScene, mockX, mockY, mockIncrementY);
  
      expect(nm.scene).toBe(mockScene);
      expect(nm.x).toBe(mockX);
      expect(nm.y).toBe(mockY);
      expect(nm.incrementY).toBe(mockIncrementY);
      expect(nm.notifications).toEqual({});
    });
  });

  describe('addNotification', () => {
    const mockGenerateNotificationId = jest.fn(() => 'notification1');
    const mockIncrementY = 20;

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('adds a new notification and sets the timeout to destroy it after 5 seconds', () => {
        const notificationText = 'New notification message';
        const notifications = {};
        const mockNotification = {
            y: 0,
            destroy: jest.fn(),
        };
        notifications['notification1'] = mockNotification;

        mockScene.add = {
          text: jest.fn().mockReturnValue({
              setScrollFactor: jest.fn().mockReturnValue({
                destroy: jest.fn(),
              })
          }),
        }

        // const notificationsObj = new Notifications(mockScene, 0, 0, mockIncrementY, notifications, mockGenerateNotificationId);
        nm = new NotificationManager(mockScene, 0, 0, mockIncrementY);
        nm.notifications = notifications;
        nm.addNotification(notificationText);

        expect(mockScene.add.text).toHaveBeenCalledWith(0, 0, notificationText, { font: '15px Arial', fill: '#ff0000' });
        expect(mockNotification.y).toBe(mockIncrementY);

        // Check that the notification will be destroyed after 5 seconds
        jest.advanceTimersByTime(5000);
        expect(nm.notifications).toEqual(notifications);
    });
  });

  describe('generateNotificationId', () => {
    it('generates a unique ID', () => {
      const id1 = nm.generateNotificationId();
      const id2 = nm.generateNotificationId();
      expect(id1).not.toBe(id2);
    });
  });
});
