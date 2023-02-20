const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

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
            roomObj = createRoom();
        } else {
            roomObj = getRoom(roomCodeObj.roomCode);
        }
        socket.emit('roomJoinCreateResponse', roomObj);
    });

    socket.on('roomJoin', (roomCodeObj) => {
        if (roomCodeObj.roomCode === undefined || !roomCodeObj.roomCode in rooms) {
            socket.emit('roomJoinResponse', {});
            return;
        }

        let room = rooms[roomCodeObj.roomCode];

        if (room.players === undefined) {
            players = {};
            players[socket.id] = {x: 400, y: 400};
            room["host"] = socket.id;
            room["players"] = players;
        } else {
            room.players[socket.id] = {x: 400, y: 400};
        }

        io.to(roomCodeObj.roomCode).emit('join', {id: socket.id, x: 400, y: 400});
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


function createRoom() {
    let roomCode = createRoomCode();
    let newRoom = {
        roomCode: roomCode,
        speed: 2
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
