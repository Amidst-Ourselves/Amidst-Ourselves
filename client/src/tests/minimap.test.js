import "jest-canvas-mock";
import Phaser from 'phaser';
import { Input, Scene, AUTO } from 'phaser';
import MiniMap from '../amidstOurselvesGame/containers/minimap';
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
  let minimap;
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
    minimap = new MiniMap(mockScene, keyCode);
  });


  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('constructor', () => {
    it("minimap", () => {
        expect(mockScene.input.keyboard.addKey).toHaveBeenCalledWith(keyCode);
        expect(minimap.keyMiniMap).toBeDefined();
      });
  });

  describe('create', () => {
    it("create", () => {
        const mockPlayer = {
            tasks: ['task1', 'task2'],
            colour: 0,
          };

        minimap.overlay = {
            fillStyle: jest.fn(),
            fillRect: jest.fn(),
            setAlpha: jest.fn(),
            setDepth: jest.fn(),
            setScrollFactor: jest.fn(),
            setVisible: jest.fn(),
        };

        minimap.miniMap = {
            fillStyle: jest.fn(),
            fillRect: jest.fn(),
            setAlpha: jest.fn(),
            setDepth: jest.fn(),
            setScrollFactor: jest.fn(),
            setVisible: jest.fn(),
            setScale: jest.fn(),
            setDisplayHeight: jest.fn(),
            setDisplayWidth: jest.fn(),
        };

        minimap.miniMapPlayer = {
            fillStyle: jest.fn(),
            fillRect: jest.fn(),
            setAlpha: jest.fn(),
            setDepth: jest.fn(),
            setScrollFactor: jest.fn(),
            setVisible: jest.fn(),
            setDisplayHeight: jest.fn(),
            setDisplayWidth: jest.fn(),
        };
        
        minimap.create(mockPlayer, 'playerKey', 'mapKey');

        expect(mockScene.add.graphics).toHaveBeenCalledTimes(1);
        expect(minimap.overlay.setAlpha).toHaveBeenCalledWith(0.7);
        expect(minimap.overlay.setDepth).toHaveBeenCalledWith(HEIGHT * MAP_SCALE);
        expect(minimap.overlay.setScrollFactor).toHaveBeenCalledWith(0);
        expect(minimap.overlay.visible).toBe(false);

        expect(mockScene.add.image).toHaveBeenCalledTimes(1);
        expect(minimap.miniMap.setOrigin).toHaveBeenCalledWith(0, 0);
        expect(minimap.miniMap.setScale).toHaveBeenCalledWith(800/430);
        expect(minimap.miniMap.setAlpha).toHaveBeenCalledWith(0.7);
        expect(minimap.miniMap.setDepth).toHaveBeenCalledWith(HEIGHT * MAP_SCALE + 1);
        expect(minimap.miniMap.setScrollFactor).toHaveBeenCalledWith(0);
        expect(minimap.miniMap.visible).toBe(false);
    
        expect(mockScene.add.sprite).toHaveBeenCalledTimes(1);
        expect(minimap.miniMapPlayer.setOrigin).toHaveBeenCalledWith(0.5, 1);
        expect(minimap.miniMapPlayer.displayHeight).toBe(MAP1_MINIMAP_PLAYER_HEIGHT);
        expect(minimap.miniMapPlayer.displayWidth).toBe(MAP1_MINIMAP_PLAYER_WIDTH);
        expect(minimap.miniMapPlayer.setDepth).toHaveBeenCalledWith(HEIGHT * MAP_SCALE + 2);
        expect(minimap.miniMapPlayer.setScrollFactor).toHaveBeenCalledWith(0);
        expect(minimap.miniMapPlayer.visible).toBe(false);
        
      });
  });


  describe('addTask', () => {
    it("addTask", () => {
        const mockPlayer = {
            tasks: ['task1', 'task2'],
            colour: 0,
          };

        minimap.overlay = {
            fillStyle: jest.fn(),
            fillRect: jest.fn(),
            setAlpha: jest.fn(),
            setDepth: jest.fn(),
            setScrollFactor: jest.fn(),
            setVisible: jest.fn(),
        };

        minimap.miniMap = {
            fillStyle: jest.fn(),
            fillRect: jest.fn(),
            setAlpha: jest.fn(),
            setDepth: jest.fn(),
            setScrollFactor: jest.fn(),
            setVisible: jest.fn(),
            setScale: jest.fn(),
            setDisplayHeight: jest.fn(),
            setDisplayWidth: jest.fn(),
        };

        minimap.miniMapPlayer = {
            fillStyle: jest.fn(),
            fillRect: jest.fn(),
            setAlpha: jest.fn(),
            setDepth: jest.fn(),
            setScrollFactor: jest.fn(),
            setVisible: jest.fn(),
            setDisplayHeight: jest.fn(),
            setDisplayWidth: jest.fn(),
        };
        
        minimap.scene.add.graphics = jest.fn(() => ({
            fillStyle: jest.fn(() => ({
              fillCircle: jest.fn(),
            })),
            fillCircle: jest.fn(),
            setDepth: jest.fn(),
            setScrollFactor: jest.fn(),
            setVisible: jest.fn(),
          }));
          const taskName = 'task1';
          const mapX = 50;
          const mapY = 60;
        
          minimap.addTask(taskName, mapX, mapY);
        
          expect(minimap.miniMapTasks[taskName]).toBeDefined();
          expect(minimap.miniMapTasks[taskName].setDepth).toHaveBeenCalledWith(HEIGHT * MAP_SCALE + 2);
          expect(minimap.miniMapTasks[taskName].setScrollFactor).toHaveBeenCalledWith(0);
          expect(minimap.miniMapTasks[taskName].visible).toBe(false);
        
      });
  });
  describe('finishTask', () => {
    it('should destroy the miniMapTask with the given taskName', () => {
      const mockMiniMapTask = { destroy: jest.fn() };
      const mockMiniMapTasks = { task1: mockMiniMapTask, task2: mockMiniMapTask };
  
      minimap.miniMapTasks = mockMiniMapTasks;
      minimap.finishTask('task1');
  
      expect(mockMiniMapTask.destroy).toHaveBeenCalled();
      expect(minimap.miniMapTasks.task1).toBeUndefined();
      expect(minimap.miniMapTasks.task2).toEqual(mockMiniMapTask);
    });
  });

    describe('toggleMiniMap', () => {
        it('toggles visibility of minimap and overlay', () => {

            minimap.overlay = { visible: false };
            minimap.miniMap = { visible: false };
            minimap.miniMapPlayer = { visible: false };
            minimap.miniMapTasks = {
                task1: { visible: false },
                task2: { visible: false }
            };

            minimap.toggleMiniMap();

            expect(minimap.overlay.visible).toBe(true);
            expect(minimap.miniMap.visible).toBe(true);
            expect(minimap.miniMapPlayer.visible).toBe(true);
            expect(minimap.miniMapTasks.task1.visible).toBe(true);
            expect(minimap.miniMapTasks.task2.visible).toBe(true);

            minimap.toggleMiniMap();

            expect(minimap.overlay.visible).toBe(false);
            expect(minimap.miniMap.visible).toBe(false);
            expect(minimap.miniMapPlayer.visible).toBe(false);
            expect(minimap.miniMapTasks.task1.visible).toBe(false);
            expect(minimap.miniMapTasks.task2.visible).toBe(false);
        });
    });

    describe('update', () => {
        it('updates miniMapPlayer position', () => {
            const mockPlayer = {
                x: 200,
                y: 300,
            };
            const mockMiniMapPlayer = {
                x: 0,
                y: 0,
            };
    
            minimap.player = mockPlayer;
            minimap.miniMapPlayer = mockMiniMapPlayer;
            minimap.update();
    
            expect(mockMiniMapPlayer.x).toBe(62);
            expect(mockMiniMapPlayer.y).toBe(93);
        });
    });
});
