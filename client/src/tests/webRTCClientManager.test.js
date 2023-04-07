import "jest-canvas-mock";
import Phaser from 'phaser';
import { Input, Scene, AUTO } from 'phaser';
import webRTCClientManager from '../amidstOurselvesGame/webRTCClientManager';
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

const USE_AUDIO = true;
const USE_VIDEO = false;

const MUTE_AUDIO_BY_DEFAULT = false;
const ICE_SERVERS = [
    {urls:"stun:stun.l.google.com:19302"}
];
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
describe('webRTC', () => {
  let scene;
  let socket;
  let webRTC;
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
      webRTC = new webRTCClientManager();
  });


  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('init', () => {
    it('should initialize variables correctly', () => {
      const roomObj = { roomCode: 'ABC123' };
      const socket = 'socketMock';
  
      const instance = {};
  
      webRTC.init(roomObj,socket)
  
      expect(webRTC.signaling_socket).toBe(socket);
      expect(webRTC.local_media_stream).toBeNull();
      expect(webRTC.peers).toEqual({});
      expect(webRTC.peer_media_elements).toEqual({});
      expect(webRTC.roomCode).toBe(roomObj.roomCode);
      expect(webRTC.roomObj).toBe(roomObj);
      expect(webRTC.my_pos).toEqual({});
      expect(webRTC.my_x).toBeNull();
      expect(webRTC.my_y).toBeNull();
      expect(webRTC.isMicrophoneOn).toBe(true);
      expect(webRTC.mute_flag).toBe(true);
      expect(webRTC.playerStates).toEqual({});
      expect(webRTC.wallBetween).toEqual({});
    });
  });

  describe('create', () => {
    it('calls signaling socket methods with correct arguments', () => {
        const signaling_socket = {
            on: jest.fn(),
            emit: jest.fn()
          };
          const roomCode = 'abc123';
          const handleMyPos = jest.fn();
          const handleSessionDescription = jest.fn();
          const handleIceCandidate = jest.fn();
          const handleRemovePeer = jest.fn();
          const setUpMedia = jest.fn(callback => callback());
          const handleMyPosMock = jest.fn();
          const joinChatRoomMock = jest.fn();
          const handleSessionDescriptionMock = jest.fn();
          const handleIceCandidateMock = jest.fn();
          const handleRemovePeerMock = jest.fn();
        

          webRTC.init({ roomCode }, signaling_socket);
          webRTC.handleMyPos = handleMyPos;
          webRTC.handleSessionDescription = handleSessionDescription;
          webRTC.handleIceCandidate = handleIceCandidate;
          webRTC.handleRemovePeer = handleRemovePeer;
          webRTC.setUpMedia = setUpMedia;
          webRTC.signaling_socket = signaling_socket;
          webRTC.roomCode = roomCode;
          webRTC.handleMyPos = handleMyPosMock;
          webRTC.joinChatRoom = joinChatRoomMock;
          webRTC.handleSessionDescription = handleSessionDescriptionMock;
          webRTC.handleIceCandidate = handleIceCandidateMock;
          webRTC.handleRemovePeer = handleRemovePeerMock;
        
          webRTC.create();
        
          expect(signaling_socket.on).toHaveBeenCalledWith('my_pos2', expect.any(Function));
          expect(joinChatRoomMock).toHaveBeenCalledWith(roomCode);
          expect(signaling_socket.on).toHaveBeenCalledWith('sessionDescription', expect.any(Function));
          expect(signaling_socket.on).toHaveBeenCalledWith('iceCandidate', expect.any(Function));
          expect(signaling_socket.on).toHaveBeenCalledWith('removePeer', expect.any(Function));
    });
  });


  describe('handleMyPos', () => {
    it('handleMyPos', () => {
        const playerObj = { id: 'player1', x: 10, y: 20 };
        webRTC.my_pos = playerObj
      
        webRTC.handleMyPos(playerObj);
      
        expect(webRTC.my_pos[playerObj.id]).toEqual({ x: playerObj.x, y: playerObj.y });
    });
  });

  describe('joinChatRoom', () => {
    it('joinChatRoom', () => {

        const roomCode = 'room123';
        const signaling_socket = {
          emit: jest.fn()
        };
        webRTC.signaling_socket = signaling_socket;
      
        webRTC.joinChatRoom(roomCode);
      
        expect(signaling_socket.emit).toHaveBeenCalledWith('webRTC_join', { roomCode });
    });
  });

  describe('handleSessionDescription', () => {
        it('handleSessionDescription', () => {
            // create a mock config object
        const config = {
            peer_id: 'some_peer_id',
            session_description: {
                type: '',
                sdp: 'some_sdp'
            }
        };

        // create mock RTCSessionDescription and RTCPeerConnection objects
        global.RTCSessionDescription = jest.fn(() => ({
            type: config.session_description.type,
            sdp: config.session_description.sdp
        }));
        const setRemoteDescriptionMock = jest.fn();
        const createAnswerMock = jest.fn();
        const setLocalDescriptionMock = jest.fn();
        const peerMock = {
            setRemoteDescription: setRemoteDescriptionMock,
            createAnswer: createAnswerMock,
            setLocalDescription: setLocalDescriptionMock
        };
        const peersMock = {
            [config.peer_id]: peerMock
        };
        const signaling_socketMock = {
            emit: jest.fn()
        };
        const roomCodeMock = 'some_room_code';

        // create an instance of the WebRTC class
        webRTC.peers = peersMock;
        webRTC.signaling_socket = signaling_socketMock;
        webRTC.roomCode = roomCodeMock;

        // call the function being tested
        webRTC.handleSessionDescription(config);

        // assert that the RTCSessionDescription constructor was called
        expect(global.RTCSessionDescription).toHaveBeenCalledWith(config.session_description);

        expect(setRemoteDescriptionMock).toHaveBeenCalled();
        expect(createAnswerMock).not.toHaveBeenCalled();
        expect(setLocalDescriptionMock).not.toHaveBeenCalled();
    });
  });

  describe('handleIceCandidate', () => {
    // beforeEach(() => {
    //   jest.clearAllMocks();
    // });
  
    test('handleIceCandidate should call addIceCandidate on the corresponding peer', () => {
        // Create a mock RTCIceCandidate object
        global.RTCIceCandidate = jest.fn();
        
        // Set up the test
        const peerId = 'some_peer_id';
        const iceCandidate = { candidate: 'some_candidate' };
        const config = { peer_id: peerId, ice_candidate: iceCandidate };
        const peerMock = { addIceCandidate: jest.fn() };
        const peersMock = { [peerId]: peerMock };
        webRTC.peers = peersMock;
      
        // Call the function being tested
        webRTC.handleIceCandidate(config);
      
        // Assert that addIceCandidate was called on the peer object
        expect(peerMock.addIceCandidate).toHaveBeenCalledWith(expect.any(RTCIceCandidate));
      });
  
    test('handles error', () => {
      console.error = jest.fn();
      const config = {};
  
      webRTC.handleIceCandidate(config);
  
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  // Test cases for the handleRemovePeer function
  describe('handleRemovePeer', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    test('handleRemovePeer removes peer from peers and peer_media_elements objects', () => {
        const config = { peer_id: 'test_peer_id' };
        const peerMock = { close: jest.fn() };
        const removeMock = jest.fn();
        const peerMediaElementsMock = { [config.peer_id]: { remove: removeMock } };
        const myPosMock = { [config.peer_id]: {} };
        
        webRTC.peers = { ...webRTC.peers, [config.peer_id]: peerMock };
        webRTC.peer_media_elements = peerMediaElementsMock;
        webRTC.my_pos = myPosMock;
        
        webRTC.handleRemovePeer(config);
        
        expect(removeMock).toHaveBeenCalled();
        expect(webRTC.peers[config.peer_id]).toBeUndefined();
        expect(webRTC.peer_media_elements[config.peer_id]).toBeUndefined();
        expect(webRTC.my_pos[config.peer_id]).toBeUndefined();
        expect(peerMock.close).toHaveBeenCalled();
      });
  });

    describe('update', () => {
        test('update adds new peer connection and sends offer if should_create_offer is true', () => {
            const signalingSocketOnMock = jest.fn();
            const peerConnectionMock = {
            createOffer: jest.fn(),
            setLocalDescription: jest.fn(),
            addTrack: jest.fn(),
            onicecandidate: jest.fn(),
            ontrack: jest.fn(),
            close: jest.fn(),
            };
            const addIceCandidateMock = jest.fn();
            const createElementMock = jest.fn(() => ({
            setAttribute: jest.fn(),
            muted: true,
            }));
            const appendChildMock = jest.fn();
            const attachMediaStreamMock = jest.fn();
            const removeMock = jest.fn();
            const setAttributeMock = jest.fn();
            const localMediaStreamMock = {
            getTracks: jest.fn(() => [{ kind: 'audio' }]),
            };
        
            global.RTCPeerConnection = jest.fn(() => peerConnectionMock);
            global.RTCSessionDescription = jest.fn(() => ({}));
            global.RTCIceCandidate = jest.fn(() => ({}));
            document.createElement = createElementMock;
            document.getElementById = jest.fn(() => ({ appendChild: appendChildMock }));
            document.querySelector = jest.fn(() => ({ remove: removeMock }));
            HTMLAudioElement.prototype.setAttribute = setAttributeMock;
            webRTC.signaling_socket = { on: signalingSocketOnMock };
            webRTC.roomCode = 'test_room_code';
            webRTC.local_media_stream = localMediaStreamMock;
            webRTC.attachMediaStream = attachMediaStreamMock;
            webRTC.reset = jest.fn();
        
            webRTC.update();
        
            expect(signalingSocketOnMock).toHaveBeenCalledWith('addPeer', expect.any(Function));
        
            const addPeerCallback = signalingSocketOnMock.mock.calls[0][1];
            const config = {
            peer_id: 'test_peer_id',
            should_create_offer: true,
            };
            
            addPeerCallback(config, (session_description) => {
            expect(peerConnectionMock.createOffer).toHaveBeenCalled();
            expect(peerConnectionMock.setLocalDescription).toHaveBeenCalledWith(
                expect.any(RTCSessionDescription),
                expect.any(Function),
                expect.any(Function)
            );
            expect(peerConnectionMock.setLocalDescription.mock.calls[0][0].type).toBe('offer');
            expect(webRTC.peers).toHaveProperty(config.peer_id, peerConnectionMock);
            expect(peerConnectionMock.addTrack).toHaveBeenCalledWith({ kind: 'audio' }, localMediaStreamMock);
            expect(signalingSocketMock.emit).toHaveBeenCalledWith('relaySessionDescription', expect.any(Object));
            expect(createElementMock).toHaveBeenCalledWith('audio');
            expect(setAttributeMock).toHaveBeenCalledWith('autoplay', 'autoplay');
            expect(setAttributeMock).toHaveBeenCalledWith('muted', 'true');
            expect(setAttributeMock).toHaveBeenCalledWith('controls', '');
            expect(appendChildMock).toHaveBeenCalledWith(expect.any(HTMLAudioElement));
            expect(attachMediaStreamMock).toHaveBeenCalled();
            });
        
            // clean up global mocks
            delete global.RTCPeerConnection;
            delete global.RTCSessionDescription;
            delete global.RTCIceCandidate;
            delete document.createElement;
            delete document.getElementById;
            delete document.querySelector;
            delete HTMLAudioElement.prototype.setAttribute;
        });
    });
    describe('update', () => {
        test('reset stops tracks and closes peer connections', () => {
            const stopMock = jest.fn();
            const removeMock = jest.fn();
            const closeMock = jest.fn();
            const getTracksMock = jest.fn(() => [{ stop: stopMock }]);
            const getSendersMock = jest.fn(() => [{ track: { kind: 'audio' } }, { track: { kind: 'video' } }]);
            const removeTrackMock = jest.fn();
            
            webRTC.local_media_stream = { getTracks: getTracksMock };
            webRTC.peer_media_elements = {
            peer1: { remove: removeMock },
            peer2: { remove: removeMock },
            };
            webRTC.peers = {
            peer1: { getSenders: getSendersMock, removeTrack: removeTrackMock, close: closeMock },
            peer2: { getSenders: getSendersMock, removeTrack: removeTrackMock, close: closeMock },
            };
            
            webRTC.reset();
            
            expect(stopMock).toHaveBeenCalled();
            expect(removeMock).toHaveBeenCalledTimes(2);
            expect(getSendersMock).toHaveBeenCalledTimes(2);
            expect(removeTrackMock).toHaveBeenCalledTimes(4);
            expect(closeMock).toHaveBeenCalledTimes(2);
            expect(webRTC.local_media_stream).toBeNull();
            expect(webRTC.peer_media_elements).toEqual({});
            expect(webRTC.peers).toEqual({});
        });
    });
    describe('setUpMedia', () => {
        test('setUpMedia should call the callback function when local media stream is already available', () => {
            const mockCallback = jest.fn();
            const mockErrorback = jest.fn();
        
            webRTC.local_media_stream = 'mockStream';
        
            webRTC.setUpMedia(mockCallback, mockErrorback);
        
            expect(mockCallback).toHaveBeenCalled();
            expect(mockErrorback).not.toHaveBeenCalled();
        });
    });

    describe('mute', () => {
      
        test('should turn off the microphone when it is on', () => {
            // Arrange
            const mediaStream = { getAudioTracks: () => [{ enabled: true }] };
            webRTC.local_media_stream = mediaStream;
            webRTC.mute_flag = true;
          
            // Act
            webRTC.mute();
          
            // Assert
            expect(webRTC.mute_flag).toBe(false);
          });
          
          test('should turn on the microphone when it is off', () => {
            // Arrange
            const mediaStream = { getAudioTracks: () => [{ enabled: false }] };
            webRTC.local_media_stream = mediaStream;
            webRTC.mute_flag = false;
          
            // Act
            webRTC.mute();
          
            // Assert
            expect(webRTC.mute_flag).toBe(true);
          });
    });

    describe('move', () => {
        test('should add player coordinates to my_pos object', () => {
            const playerObj = { id: 'player1', x: 10, y: 20 };
            webRTC.my_pos = {};
            webRTC.my_pos['player1'] = {x: 20, y: 20}
            webRTC.move(playerObj);
            expect(webRTC.my_pos).toEqual({ player1: { x: 10, y: 20 } });
          });
    });
    describe('updateState', () => {
        test('should update player state', () => {
            const players = {
            'player1': {
                playerState: 'alive',
            },
            'player2': {
                playerState: 'dead',
            }
            };
        
            webRTC.playerStates = {};
        
            webRTC.updateState(players);
        
            expect(webRTC.playerStates['player1']).toEqual({ playerState: 'alive' });
            expect(webRTC.playerStates['player2']).toEqual({ playerState: 'dead' });
        });
        
        test('should create new player state if not exist', () => {
            const players = {
            'player1': {
                playerState: 'alive',
            }
            };
        
            webRTC.playerStates = {};
        
            webRTC.updateState(players);
        
            expect(webRTC.playerStates['player1']).toEqual({ playerState: 'alive' });
        });
        
        test('should not overwrite existing player state', () => {
            const players = {
            'player1': {
                playerState: 'alive',
            }
            };
        
            webRTC.playerStates = { 'player1': { playerState: 'dead' } };
        
            webRTC.updateState(players);
        
            expect(webRTC.playerStates['player1']).toEqual({ playerState: 'alive' });
        });
    });
    describe('updateWall', () => {
        test('should update wall between two players', () => {
            webRTC.wallBetween = {};
        
            webRTC.updateWallBetween('player1', true);
            expect(webRTC.wallBetween['player1']).toBe(true);
        });
        
        test('should create new wallBetween object if not exist', () => {
            webRTC.wallBetween = {};
        
            webRTC.updateWallBetween('player1', true);
            expect(webRTC.wallBetween['player1']).toBe(true);
        });
        
        test('should not overwrite existing wallBetween', () => {
            webRTC.wallBetween = { 'player1': false };
        
            webRTC.updateWallBetween('player1', true);
            expect(webRTC.wallBetween['player1']).toBe(true);
        });
    });
});
