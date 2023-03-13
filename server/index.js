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


//const express = require("express");
//const app = express();
const cors = require("cors");
require("dotenv").config({ path: "./config.env" });
const port = 3000;
app.use(cors());
app.use(express.json());
app.use(require("./API/user"));

const dbo = require("./connect");
httpServer.listen(3000, () => {
    console.log('listening on localhost:3000');
    dbo.connectToServer(function (err) {
        if (err) console.error(err);
     
      });
});




const ROOM_CODE_LENGTH = 4;
const ROOM_CODE_CHARACTERS = "abcdefghijklmnopqrstuvwxyz";
const ROOM_CODE_CHARACTERS_LENGTH = ROOM_CODE_CHARACTERS.length;

let rooms = {};
let sockets = {}




io.on('connection', (socket) => {
    socket.on('roomCreate', (roomCodeObj) => {
        let hostPlayerObj = {id: socket.id, x: 400, y: 400, playerState: PLAYER_STATE.ghost};
        let roomObj = createRoom(roomCodeObj, hostPlayerObj);

        socket.join(roomObj.roomCode);
        socket.emit('roomResponse', roomObj);
        socket.roomCode = roomObj.roomCode;

        console.log(rooms);
    });

    socket.on('roomJoin', (roomCodeObj) => {
        if (roomCodeObj.roomCode === undefined || rooms[roomCodeObj.roomCode] === undefined) {
            socket.emit('roomResponse', {message: "bad room code"});
            return;
        }

        let player = {id: socket.id, x: 400, y: 400, playerState: PLAYER_STATE.ghost};
        rooms[roomCodeObj.roomCode].players[socket.id] = player;
        rooms[roomCodeObj.roomCode].deadBodies[socket.id] = player;

        if (roomFull(rooms[roomCodeObj.roomCode])) {
            delete rooms[roomCodeObj.roomCode].players[socket.id];
            delete rooms[roomCodeObj.roomCode].deadBodies[socket.id];
            socket.emit('roomResponse', {message: "room full"});
            return;
        }

        io.to(roomCodeObj.roomCode).emit('join', player);
        socket.join(roomCodeObj.roomCode);
        socket.emit('roomResponse', rooms[roomCodeObj.roomCode]);
        socket.roomCode = roomCodeObj.roomCode;

        console.log(rooms);
    });

    socket.on('disconnect', () => {
        if (socket.roomCode === undefined) {
            // do nothing
        } else {
            delete rooms[socket.roomCode].players[socket.id];
            delete rooms[socket.roomCode].deadBodies[socket.id];
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

    socket.on('kill', (playerObj) => {
        socket.broadcast.to(socket.roomCode).emit('kill', {
            id: playerObj.id,
            x: playerObj.x,
            y: playerObj.y
        });
        rooms[socket.roomCode].deadBodies[playerObj.id].x = playerObj.x;
        rooms[socket.roomCode].deadBodies[playerObj.id].y = playerObj.y;
    });

    
    socket.on('startGame', () => {
        rooms[socket.roomCode].gameState = GAME_STATE.action;
        let room = rooms[socket.roomCode];
        for (let playerId in room.players) {
            room.players[playerId].x = 400;
            room.players[playerId].y = 400;
        }
        io.to(socket.roomCode).emit('teleportToGame', room);
    });

    socket.on('endGame', () => {
        rooms[socket.roomCode].gameState = GAME_STATE.lobby;
        let room = rooms[socket.roomCode];
        for (let playerId in room.players) {
            room.players[playerId].x = 400;
            room.players[playerId].y = 400;
        }
        io.to(socket.roomCode).emit('teleportToLobby', room);
    });

    /* Below are webRTC events
    **************************
    **************************
    **************************
    **************************
    */
    sockets[socket.id] = socket;
    // this event should be called before the above disconnect function
    socket.on('webRTC_disconnect', (roomCodeObj) => {
        let roomCode = roomCodeObj.roomCode;
        webRTC_delete(roomCode);
        delete sockets[socket.id];
    });

    socket.on('webRTC_speaking', (config) => {
        // console.log("received" + config.bool);
        socket.broadcast.to(socket.roomCode).emit('webRTC_speaking', config);
    });

    socket.on('webRTC_join', (roomCodeObj) => {
        //console.log("received webRTC_join request");
        let roomCode = roomCodeObj.roomCode;

        // if (roomCode in rooms) {
        //     // if already joined
        //     return;
        // }
        if (rooms[roomCode] === undefined || rooms[roomCode].players === undefined) {
            return;
        }

        for (let player in rooms[roomCode].players) {
            // iterate through the players list and create p2p connection for each pair
            // pairs are stored in channel array

            sockets[player].emit('addPeer', {'peer_id': socket.id, 'should_create_offer': false});
            //console.log("I'm creating p2p2")
            socket.emit('addPeer', {'peer_id': player, 'should_create_offer': true});
        
        }
    });

    function webRTC_delete(roomCode) {
        // if channel not exist in the socket channels list then no need to delete it 
        if (rooms[roomCode].players === undefined) {
            return;
        }

        // delete socket.channels[channel];
        // notify all users the room has been deleted
        for (let player in rooms[roomCode].players) {
            sockets[player].emit('removePeer', {'peer_id': socket.id});
            socket.emit('removePeer', {'peer_id': id});
        }
    }


    socket.on('webRTC_delete', webRTC_delete);

    socket.on('relayICECandidate', (config) => {
        let peer_id = config.peer_id;
        let ice_candidate = config.ice_candidate;
        let roomCode = config.roomCode;

        if (peer_id in rooms[roomCode].players) {
            sockets[peer_id].emit('iceCandidate', {'peer_id': socket.id, 'ice_candidate': ice_candidate});
        }
    });
    
    // listen to client session description
    socket.on('relaySessionDescription', (config) => {
        let peer_id = config.peer_id;
        let session_description = config.session_description;
        let roomCode = config.roomCode;

        if (peer_id in rooms[roomCode].players) {
            sockets[peer_id].emit('sessionDescription', {'peer_id': socket.id, 'session_description': session_description});
        }
    });
   /* End of webRTC events
    **************************
    **************************
    **************************
    **************************
    */
});


function createRoom(roomObj, hostPlayerObj) {
    let roomCode = createRoomCode();
    let players = {};
    let deadBodies = {};
    players[hostPlayerObj.id] = hostPlayerObj;
    deadBodies[hostPlayerObj.id] = hostPlayerObj;
    let newRoom = {
        roomCode: roomCode,
        playerLimit: roomObj.playerLimit,
        imposterCount: roomObj.imposterCount,
        playerSpeed: roomObj.playerSpeed,
        map: roomObj.map,
        host: hostPlayerObj.id,
        gameState: GAME_STATE.lobby,
        players: players,
        deadBodies: deadBodies,
        webRTC: roomObj.webRTC
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

function playerCount(roomObj) {
    return Object.keys(roomObj.players).length;
}

function roomFull(roomObj) {
    return playerCount(roomObj) > roomObj.playerLimit;
}
