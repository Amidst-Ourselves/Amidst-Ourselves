import "jest-canvas-mock";
import Phaser from 'phaser';
import { Input, Scene, AUTO } from 'phaser';
import TaskManager from '../amidstOurselvesGame/containers/taskManager';
import { PLAYER_STATE } from '../amidstOurselvesGame/constants';

const WIDTH = 800

const HEIGHT = 600
const MAP_SCALE = 6
const FRAMES_PER_COLOUR =  11
const PLAYER_HEIGHT = 13*800/430
const MAP1_MINIMAP_PLAYER_HEIGHT = 13*800/430
const MAP1_MINIMAP_PLAYER_WIDTH = 13*13*800/430
const MAP1_TASKS = {
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
}
const TASK_SPRITE_HEIGHT = 7
const TASK_SPRITE_WIDTH = 7
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
  TASK_SPRITE_HEIGHT: 7,
  MAP1_TASK_MIN_DIST: 60,
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
  let tm;
  let game;
  let mockScene;
  let keyCode;
  let mockKeyCode, mockTotalTasks, mockTasksComplete, mockTaskCompleteCallback;

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

    mockScene = {
        input: {
          keyboard: {
            addKey: jest.fn(),
            on: jest.fn(),
          },
        },
      };
      mockKeyCode = Input.Keyboard.KeyCodes.SPACE;
      mockTotalTasks = 10;
      mockTasksComplete = 0;
      mockTaskCompleteCallback = jest.fn();
      tm = new TaskManager(mockScene, mockKeyCode, mockTotalTasks, mockTasksComplete, mockTaskCompleteCallback);
  });


  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('constructor', () => {
  
    it('should create a new Task instance', () => {
    expect(tm).toBeDefined();
    expect(tm.scene).toBe(mockScene);
    expect(tm.totalTasks).toBe(mockTotalTasks);
    expect(tm.tasksComplete).toBe(mockTasksComplete);
    expect(tm.taskCompleteCallback).toBe(mockTaskCompleteCallback);
    expect(tm.currentTaskName).toBeUndefined();
    expect(tm.taskInProgress).toBe(false);
    expect(tm.taskTimeRemaining).toBe(0);
    expect(tm.taskTimerText).toBeNull();
    expect(mockScene.input.keyboard.addKey).toHaveBeenCalledWith(mockKeyCode);
    expect(mockScene.input.keyboard.on).toHaveBeenCalledWith('keydown', tm.handleKeyDown, tm);
    expect(mockScene.input.keyboard.on).toHaveBeenCalledWith('keyup', tm.handleKeyUp, tm);
    expect(tm.taskAvailable).toBe(false);
    });
  });


  describe('create', () => {
    it('creates a taskbar and adds tasks', () => {
      const mockPlayer = {
        tasks: ['task1', 'task2'],
        colour: 0,
      };
  
      const mockGraphics = {
        fillStyle: jest.fn(),
        fillRect: jest.fn(),
        clear: jest.fn(),
        setScrollFactor: jest.fn().mockReturnValue({
            fillStyle: jest.fn(),
            fillRect: jest.fn(),
        }),
      };
      tm.updateTaskbar = jest.fn();
      tm.keyTask = {
        on: jest.fn(),
      }
  
      mockScene.add = {graphics: jest.fn().mockReturnValue(mockGraphics)};
  
      tm.create(mockPlayer);
  
      expect(mockScene.add.graphics).toHaveBeenCalledWith();
      expect(tm.tasks).toEqual({});
      expect(tm.player).toBe(mockPlayer);
    });
  });

  describe('addTask', () => {
    it('adds a task with the correct properties', () => {
    mockScene.add = {
          sprite: jest.fn().mockReturnThis(),
          text: jest.fn().mockReturnThis(),
        }
      const mockMapX = 100;
      const mockMapY = 200;
  
      const taskName = 'task1';
      tm.tasks = {};
      tm.addTask(taskName, mockMapX, mockMapY);
  
      expect(mockScene.add.sprite).toHaveBeenCalledWith(mockMapX * MAP_SCALE, mockMapY * MAP_SCALE, 'task');
      expect(tm.tasks[taskName].displayHeight).toBe(TASK_SPRITE_HEIGHT * MAP_SCALE);
      expect(mockScene.add.text).toHaveBeenCalledWith(mockMapX * MAP_SCALE, mockMapY * MAP_SCALE, taskName, { fontSize: '32px', fill: '#ffffff' });
    });
  });


  describe('remove', () => {
    it('remove a task with the correct properties', () => {
        mockScene.add = {
              sprite: jest.fn(() => ({
                displayHeight: 10,
                displayWidth: 10,
                destroy: jest.fn()
              })),
              text: jest.fn(() => ({
                destroy: jest.fn()
              })),
            }
    
          const taskName = 'testTask';
        
          // add the task to the list
          tm.tasks[taskName] = mockScene.add.sprite();
          tm.taskNames[taskName] = mockScene.add.text();
        
          expect(Object.keys(tm.tasks)).toContain(taskName);
          expect(Object.keys(tm.taskNames)).toContain(taskName);
        
          // remove the task from the list
          tm.removeTask(taskName);
        
          expect(Object.keys(tm.tasks)).not.toContain(taskName);
          expect(Object.keys(tm.taskNames)).not.toContain(taskName);
    });
  });

  describe('getTaskInfo', () => {
    it('should return an object with task info', () => {
      const mockTask1 = {
        x: 100,
        y: 200,
      };
      const mockTask2 = {
        x: 300,
        y: 400,
      };
      const mockTasks = {
        task1: mockTask1,
        task2: mockTask2,
      };
      tm.tasks = mockTasks;
  
      const result = tm.getTaskInfo();
  
      expect(result).toEqual({
        task1: {x: 100, y: 200},
        task2: {x: 300, y: 400},
      });
    });
  });

  describe('handleKeyDown', () => {
    it('starts a task timer when the "f" key is pressed and there is an available task', () => {
        mockScene.canMove = true;
        const mockText = {
        setScrollFactor: jest.fn(),
        setDepth: jest.fn(),
        };
    
        mockScene.add = {text: jest.fn().mockReturnValue(mockText)};
        mockScene.input = {
            keyboard: {
                on: jest.fn(),
            },
            }
        mockScene.time= {
            addEvent: jest.fn(),
            }
        tm.taskInProgress = false;
        tm.taskAvailable = true;
        tm.updateTaskTimer = jest.fn();
    
        tm.handleKeyDown({ key: 'f' });
    
        expect(tm.taskInProgress).toBe(true);
        expect(tm.taskTimeRemaining).toBe(3000);
        expect(mockScene.canMove).toBe(false);
        expect(mockScene.add.text).toHaveBeenCalledWith(250, 0, '3.0', { font: '16px Arial', fill: '#ffffff' });
        expect(mockScene.add.text().setScrollFactor).toHaveBeenCalledWith(0);
        expect(mockScene.add.text().setDepth).toHaveBeenCalledWith(1);
        expect(mockScene.time.addEvent).toHaveBeenCalledWith({ delay: 100, callback: tm.updateTaskTimer, callbackScope: tm, loop: true });
    });
  
    it('does not start a task timer when the "f" key is pressed but there is no available task', () => {
        mockScene.canMove = true;
        const mockText = {
        setScrollFactor: jest.fn(),
        setDepth: jest.fn(),
        };
    
        mockScene.add = {text: jest.fn().mockReturnValue(mockText)};
        mockScene.input = {
            keyboard: {
                on: jest.fn(),
            },
            }
        mockScene.time= {
            addEvent: jest.fn(),
            }

        tm.taskInProgress = false;
        tm.taskAvailable = false;
        tm.updateTaskTimer = jest.fn();
    
        tm.handleKeyDown({ key: 'f' });
    
        expect(tm.taskInProgress).toBe(false);
        expect(tm.taskTimeRemaining).toBe(0);
        expect(mockScene.canMove).toBe(true);
        expect(mockScene.time.addEvent).not.toHaveBeenCalled();
    });
  });


  describe('handleKeyUp', () => {
    it('should call taskCompleteCallback and reset task state when task is completed', () => {
        const mockCallback = jest.fn();
        mockScene.input = {
          keyboard: {
            on: jest.fn(),
          },
        }
        mockScene.canMove = true

        tm.taskInProgress = true;
        tm.currentTaskName = 'task1';
        tm.taskTimeRemaining = 0;
        tm.taskTimerText = {destroy: jest.fn()}
    
        tm.handleKeyUp({ key: 'f' });

        expect(tm.currentTaskName).toBeUndefined();
        expect(tm.taskInProgress).toBe(false);
        expect(tm.taskTimeRemaining).toBe(0);
        expect(tm.taskTimerText.destroy).toHaveBeenCalled();
        expect(mockScene.canMove).toBe(true);
    });
  });


  describe('updateTaskTimer', () => {

    beforeEach(() => {
        const mockText = {
            setScrollFactor: jest.fn(),
            setDepth: jest.fn(),
            setText:jest.fn(),
            };
        
        mockScene.add = {text: jest.fn().mockReturnValue(mockText)};
      });
  
    it('updates task time remaining and text', () => {
        tm.taskInProgress = true;
        tm.taskTimeRemaining = 3000;
        tm.taskTimerText = mockScene.add.text(0, 0, '');
        tm.updateTaskTimer();
        expect(tm.taskTimeRemaining).toBe(2900);
    });
  
    it('does not update time or text when no task in progress', () => {
        tm.taskTimeRemaining = 3000;
        tm.taskTimerText = mockScene.add.text(0, 0, '');
        tm.taskInProgress = false;
        const originalTimeRemaining = tm.taskTimeRemaining;
        const originalText = tm.taskTimerText.text;
        tm.updateTaskTimer();
        expect(tm.taskTimeRemaining).toBe(originalTimeRemaining);
        expect(tm.taskTimerText.text).toBe(originalText);
    });
  });


  describe('startTask', () => {
    it('should set the currentTaskName', () => {
      const taskName = 'task1';
      tm.startTask(taskName);
      expect(tm.currentTaskName).toBe(taskName);
    });
  });
  
  describe('finishTask', () => {
    it('should remove the task and increment the taskbar', () => {
      const taskName = 'task1';
      const increment = 1;
      mockScene.add = {
        sprite: jest.fn(() => ({
          displayHeight: 10,
          displayWidth: 10,
          destroy: jest.fn()
        })),
        text: jest.fn(() => ({
          destroy: jest.fn()
        })),
      }

      tm.tasksComplete = 0;
    //   tm.addTask(taskName, 0, 0);
    // add the task to the list
      tm.tasks[taskName] = mockScene.add.sprite();
      tm.taskNames[taskName] = mockScene.add.text();
      mockScene.add = {
        sprite: jest.fn(() => ({
          displayHeight: 10,
          displayWidth: 10,
          destroy: jest.fn()
        })),
        text: jest.fn(() => ({
          destroy: jest.fn()
        })),
      }
      tm.totalProgressBar = {clear: jest.fn(),
                        fillStyle: jest.fn(),
                        fillRect: jest.fn()};
      tm.finishTask(taskName);
      expect(tm.tasks[taskName]).toBeUndefined();
      expect(tm.taskNames[taskName]).toBeUndefined();
      expect(tm.tasksComplete).toBe(increment);
      expect(tm.totalProgressBar.fillStyle).toHaveBeenCalled();
    });
  });
  
  describe('finishAllTasks', () => {
    it('should call taskCompleteCallback for all tasks', () => {

        mockScene.add = {
            sprite: jest.fn(() => ({
              displayHeight: 10,
              displayWidth: 10,
              destroy: jest.fn()
            })),
            text: jest.fn(() => ({
              destroy: jest.fn()
            })),
          }
        const taskName1 = 'task1';
        const taskName2 = 'task2';
        tm.taskCompleteCallback = jest.fn();
        tm.addTask(taskName1, 0, 0);
        tm.addTask(taskName2, 0, 0);
        tm.finishAllTasks();
        expect(tm.taskCompleteCallback).toHaveBeenCalledWith(taskName1);
        expect(tm.taskCompleteCallback).toHaveBeenCalledWith(taskName2);
    });
  });
  
  describe('incrementTaskbar', () => {
    it('should increment tasksComplete and update taskbar', () => {
        mockScene.add = {
            sprite: jest.fn(() => ({
              displayHeight: 10,
              displayWidth: 10,
              destroy: jest.fn()
            })),
            text: jest.fn(() => ({
              destroy: jest.fn()
            })),
          }
        tm.totalProgressBar = {clear: jest.fn(),
            fillStyle: jest.fn(),
            fillRect: jest.fn()};
        tm.tasksComplete = 0;
        tm.incrementTaskbar();
        expect(tm.tasksComplete).toBe(1);
        expect(tm.totalProgressBar.fillStyle).toHaveBeenCalled();
    });
  });


  describe('findTask', () => {
    it('returns the name of the task if it is in range', () => {
      const player = {
        x: 100,
        y: 100
      }
      const task1 = {
        x: 100,
        y: 100
      }
      const task2 = {
        x: 200,
        y: 200
      }
      tm.player = player;
      tm.tasks = {
        'task1': task1,
        'task2': task2
      }
      expect(tm.findTask()).toBe('task1');
    });
  
    it('returns undefined if no task is in range', () => {
      const player = {
        x: 100,
        y: 100
      }
      const task1 = {
        x: 200,
        y: 200
      }
      const task2 = {
        x: 300,
        y: 300
      }
      tm.player = player;
      tm.tasks = {
        'task1': task1,
        'task2': task2
      }
      expect(tm.findTask()).toBeUndefined();
    });
  });
  
  describe('inRange', () => {
    it('returns true if the task is within range', () => {
      const player = {
        x: 100,
        y: 100
      }
      const taskX = 110;
      const taskY = 110;
      tm.player = player;
      expect(tm.inRange(taskX, taskY)).toBe(true);
    });
  });
  
  describe('manhattanDist', () => {
    it('returns the correct manhattan distance', () => {
      const x1 = 1;
      const y1 = 2;
      const x2 = 4;
      const y2 = 6;
      expect(tm.manhattanDist(x1, y1, x2, y2)).toBe(7);
    });
  });
});
