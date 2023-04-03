const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
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

const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
app.use(require("./API/user"));
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origins: ["http://127.0.0.1:5500"],
        methods: ["GET", "POST"]
    }
});


//const express = require("express");
//const app = express();
//const cors = require("cors");
require("dotenv").config({ path: "./config.env" });
const port = 3000;
// app.use(cors());
// app.use(express.json());
// app.use(require("./API/user"));

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
    'cafeteria'
];

const COLOUR_COUNT = 10;

let rooms = {};
let sockets = {}
let playerStartRole={};



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

        console.log(socket);

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

        console.log(rooms);
    });

    socket.on('disconnect', () => {
        if (socket.roomCode === undefined) {
            // do nothing
        } else {

            console.log("webRTC deleting1");
            webRTC_delete(socket.roomCode);

            delete rooms[socket.roomCode].players[socket.id];
            delete rooms[socket.roomCode].deadBodies[socket.id];
            if (playerCount(rooms[socket.roomCode]) === 0) {
                delete rooms[socket.roomCode];
            }
            console.log("I'm trying to disconnect");
            io.to(socket.roomCode).emit('leave', {id: socket.id});
            delete sockets[socket.id];
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

        let room = rooms[socket.roomCode];

        let nCrewmate=0;
        let nImposter=0;
        let nGhost=0;
        for(let player in rooms[socket.roomCode].players){
            if(rooms[socket.roomCode].players[player].playerState === PLAYER_STATE.crewmate){
                nCrewmate+=1;
            }else if(rooms[socket.roomCode].players[player].playerState === PLAYER_STATE.imposter){
                nImposter+=1;
            }else{
                nGhost+=1;
            }
        }
        console.log("From Kill Side");
        console.log(nCrewmate);
        console.log(nImposter);
        console.log(nGhost);

        if(nImposter-nCrewmate >=0){
            console.log("imposter won")
            room["winner"] = "imposters";
            updateDB(room,PLAYER_STATE.imposter);
            io.to(socket.roomCode).emit('endGameInitiate',room);
        }else if (nImposter = 0){
            console.log("Crewmates won")
            room["winner"] = "crewmates";
            updateDB(room,PLAYER_STATE.crewmate);
            io.to(socket.roomCode).emit('endGameInitiate',room);
        }else{
            io.to(socket.roomCode).emit('kill', {id: playerObj.id, x: playerObj.x, y: playerObj.y});
        }

        
    });
    
    socket.on('startGame', () => {
        let room = rooms[socket.roomCode];
        let imposters = chooseRandomItemsFromList(Object.keys(room.players), room.imposterCount);

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

            playerStartRole[room.players[playerId].email]=room.players[playerId].playerState;

        }
        
        io.to(socket.roomCode).emit('teleportToGame', room);
    });

    socket.on('endGame', (roomObj) => {
        let room = rooms[socket.roomCode];

        roomObj["playersAtEnd"]=room.players;
       
        for (let playerId in room.players) {
            room.players[playerId].playerState = PLAYER_STATE.ghost;
            room.players[playerId].x = MAP1_SPAWN_X;
            room.players[playerId].y = MAP1_SPAWN_Y;
            room.players[playerId].tasks = [];
        }
        room.gameState = GAME_STATE.end;

        io.to(socket.roomCode).emit('gameEndScene', roomObj);
    });

    socket.on('taskCompleted', (taskObj) => {
        let room = rooms[socket.roomCode];
        let player = room.players[socket.id];

        if (player.tasks.includes(taskObj.name)) {
            player.tasks = player.tasks.filter(x => x !== taskObj.name);
            room.tasksComplete += 1;


            console.log(room.totalTasks);
            console.log(room.tasksComplete);

            if (room.totalTasks === room.tasksComplete) {
                console.log("Crewmates won all tasks completed")
                room["winner"] = "crewmateTask";
                io.to(socket.roomCode).emit('endGameInitiate',room);
            }else{
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
        gameWinner:roomObj.gameWinner,
        meetingCountdownStarted: false,
        timeoutId: 0 
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
    for (let i=0; i<COLOUR_COUNT-1; i++) {
        currentColour = (currentColour+1)%COLOUR_COUNT;
        if (isColourAvailable(roomObj.players, currentColour)) {
            return currentColour;
        }
    }
    return -1;
}

function isColourAvailable(players, colour) {
    for (let playerId in players) {
        if (players[playerId].colour === colour) {
            return false;
        }
    }
    return true;
}

function updateDB(room,winner) {

    console.log(playerStartRole);

    let db_connect = dbo.getDb();
    let updatePromises = [];

    for (let player in room.players) {
        

        if(playerStartRole[room.players[player].email] === winner){
            if(room.players[player]){
                console.log("updating for ");
                console.log(room.players[player].email);
                const filter = { username: room.players[player].email };
                const update = { $inc: { wins: 1, totalgames: 1 } };

                let updatePromise = db_connect.collection("Users").updateOne(filter, update);

                updatePromises.push(updatePromise);
            }
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


function playerCount(roomObj) {
    return Object.keys(roomObj.players).length;
}

function roomFull(roomObj) {
    return playerCount(roomObj) >= roomObj.playerLimit;
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


        let nCrewmate=0;
        let nImposter=0;
        let nGhost=0;
        for(let player in rooms[socket.roomCode].players){

            console.log(player);
            console.log(rooms[socket.roomCode].players[player].playerState);
            if(rooms[socket.roomCode].players[player].playerState === PLAYER_STATE.crewmate){
                nCrewmate+=1;
            }else if(rooms[socket.roomCode].players[player].playerState === PLAYER_STATE.imposter){
                nImposter+=1;
            }else{
                nGhost+=1;
            }
        }

        console.log("From meeting side");
        console.log(nCrewmate);
        console.log(nImposter);
        console.log(nGhost);

        if(nImposter-nCrewmate >=0){
            console.log("imposter won")
            room["winner"] = "imposters";
            updateDB(room,PLAYER_STATE.imposter);
            io.to(socket.roomCode).emit('endGameInitiate',room);
        }else if (nImposter === 0){
            console.log("Crewmates won")
            room["winner"] = "crewmates";
            updateDB(room,PLAYER_STATE.crewmate);
            io.to(socket.roomCode).emit('endGameInitiate',room);
        }else{
            io.to(socket.roomCode).emit('meetingResult', {'result': result, 'max': max});
        }



        
    }
    else {
        io.to(socket.roomCode).emit('meetingResult', null);
    }
    rooms[socket.roomCode].meetingCompleted = true;
}