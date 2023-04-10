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
} = require("./indexFunctions");

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const dbo = require("./connect");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(require("./API/user"));

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/register', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });

app.get('/forgot-password', function (req, res) {
res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.get('/game', function (req, res) {
res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.get('/leaderboard', function (req, res) {
res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.use(function(req, res, next) {
res.status(404).sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origins: '*',
        methods: ["GET", "POST"],
    }
});

httpServer.listen(port, () => {
    console.log('listening on localhost:' + port);
    dbo.connectToServer(function (err) {
        if (err) console.error(err);
     
      });
});

let sockets = {}




io.on('connection', (socket) => {
    socket.on('roomCreate', (roomCodeObj) => {
        let hostPlayerObj = {
            id: socket.id,
            x: MAP1_SPAWN_X,
            y: MAP1_SPAWN_Y,
            name: roomCodeObj.playerName,
            email: roomCodeObj.playerEmail,
            playerState: PLAYER_STATE.ghost,
            tasks: [],
            colour: 0,
        };
        let hostDeadBodyObj = {
            id: socket.id,
            x: 0,
            y: 0,
        };
        let roomObj = createRoom(roomCodeObj, hostPlayerObj, hostDeadBodyObj); 

        socket.join(roomObj.roomCode);
        socket.emit('roomResponse', roomObj);
        socket.roomCode = roomObj.roomCode;
    });

    socket.on('roomJoin', (roomCodeObj) => {
        if (roomCodeObj.roomCode === undefined || rooms[roomCodeObj.roomCode] === undefined) {
            socket.emit('roomResponse', {message: "bad room code"});
            return;
        }
        if (roomFull(rooms[roomCodeObj.roomCode])) {
            socket.emit('roomResponse', {message: "room full"});
            return;
        }

        rooms[roomCodeObj.roomCode].players[socket.id] = {
            id: socket.id,
            x: MAP1_SPAWN_X,
            y: MAP1_SPAWN_Y,
            name: roomCodeObj.playerName,
            email: roomCodeObj.playerEmail,
            playerState: PLAYER_STATE.ghost,
            tasks: [],
            colour: 0,
        };
        rooms[roomCodeObj.roomCode].deadBodies[socket.id] = {
            id: socket.id,
            x: 0,
            y: 0,
        };
        let nextColour = findNextAvailableColour(
            rooms[roomCodeObj.roomCode],
            rooms[roomCodeObj.roomCode].players[socket.id].colour
        );
        if (nextColour >= 0) {
            rooms[roomCodeObj.roomCode].players[socket.id].colour = nextColour;
        }

        io.to(roomCodeObj.roomCode).emit('join', rooms[roomCodeObj.roomCode].players[socket.id]);
        socket.join(roomCodeObj.roomCode);
        socket.emit('roomResponse', rooms[roomCodeObj.roomCode]);
        socket.roomCode = roomCodeObj.roomCode;
    });

    socket.on('disconnect', () => {
        if (
            socket.roomCode === undefined ||
            rooms[socket.roomCode] === undefined ||
            rooms[socket.roomCode].players[socket.id] === undefined
        ) {
            return;
        }

        if (
            rooms[socket.roomCode].gameState === GAME_STATE.action &&
            rooms[socket.roomCode].players[socket.id].playerState !== PLAYER_STATE.ghost &&
            rooms[socket.roomCode].initialPlayers[socket.id] !== undefined
        ) {
            rooms[socket.roomCode].initialPlayers[socket.id].leftEarly = true;
        }

        const playerId = rooms[socket.roomCode].players[socket.id].id;
        const playerName = rooms[socket.roomCode].players[socket.id].name;

        delete rooms[socket.roomCode].players[socket.id];
        delete rooms[socket.roomCode].deadBodies[socket.id];

        webRTC_delete(socket.roomCode);

        if (playerCount(rooms[socket.roomCode]) === 0) {
            delete rooms[socket.roomCode];
            return;
        }
        
        if (rooms[socket.roomCode].host === playerId) {
            rooms[socket.roomCode].host = findNextHost(rooms[socket.roomCode]);
            io.to(socket.roomCode).emit('host', {id: rooms[socket.roomCode].host});
        }
        
        let winners = findWinners(rooms[socket.roomCode]);
        let room = rooms[socket.roomCode];

        if (winners === PLAYER_STATE.crewmate) {
            room.winner = PLAYER_STATE.crewmate;
            room.winMessage = "Crewmates win! Impostors were eliminated!"
            updateDB(room, PLAYER_STATE.crewmate);
            io.to(socket.roomCode).emit('teleportToEnd', room);
            delayBackToLobby(socket, 5000);
        } else if (winners === PLAYER_STATE.imposter) {
            room.winner = PLAYER_STATE.imposter;
            room.winMessage = "Impostors win! Crewmates were eliminated!"
            updateDB(room, PLAYER_STATE.imposter);
            io.to(socket.roomCode).emit('teleportToEnd', room);
            delayBackToLobby(socket, 5000);
        } else {
            io.to(socket.roomCode).emit('leave', {id: playerId, name: playerName});
        }
    });

    socket.on('move', (playerObj) => {
        socket.broadcast.to(socket.roomCode).emit('move', {
            id: socket.id,
            x: playerObj.x,
            y: playerObj.y,
            velocity: playerObj.velocity,
        });
        rooms[socket.roomCode].players[socket.id].x = playerObj.x;
        rooms[socket.roomCode].players[socket.id].y = playerObj.y;
    });

    socket.on('moveStop', () => {
        socket.broadcast.to(socket.roomCode).emit('moveStop', {id: socket.id});
    });

    socket.on('colour', () => {
        let nextColour = findNextAvailableColour(rooms[socket.roomCode], rooms[socket.roomCode].players[socket.id].colour);
        if (nextColour >= 0) {
            rooms[socket.roomCode].players[socket.id].colour = nextColour;
            io.to(socket.roomCode).emit('colour', {id: socket.id, colour: nextColour});
        }
    });
    
    socket.on('kill', (playerObj) => {
        rooms[socket.roomCode].deadBodies[playerObj.id].x = playerObj.x;
        rooms[socket.roomCode].deadBodies[playerObj.id].y = playerObj.y;
        rooms[socket.roomCode].deadBodies[playerObj.id].visible = true;

        rooms[socket.roomCode].players[playerObj.id].playerState = PLAYER_STATE.ghost;

        let winners = findWinners(rooms[socket.roomCode]);
        let room = rooms[socket.roomCode];

        if (winners === PLAYER_STATE.crewmate) {
            room.winner = PLAYER_STATE.crewmate;
            room.winMessage = "Crewmates win! Impostors were eliminated!"
            updateDB(room, PLAYER_STATE.crewmate);
            io.to(socket.roomCode).emit('teleportToEnd', room);
            delayBackToLobby(socket, 5000);
        } else if (winners === PLAYER_STATE.imposter) {
            room.winner = PLAYER_STATE.imposter;
            room.winMessage = "Impostors win! Crewmates were eliminated!"
            updateDB(room, PLAYER_STATE.imposter);
            io.to(socket.roomCode).emit('teleportToEnd', room);
            delayBackToLobby(socket, 5000);
        } else {
            io.to(socket.roomCode).emit('kill', {id: playerObj.id, x: playerObj.x, y: playerObj.y});
        }
    });
    
    socket.on('startGame', () => {
        let room = rooms[socket.roomCode];
        let imposters = chooseRandomItemsFromList(Object.keys(room.players), room.imposterCount);

        room.initialPlayers = {};
        room.gameState = GAME_STATE.action;
        room.totalTasks = (playerCount(room) - room.imposterCount) * room.taskCount;
        room.tasksComplete = 0;
        for (let playerId in room.players) {
            if (imposters.includes(playerId)) {
                room.players[playerId].playerState = PLAYER_STATE.imposter;
                room.players[playerId].tasks = [];
            } else {
                room.players[playerId].playerState = PLAYER_STATE.crewmate;
                room.players[playerId].tasks = chooseRandomItemsFromList(MAP1_TASKS, room.taskCount);
            }
            room.players[playerId].x = MAP1_SPAWN_X;
            room.players[playerId].y = MAP1_SPAWN_Y;

            room.initialPlayers[playerId] = {
                id: playerId,
                name: room.players[playerId].name,
                email: room.players[playerId].email,
                playerState: room.players[playerId].playerState,
                colour: room.players[playerId].colour,
                leftEarly: false,
            };
        }
        
        io.to(socket.roomCode).emit('teleportToGame', room);
        console.log(room);
    });

    socket.on('endGame', () => {
        let room = rooms[socket.roomCode];
       
        room.gameState = GAME_STATE.lobby;
        for (let playerId in room.players) {
            room.players[playerId].playerState = PLAYER_STATE.ghost;
            room.players[playerId].x = MAP1_SPAWN_X;
            room.players[playerId].y = MAP1_SPAWN_Y;
            room.players[playerId].tasks = [];
        }

        io.to(socket.roomCode).emit('teleportToLobby', room);
        console.log(room);
    });

    socket.on('taskCompleted', (taskObj) => {
        let room = rooms[socket.roomCode];
        let player = room.players[socket.id];

        if (player.tasks.includes(taskObj.name)) {
            player.tasks = player.tasks.filter(x => x !== taskObj.name);
            room.tasksComplete += 1;

            if (room.totalTasks === room.tasksComplete) {
                room.winner = PLAYER_STATE.crewmate;
                room.winMessage = "Crewmates win! Crewmates finished all tasks!"
                updateDB(room, PLAYER_STATE.crewmate);
                io.to(socket.roomCode).emit('teleportToEnd', room);
                delayBackToLobby(socket, 5000);
            } else {
                taskObj.id = socket.id;
                io.to(socket.roomCode).emit('taskCompleted', taskObj);
            }
        }
    });

    socket.on('meeting', () => {
        io.to(socket.roomCode).emit('meeting');
        let room = rooms[socket.roomCode];
        room.meetingCompleted = false;
        room.meetingCountdownStarted = false;
        for (let id in room.players) {
            // reset all votes to 0
            room.votes[id] = 0;
        }
    });

    socket.on('meetingCountdown', () => {

        if (!rooms[socket.roomCode].meetingCountdownStarted) {
                rooms[socket.roomCode].meetingCountdownStarted = true;
                rooms[socket.roomCode].timeoutId = setTimeout(() => {
                    console.log("vote end");
                    if(rooms[socket.roomCode]) {
                        if (!rooms[socket.roomCode].meetingCompleted) {

                            getMeetingResult(socket);
                        }
                    }
                }, 30000);
            }
    });

    socket.on('voted', (playerID) => {

        let room = rooms[socket.roomCode];
        if(room.players[socket.id].playerState != PLAYER_STATE.ghost) {
            room.votes[playerID]++;
        }


        let alive = 0;
        for (let id in room.players) {
            if (room.players[id].playerState === PLAYER_STATE.crewmate || 
                room.players[id].playerState === PLAYER_STATE.imposter) {
                alive++;
            }
        }
        let sum = 0;
        for (let playerID in room.votes) {
            sum += room.votes[playerID];
        }
        console.log("sum");
        console.log(sum);
        console.log("alive");
        console.log(alive);
        if (sum >= alive) {
            if (!rooms[socket.roomCode].meetingCompleted) {
                clearTimeout(rooms[socket.roomCode].timeoutId);
                getMeetingResult(socket);
            }
        }
        
    });

    socket.on('new_message', (message) => { 
        socket.broadcast.to(socket.roomCode).emit('new_message', {'player': socket.id, 'message': message});
    });

    /* Below are webRTC events
    **************************
    **************************
    **************************
    **************************
    */
    sockets[socket.id] = socket;
    // this event should be called before the above disconnect function
    socket.on('webRTC_disconnect', () => {
        if (socket.roomCode === undefined) {
            console.log("something that should never happen happened");
            return;
        }
        console.log("webRTC deleting");
        webRTC_delete(socket.roomCode);
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
        console.log("webRTC deleting");

        // delete socket.channels[channel];
        // notify all users the room has been deleted
        for (let player in rooms[roomCode].players) {
            sockets[player].emit('removePeer', {'peer_id': socket.id});
            socket.emit('removePeer', {'peer_id': player});
        }
    }


    // socket.on('webRTC_delete', webRTC_delete);

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

function updateDB(room,winner) {
    let db_connect = dbo.getDb();
    let updatePromises = [];

    for (let player in room.initialPlayers) {
        if (room.initialPlayers[player].playerState === winner){
            const filter = { username: room.initialPlayers[player].email };
            const update = { $inc: { wins: 1, totalgames: 1 } };

            let updatePromise = db_connect.collection("Users").updateOne(filter, update);

            updatePromises.push(updatePromise);
        }
    }

    Promise.all(updatePromises)
    .then(results => {
        console.log("All score updates succeeded.");
        return true;
    })
    .catch(error => {
        console.log("At least one score update failed.");
        return false;
    });

}

function getMeetingResult(socket) {
    let result = null;
    let max = 0;
    let room = rooms[socket.roomCode];
    let alive = 0;
    for (let id in room.players) {
        if (room.players[id].playerState === PLAYER_STATE.crewmate || 
            room.players[id].playerState === PLAYER_STATE.imposter) {
            alive++;
        }
    }
    for (let id in room.votes) {
        if (room.votes[id] > max) {
            max = room.votes[id];
            result = id;
        }
    }
    console.log(max/alive);
    if (max/alive > 0.5) {
        rooms[socket.roomCode].players[result].playerState = PLAYER_STATE.ghost;

        let winners = findWinners(rooms[socket.roomCode]);
        let room = rooms[socket.roomCode];

        if (winners === PLAYER_STATE.crewmate) {
            room.winner = PLAYER_STATE.crewmate;
            room.winMessage = "Crewmates win! Impostors were eliminated!"
            updateDB(room, PLAYER_STATE.crewmate);
            io.to(socket.roomCode).emit('teleportToEnd', room);
            delayBackToLobby(socket, 5000);
        } else if (winners === PLAYER_STATE.imposter) {
            room.winner = PLAYER_STATE.imposter;
            room.winMessage = "Imposters win! Crewmates were eliminated!"
            updateDB(room, PLAYER_STATE.imposter);
            io.to(socket.roomCode).emit('teleportToEnd', room);
            delayBackToLobby(socket, 5000);
        } else {
            io.to(socket.roomCode).emit('meetingResult', {'result': result, 'max': max});
        }
    }
    else {
        io.to(socket.roomCode).emit('meetingResult', null);
    }
    rooms[socket.roomCode].meetingCompleted = true;
}

function delayBackToLobby(socket, delay) {
    setTimeout(() => {
        let room = rooms[socket.roomCode];
       
        room.gameState = GAME_STATE.lobby;
        for (let playerId in room.players) {
            room.players[playerId].playerState = PLAYER_STATE.ghost;
            room.players[playerId].x = MAP1_SPAWN_X;
            room.players[playerId].y = MAP1_SPAWN_Y;
            room.players[playerId].tasks = [];
        }

        io.to(socket.roomCode).emit('teleportToLobby', room);
    }, delay);
}
