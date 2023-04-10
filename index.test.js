const {
    GAME_STATE,
    PLAYER_STATE,
    ROOM_CODE_LENGTH,
    ROOM_CODE_CHARACTERS,
    ROOM_CODE_CHARACTERS_LENGTH,
    MAP1_SPAWN_X,
    MAP1_SPAWN_Y,
    MAP1_TASKS,
    COLOUR_COUNT,
    rooms,
    playerCount,
    roomFull,
    isColourAvailable,
    findWinners,
    chooseRandomItemsFromList,
    createRoom,
    createRoomCode,
    findNextAvailableColour,
    findNextHost,
} = require('./indexFunctions');


describe('playerCount', () => {
    test('should return 0 if there is no room object', () => {
        expect(playerCount(undefined)).toBe(0);
    });

    test('should return 0 if there is no players object', () => {
        expect(playerCount({})).toBe(0);
    });

    test('should return 0 if there are no players in a room', () => {
        const roomObj = {
            players: {},
        };
        expect(playerCount(roomObj)).toBe(0);
    });

    test('should return the number of players in a room', () => {
        const roomObj = {
            players: {
                player1: 'player1',
                player2: 'player2',
                player3: 'player3',
            },
        };
        expect(playerCount(roomObj)).toBe(3);
    });
});

describe('roomFull', () => {
    test('should return true if there is no room object', () => {
        expect(roomFull(undefined)).toBe(true);
    });

    test('should return true if there is no playerLimit', () => {
        expect(roomFull({})).toBe(true);
    });

    test('should return true if the room is full', () => {
        const roomObj = {
            playerLimit: 2,
            players: {
                player1: 'player1',
                player2: 'player2',
            },
        };
        expect(roomFull(roomObj)).toBe(true);
    });

    test('should return false if the room is not full', () => {
        const roomObj = {
            playerLimit: 2,
            players: {
                player1: 'player1',
            },
        };
        expect(roomFull(roomObj)).toBe(false);
    });
});

describe('isColourAvailable', () => {
    test('should return true if there are no players', () => {
        expect(isColourAvailable(undefined, 'red')).toBe(true);
    });

    test('should return true if the colour is not taken', () => {
        const players = {
            player1: {
                colour: 'red',
            },
        };
        expect(isColourAvailable(players, 'blue')).toBe(true);
    });

    test('should return false if the colour is taken', () => {
        const players = {
            player1: {
                colour: 'red',
            },
        };
        expect(isColourAvailable(players, 'red')).toBe(false);
    });
});

describe('findWinners', () => {
    test('should return undefined if roomObj is undefined', () => {
        expect(findWinners(undefined)).toEqual(undefined);
    });

    test('should return crewmate if there are no players', () => {
        const roomObj = {
            gameState: GAME_STATE.action,
        };
        expect(findWinners(roomObj)).toEqual(PLAYER_STATE.crewmate);
    });

    test('should return imposter if there are equal players', () => {
        const roomObj = {
            gameState: GAME_STATE.action,
            players: {
                player1: {
                    playerState: PLAYER_STATE.imposter,
                },
                player2: {
                    playerState: PLAYER_STATE.crewmate,
                },
            },
        };
        expect(findWinners(roomObj)).toEqual(PLAYER_STATE.imposter);
    });
});

describe('chooseRandomItemsFromList', () => {
    test('should return empty array if items to choose is 0', () => {
        expect(chooseRandomItemsFromList([1,2], 0)).toEqual([]);
    });

    test('should return the input if items to choose is greater than the length', () => {
        expect(chooseRandomItemsFromList([1,2], 3)).toEqual([1,2]);
    });

    test('should return part of the input if items to choose is less than the length', () => {
        expect(chooseRandomItemsFromList([1,2,3], 2)).toHaveLength(2);
    });
});

describe('createRoom', () => {
    test('should return a room object', () => {
        createRoom({playerLimit: 1}, {id: 'hostId'}, {id: 'deadHost'});
        expect(Object.keys(rooms)).toHaveLength(1);
        expect(Object.values(rooms)[0]).toHaveProperty('host', 'hostId');
        expect(Object.values(rooms)[0]).toHaveProperty('playerLimit', 1);
        expect(Object.values(rooms)[0]).toHaveProperty('players', {hostId: {id: 'hostId'}});
        expect(Object.values(rooms)[0]).toHaveProperty('deadBodies', {deadHost: {id: 'deadHost'}});
    });
});

describe('createRoomCode', () => {
    test('should return a string of the correct length', () => {
        expect(createRoomCode()).toHaveLength(ROOM_CODE_LENGTH);
    });

    test('should return a string of the correct characters', () => {
        const roomCode = createRoomCode();
        for (let i = 0; i < roomCode.length; i++) {
            expect(ROOM_CODE_CHARACTERS).toContain(roomCode[i]);
        }
    });
});

describe('findNextAvailableColour', () => {
    test('should return -1 roomObj is undefined', () => {
        expect(findNextAvailableColour(undefined, undefined)).toBe(-1);
    });

    test('should return 6 if all colours 0-5 are taken', () => {
        const roomObj = {
            players: {
                player1: {
                    colour: 0,
                },
                player2: {
                    colour: 1,
                },
                player3: {
                    colour: 2,
                },
                player4: {
                    colour: 3,
                },
                player5: {
                    colour: 4,
                },
                player6: {
                    colour: 5,
                },
            },
        };
        expect(findNextAvailableColour(roomObj, 0)).toBe(6);
    });
});

describe('findNextHost', () => {
    test('should return undefined if roomObj is undefined', () => {
        expect(findNextHost(undefined)).toBe(null);
    });

    test('should return undefined if there are no players', () => {
        const roomObj = {
            players: {},
        };
        expect(findNextHost(roomObj)).toBe(null);
    });

    test('should return the next host', () => {
        const roomObj = {
            players: {
                player1: {
                    id: 'player1',
                },
                player2: {
                    id: 'player2',
                },
                player3: {
                    id: 'player3',
                },
            },
        };
        expect(roomObj.players).toHaveProperty(findNextHost(roomObj));
    });
});
