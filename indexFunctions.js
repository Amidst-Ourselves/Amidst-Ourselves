const GAME_STATE = {
    lobby: "lobby",
    action: "action",
    end: "end"
};

const PLAYER_STATE = {
    crewmate: "crewmate",
    imposter: "imposter",
    ghost: "ghost"
};

const ROOM_CODE_LENGTH = 4;
const ROOM_CODE_CHARACTERS = "abcdefghijklmnopqrstuvwxyz";
const ROOM_CODE_CHARACTERS_LENGTH = ROOM_CODE_CHARACTERS.length;

const MAP1_SPAWN_X = 230 * 6;
const MAP1_SPAWN_Y = 130 * 6;
const MAP1_TASKS = [
    'upperEngine',
    'lowerEngine',
    'security',
    'reactor',
    'medbay',
    'electrical',
    'storage',
    'admin',
    'weapons',
    'sheilds',
    'o2',
    'navigation',
    'communications',
    //'cafeteria'
];

const COLOUR_COUNT = 10;

let rooms = {};

function playerCount(roomObj) {
    if (roomObj?.players) {
        return Object.keys(roomObj.players).length;
    }
    return 0;
}

function roomFull(roomObj) {
    if (roomObj?.playerLimit) {
        return playerCount(roomObj) >= roomObj.playerLimit;
    }
    return true;
}

function isColourAvailable(players, colour) {
    for (let playerId in players) {
        if (players[playerId].colour === colour) {
            return false;
        }
    }
    return true;
}

//We check which player won the game, but checking the number of crewmates and imposters in the game. 
function findWinners(roomObj) {
    if (roomObj?.gameState !== GAME_STATE.action) {
        return undefined;
    }

    let crewmates = 0;
    let imposters = 0;

    for(let playerId in roomObj.players){
        if (roomObj.players[playerId].playerState === PLAYER_STATE.crewmate) {
            crewmates++;
        } else if (roomObj.players[playerId].playerState === PLAYER_STATE.imposter) {
            imposters++;
        }
    }

    if (imposters === 0) {
        return PLAYER_STATE.crewmate;
    } else if (imposters >= crewmates) {
        return PLAYER_STATE.imposter;
    } else {
        return undefined;
    }
}

function chooseRandomItemsFromList(list, numberOfItemsToChoose) {
    if (list.length <= numberOfItemsToChoose) {
        return list;
    }

    list.sort(function(a, b) {
        return Math.random() - 0.5;
    });

    return list.slice(0, numberOfItemsToChoose);
}

function createRoom(roomObj, hostPlayerObj, hostDeadBodyObj) {
    let roomCode = createRoomCode();
    let players = {};
    let deadBodies = {};
    let votes = {};

    

    players[hostPlayerObj.id] = hostPlayerObj;
    deadBodies[hostDeadBodyObj.id] = hostDeadBodyObj;
    votes[hostPlayerObj.id] = 0;

    let newRoom = {
        roomCode: roomCode,
        playerLimit: roomObj.playerLimit,
        imposterCount: roomObj.imposterCount,
        taskCount: roomObj.taskCount,
        playerSpeed: roomObj.playerSpeed,
        map: roomObj.map,
        host: hostPlayerObj.id,
        gameState: GAME_STATE.lobby,
        players: players,
        deadBodies: deadBodies,
        webRTC: roomObj.webRTC,
        votes: votes,
        meetingCompleted: false,
        meetingCountdownStarted: false,
        timeoutId: 0,
        winner: undefined,
        winMessage: undefined,
    }

    rooms[roomCode] = newRoom;
    return rooms[roomCode];
}

function createRoomCode() {
    let roomCode;
    do {
        roomCode = '';
        for (let i=0; i<ROOM_CODE_LENGTH; i++) {
            roomCode += ROOM_CODE_CHARACTERS[Math.floor(Math.random() * ROOM_CODE_CHARACTERS_LENGTH)];
        }
    } while (roomCode in rooms);
    return roomCode;
}

function findNextAvailableColour(roomObj, currentColour) {
    if (!roomObj || !roomObj.players) return -1;

    for (let i=0; i<COLOUR_COUNT-1; i++) {
        currentColour = (currentColour+1)%COLOUR_COUNT;
        if (isColourAvailable(roomObj.players, currentColour)) {
            return currentColour;
        }
    }
    return -1;
}

function findNextHost(roomObj) {
    if (!roomObj || !roomObj.players) return null;

    const players = Object.keys(roomObj.players);
    if (players.length === 0) return null;
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    return randomPlayer;
}

module.exports = {
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
};
