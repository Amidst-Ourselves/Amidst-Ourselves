const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const GAME_STATE = {
    lobby: "lobby",
    action: "action"
};
const PLAYER_STATE = {
    crewmate: "crewmate",
    imposter: "imposter",
    ghost: "ghost"
};

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origins: ["http://127.0.0.1:5500"],
        methods: ["GET", "POST"]
    }
});

httpServer.listen(3000, () => {
    console.log('listening on localhost:3000');
});




const ROOM_CODE_LENGTH = 4;
const ROOM_CODE_CHARACTERS = "abcdefghijklmnopqrstuvwxyz";
const ROOM_CODE_CHARACTERS_LENGTH = ROOM_CODE_CHARACTERS.length;

let rooms = {};




io.on('connection', (socket) => {
    socket.on('roomJoinCreate', (roomCodeObj) => {
        let roomObj;
        if (roomCodeObj.roomCode === undefined) {
            roomObj = createRoom(roomCodeObj);
        } else {
            roomObj = getRoom(roomCodeObj.roomCode);
        }
        socket.emit('roomJoinCreateResponse', roomObj);
    });

    socket.on('roomJoin', (roomCodeObj) => {
        if (roomCodeObj.roomCode === undefined || !roomCodeObj.roomCode in rooms) {
            socket.emit('roomJoinResponse', {message: "error joining room"});
            return;
        }

        let room = rooms[roomCodeObj.roomCode];
        let player = {id: socket.id, x: 400, y: 400, playerState: PLAYER_STATE.ghost};

        if (playerCount(room) === 0) {
            room.host = socket.id;
        }

        room.players[socket.id] = player;

        if (roomFull(room)) {
            delete room.players[socket.id];
            socket.emit('roomJoinResponse', {message: "room full"});
            return;
        }

        io.to(roomCodeObj.roomCode).emit('join', player);
        socket.join(roomCodeObj.roomCode);
        socket.emit('roomJoinResponse', rooms[roomCodeObj.roomCode]);
        socket.roomCode = roomCodeObj.roomCode;

        console.log(rooms);
    });

    socket.on('disconnect', () => {
        if (socket.roomCode === undefined) {
            // do nothing
        } else {
            delete rooms[socket.roomCode].players[socket.id];
            if (playerCount(rooms[socket.roomCode]) === 0) {
                delete rooms[socket.roomCode];
            }
            io.to(socket.roomCode).emit('leave', {id: socket.id});
        }
    });

    socket.on('move', (playerObj) => {
        socket.broadcast.to(socket.roomCode).emit('move', {
            id: socket.id,
            x: playerObj.x,
            y: playerObj.y
        });
        rooms[socket.roomCode].players[socket.id].x = playerObj.x;
        rooms[socket.roomCode].players[socket.id].y = playerObj.y;
    });
});


function createRoom(roomObj) {
    let roomCode = createRoomCode();
    let newRoom = {
        roomCode: roomCode,
        playerLimit: roomObj.playerLimit,
        imposterCount: roomObj.imposterCount,
        playerSpeed: roomObj.playerSpeed,
        map: roomObj.map,
        host: undefined,
        gameState: GAME_STATE.lobby,
        players: {}
    }
    rooms[roomCode] = newRoom;
    return rooms[roomCode];
}


function getRoom(roomCode) {
    if (roomCode in rooms) {
        return rooms[roomCode];
    }
    return {};
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

function playerCount(roomObj) {
    return Object.keys(roomObj.players).length;
}

function roomFull(roomObj) {
    return playerCount(roomObj) > roomObj.playerLimit;
}
