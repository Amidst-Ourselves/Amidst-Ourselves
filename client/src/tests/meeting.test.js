import "jest-canvas-mock";
import Phaser from 'phaser';
import { Input, Scene, AUTO } from 'phaser';
import Meeting from '../amidstOurselvesGame/containers/meeting';
import { PLAYER_STATE } from '../amidstOurselvesGame/constants';

const WIDTH = 800

const HEIGHT = 600
const MAP_SCALE = 6
const FRAMES_PER_COLOUR =  11
const PLAYER_HEIGHT = 13*800/430
// Mock the PLAYER_STATE constant
jest.mock('../amidstOurselvesGame/constants', () => ({
  PLAYER_STATE: {
    crewmate: 'crewmate',
    ghost: 'ghost',
    imposter: 'imposter',
  },
  WIDTH: 800,

  HEIGHT: 600,
  MAP_SCALE: 6,
  FRAMES_PER_COLOUR: 11,
  PLAYER_HEIGHT: 13*800/430,
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
describe('Meeting', () => {
  let scene;
  let socket;
  let meeting;
  let game;
  let mockScene ;

  beforeEach(() => { // add a done parameter to the beforeEach callback
    // Create a mock socket
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
      fillColor: 0x000000, // Add default value
      alpha: 0.0,
      depth: 1,
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

    mockScene.input= {
      keyboard: {
        on: jest.fn()
      }
    }

    mockScene.taskManager = {
      finishAllTasks: jest.fn()
    },
    mockScene.inMeeting = true
    
    // Create a new instance of the Imposter class with the mock scene object
    meeting = new Meeting(mockScene);
    meeting.filter = {
      isProfane: jest.fn().mockReturnValue(false)
    };
    meeting.inputMessageText = {
      setText: jest.fn()
    };
    meeting.messageDisplay = {
      visible: false
    };
    meeting.text_board = {
      visible: false
    };
    meeting.messageInput = {
      visible: false
    };
    meeting.create();
  });


  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('constructor', () => {
    it("creates an overlay graphics object", () => {
        expect(meeting.overlay).toBeDefined();
        expect(meeting.overlay.fillColor).toBe(0x000000);
        expect(meeting.overlay.alpha).toBe(0.7);
        expect(meeting.overlay.visible).toBe(false);
        expect(meeting.overlay.depth).toBe(HEIGHT * MAP_SCALE);
        expect(mockScene.input.keyboard.on).toHaveBeenCalledTimes(1);
        expect(mockScene.input.keyboard.on.mock.calls[0][0]).toBe('keydown');
      });
    
  });

  describe('show', () => {
    it("show meeting", () => {


      const button1 = {
        visible: false,
        player: {
          playerState: PLAYER_STATE.alive,
        },
      };
      const button2 = {
        visible: false,
        player: {
          playerState: PLAYER_STATE.ghost,
        },
      };

      meeting.votingButtons = [button1, button2];


      const player1 = {
        visible: false,
        player: {
          playerState: PLAYER_STATE.alive,
        },
      };
      const player2 = {
        visible: false,
        player: {
          playerState: PLAYER_STATE.ghost,
        },
      };
      meeting.playerSprites = [player1, player2];

      const tab1 = {
        visible: false,
        disableInteractive: jest.fn(),
        player: {
          playerState: PLAYER_STATE.alive,
        },
      };
      const tab2 = {
        visible: false,
        disableInteractive: jest.fn(),
        player: {
          playerState: PLAYER_STATE.ghost,
        },
      };
      meeting.vote_tabs = [tab1, tab2];

      const ghostReminder = {
        visible: false,
      };
      meeting.ghostReminder = ghostReminder;

      meeting.show();
      expect(mockScene.canMove).toBe(false);
      expect(meeting.overlay.visible).toBe(true);
      expect(meeting.voting_board.visible).toBe(true);
      expect(meeting.votingButtons[0].visible).toBe(true);
      expect(meeting.votingButtons[1].visible).toBe(false);
      expect(meeting.playerSprites[0].visible).toBe(true);
      expect(meeting.playerSprites[1].visible).toBe(false);
      expect(meeting.vote_tabs[0].visible).toBe(true);
      expect(meeting.vote_tabs[1].visible).toBe(false);
      expect(meeting.vote_tabs[0].disableInteractive).not.toHaveBeenCalled();
      expect(meeting.ghostReminder.visible).toBe(false);
      expect(meeting.scene.inMeeting).toBe(true);
      expect(meeting.scene.time.addEvent).toHaveBeenCalled();
      });
    
  });

  describe('hide', () => {
    it("hide meeting", () => {


      const button1 = {
        visible: false,
        player: {
          playerState: PLAYER_STATE.alive,
        },
      };
      const button2 = {
        visible: false,
        player: {
          playerState: PLAYER_STATE.ghost,
        },
      };

      meeting.votingButtons = [button1, button2];


      const player1 = {
        visible: false,
        player: {
          playerState: PLAYER_STATE.alive,
        },
      };
      const player2 = {
        visible: false,
        player: {
          playerState: PLAYER_STATE.ghost,
        },
      };
      meeting.playerSprites = [player1, player2];

      const tab1 = {
        visible: false,
        disableInteractive: jest.fn(),
        clearTint: jest.fn(),
        setInteractive: jest.fn(),
        player: {
          playerState: PLAYER_STATE.alive,
        },
      };
      const tab2 = {
        visible: false,
        disableInteractive: jest.fn(),
        clearTint: jest.fn(),
        setInteractive: jest.fn(),
        player: {
          playerState: PLAYER_STATE.ghost,
        },
      };
      meeting.vote_tabs = [tab1, tab2];

      const ghostReminder = {
        visible: false,
      };
      meeting.ghostReminder = ghostReminder;

      meeting.hide();
      expect(mockScene.canMove).toBe(true);
      expect(meeting.overlay.visible).toBe(false);
      expect(meeting.voting_board.visible).toBe(false);
      expect(meeting.votingButtons[0].visible).toBe(false);
      expect(meeting.votingButtons[1].visible).toBe(false);
      expect(meeting.playerSprites[0].visible).toBe(false);
      expect(meeting.playerSprites[1].visible).toBe(false);
      expect(meeting.vote_tabs[0].visible).toBe(false);
      expect(meeting.vote_tabs[1].visible).toBe(false);
      expect(meeting.vote_tabs[0].disableInteractive).not.toHaveBeenCalled();
      expect(meeting.ghostReminder.visible).toBe(false);
      expect(meeting.scene.inMeeting).toBe(false);
      expect(meeting.vote_tabs[0].clearTint).toHaveBeenCalled();
      expect(meeting.vote_tabs[0].setInteractive).toHaveBeenCalled();
      expect(meeting.vote_tabs[1].clearTint).toHaveBeenCalled();
      expect(meeting.vote_tabs[1].setInteractive).toHaveBeenCalled();
      });
    
  });

  describe('showConfirmationButtons', () => {
    it("showConfirmationButtons", () => {

      const confirmButton1 = {
        visible: false,
      };
      const confirmButton2 = {
        visible: false,
      };
      const cancelButton1 = {
        visible: false,
      };
      const cancelButton2 = {
        visible: false,
      };
      meeting.confirm_buttons = [confirmButton1, confirmButton2];
      meeting.cancel_buttons = [cancelButton1, cancelButton2];
      meeting.showConfirmationButtons(1);
      expect(confirmButton1.visible).toBe(false);
      expect(confirmButton2.visible).toBe(true);
      expect(cancelButton1.visible).toBe(false);
      expect(cancelButton2.visible).toBe(true);
    });
    
  });


  describe('hideConfirmationButtons', () => {
    it("hideConfirmationButtons", () => {

      const confirmButton1 = {
        visible: true,
      };
      const confirmButton2 = {
        visible: false,
      };
      const cancelButton1 = {
        visible: true,
      };
      const cancelButton2 = {
        visible: false,
      };
      meeting.confirm_buttons = [confirmButton1, confirmButton2];
      meeting.cancel_buttons = [cancelButton1, cancelButton2];
      meeting.hideConfirmationButtons(0);
      expect(confirmButton1.visible).toBe(false);
      expect(confirmButton2.visible).toBe(false);
      expect(cancelButton1.visible).toBe(false);
      expect(cancelButton2.visible).toBe(false);
    });
    
  });


  describe('updateVotes', () => {
    it("updateVotes", () => {

      const socket = {
        emit: jest.fn(),
      };
      const tab1 = {
        setTint: jest.fn(),
        disableInteractive: jest.fn(),
      };
      const tab2 = {
        setTint: jest.fn(),
        disableInteractive: jest.fn(),
      };
      const tab3 = {
        setTint: jest.fn(),
        disableInteractive: jest.fn(),
      };
      // const meeting = new MyClass({ socket }, {}, {}, [], [], [tab1, tab2, tab3], {});

      const player = { id: '123', name: 'Player 1' };
      meeting.vote_tabs = [tab1, tab2, tab3];
      meeting.hideConfirmationButtons = jest.fn();
      meeting.updateVotes(player, 1);
      expect(mockScene.socket.emit).toHaveBeenCalled();
      expect(tab1.setTint).not.toHaveBeenCalled();
      expect(tab1.disableInteractive).toHaveBeenCalled();
      expect(tab2.setTint).toHaveBeenCalledWith(0x808080);
      expect(tab2.disableInteractive).toHaveBeenCalled();
      expect(tab3.setTint).not.toHaveBeenCalled();
      expect(tab3.disableInteractive).toHaveBeenCalled();
      expect(meeting.hideConfirmationButtons).toHaveBeenCalled();
    
    });
    
  });


  describe('checkMeetingConditions', () => {
    it("checkMeetingConditions", () => {
      mockScene.eButton = {
        x: 200,
        y: 200,
      }

      mockScene.eButtonPressed = false;

      mockScene.deadBodies = [
        { x: 300, y: 300 },
        { x: 400, y: 400 },
      ]

      function distanceBetween(x,y,x1,y1) {
        return Math.abs(x-x1) + Math.abs(y-y1);
      }

      meeting.checkMeetingConditions = jest.fn(()=>{
        const player = mockScene.players[mockScene.socket.id];
        if (player.playerState == PLAYER_STATE.ghost) {
            return false;
        }
        if (distanceBetween(mockScene.eButton.x, mockScene.eButton.y, player.x, player.y) < 50 && !mockScene.eButtonPressed) {
          mockScene.eButtonPressed = true;
            return true;
        }
        for (const deadBody in mockScene.deadBodies) {
            if (distanceBetween(mockScene.deadBodies[deadBody].x, mockScene.deadBodies[deadBody].y, player.x, player.y) < 50) {
                return true;
            }
        }
        return false;
      });
      // Phaser.Math.Distance.Between = jest.fn(() => 40);
      // const meeting = new MyClass({}, scene, {}, [], [], [], {});
      expect(meeting.checkMeetingConditions()).toBe(false);
      mockScene.players[mockScene.socket.id].playerState = PLAYER_STATE.ghost;
      expect(meeting.checkMeetingConditions()).toBe(false);
      mockScene.players[mockScene.socket.id].playerState = PLAYER_STATE.alive;
      expect(meeting.checkMeetingConditions()).toBe(false);
      mockScene.players[mockScene.socket.id].x = 195;
      mockScene.players[mockScene.socket.id].y = 195;
      expect(meeting.checkMeetingConditions()).toBe(true);
      expect(mockScene.eButtonPressed).toBe(true);
      expect(meeting.checkMeetingConditions()).toBe(false);
      mockScene.players[mockScene.socket.id].x = 295;
      mockScene.players[mockScene.socket.id].y = 295;
      expect(meeting.checkMeetingConditions()).toBe(true);
      mockScene.players[mockScene.socket.id].x = 400;
      mockScene.players[mockScene.socket.id].y = 400;
      expect(meeting.checkMeetingConditions()).toBe(true);
      mockScene.players[mockScene.socket.id].x = 500;
      mockScene.players[mockScene.socket.id].y = 500;
      expect(meeting.checkMeetingConditions()).toBe(false);
    });
    
  });

  describe('showResult', () => {
    it("showResult", () => {
      mockScene.add = {
        text: jest.fn(() => {
          return {
            setScrollFactor: jest.fn(() => {
              return this;
            }),
            destroy: jest.fn(),
          };
        }),
      };
      mockScene.changeLocalPlayerToGhost = jest.fn();
      mockScene.changePlayerToGhost = jest.fn();
      mockScene.taskManager =  { finishAllTasks: jest.fn() };
      mockScene.time = { addEvent: jest.fn() };
      
      // Test the case when result is not null
      const mockTimer = { remove: jest.fn() };
      const mockText = { setScrollFactor: jest.fn(), destroy: jest.fn() };
      mockScene.time.addEvent.mockReturnValueOnce(mockTimer);
      mockScene.add.text.mockReturnValueOnce(mockText);
      meeting.showResult({ result: "socket-2" });
      expect(mockScene.players["socket-2"].name).toBe("b");
      expect(mockScene.changePlayerToGhost).toHaveBeenCalledWith("socket-2");
      expect(mockScene.add.text).toHaveBeenCalledWith(100, 200, "Player b is voted out", { fontSize: '32px', fill: '#ffffff' });
      expect(mockScene.time.addEvent).toHaveBeenCalledTimes(1);
      expect(mockTimer.remove).not.toHaveBeenCalled();
      expect(mockText.setScrollFactor).toHaveBeenCalledWith(0);
      expect(mockText.destroy).not.toHaveBeenCalled();
      
      // Test the case when result is null
      mockScene.add.text.mockClear();
      mockScene.time.addEvent.mockClear();
      meeting.showResult(null);
      expect(mockScene.add.text).toHaveBeenCalledWith(100, 200, "Nothing happened", { fontSize: '32px', fill: '#ffffff' });
      expect(mockScene.time.addEvent).toHaveBeenCalledTimes(1);
    });
    
  });



  describe('showTextChat', () => {
    it("showTextChat", () => {

    mockScene.input= {
        keyboard: {
          on: jest.fn()
        }
      }

      mockScene.taskManager = {
        finishAllTasks: jest.fn()
      },
      mockScene.inMeeting = true

      meeting.filter = {
        isProfane: jest.fn().mockReturnValue(false)
      };
      meeting.inputMessageText = {
        setText: jest.fn()
      };
      meeting.messageDisplay = {
        visible: false
      };
      meeting.text_board = {
        visible: false
      };
      meeting.messageInput = {
        visible: false
      };
    
      // Call function to be tested

      meeting.showTextChat();
    
      // Assert expected results
      expect(meeting.textOpened).toBe(true);
      expect(meeting.messageDisplay.visible).toBe(true);
      expect(meeting.text_board.visible).toBe(true);
      expect(meeting.messageInput.visible).toBe(true);
      expect(meeting.inputMessageText.visible).toBe(true);
    });
    
  });


  describe('hideText', () => {
    it("hideText", () => {

      mockScene.input = {
          keyboard: {
            removeListener: jest.fn()
          }
        }
      meeting.messageDisplay.visible = true;
      meeting.text_board.visible = true;
      meeting.messageInput.visible = true;
      meeting.inputMessageText.visible = true;
      meeting.keyboardListener = {
        visible: true
      };
      meeting.textOpened = true;
    
      meeting.hideText();
    
      expect(meeting.messageDisplay.visible).toBe(false);
      expect(meeting.text_board.visible).toBe(false);
      expect(meeting.messageInput.visible).toBe(false);
      expect(meeting.inputMessageText.visible).toBe(false);
      expect(meeting.keyboardListener.visible).toBe(false);
      expect(meeting.textOpened).toBe(false);
    });
    
  });


  describe('updateMessageDisplay', () => {
    it("updateMessageDisplay", () => {

      const mockMessageHistory = [    { user: "1234", message: "hello" },    { user: "5678", message: "hi there" },  ];
      const mockMessageDisplay = {
        removeAll: jest.fn(),
        add: jest.fn(),
      };
    
      // Set up the test scenario
      const textSpy = jest.spyOn(mockScene.add, "text");
      const removeAllSpy = jest.spyOn(mockMessageDisplay, "removeAll");
      const addSpy = jest.spyOn(mockMessageDisplay, "add");
      meeting.messageHistory = mockMessageHistory;
      meeting.messageDisplay = mockMessageDisplay;
    
      // Call the function to be tested
      meeting.updateMessageDisplay();
    
      // Check the expected results
      expect(removeAllSpy).toHaveBeenCalled();
      expect(textSpy).toHaveBeenCalledTimes(9);
      expect(addSpy).toHaveBeenCalledTimes(2);
    
      for (let i = 0; i < 9; i++) {
        const messageText = textSpy.mock.results[i].value;
        expect(messageText.setScrollFactor).toHaveBeenCalledWith(0);
        expect(messageText.setDepth).toHaveBeenCalledWith(HEIGHT * MAP_SCALE + 5);
      }
    });
    
  });

  describe('addMessage', () => {
    it("addMessage", () => {
      const messageHistory = [];

      // Create a mock object for the updateMessageDisplay function
      const updateMessageDisplay = jest.fn();
    
      // Create a test instance of the Chat class with the mock objects
      meeting.messageHistory = messageHistory,
      meeting.updateMessageDisplay = updateMessageDisplay
  
    
      // Call the addMessage function with a user and a message
      const user = "test_user";
      const message = "test_message";
      meeting.addMessage(user, message);
    
      // Check that a new message object has been added to the message history array
      expect(messageHistory).toHaveLength(1);
      expect(messageHistory[0].user).toBe(user);
      expect(messageHistory[0].message).toBe(message);
    
      // Check that the updateMessageDisplay function has been called
      expect(updateMessageDisplay).toHaveBeenCalled();
    });
    
  });


  describe('updateScene', () => {
    it("updateScene", () => {
      const mockScene = jest.fn();
      meeting.updateScene(mockScene);
      expect(meeting.scene).toBe(mockScene);
    });
    
  });


  describe('updateScene', () => {
    it("updateScene", () => {
      meeting.hide = jest.fn();
      meeting.hideText = jest.fn();
      meeting.meetingTimer = { remove: jest.fn() };
      meeting.countdownText = { visible: true };
      meeting.endMeeting();
      expect(meeting.hide).toHaveBeenCalled();
      expect(meeting.hideText).toHaveBeenCalled();
      expect(meeting.meetingTimer.remove).toHaveBeenCalled();
      expect(meeting.countdownText.visible).toBeFalsy();
    });
    
  });
});
