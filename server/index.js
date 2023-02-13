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


room1 = {
    name: "room1",
    speed: 2,
    players: {}
};


io.on('connection', (socket) => {
    room1.players[socket.id] = {x: 400, y: 400};
    console.log(room1);


    io.to(room1.name).emit('join', {
        id: socket.id,
        x: 400,
        y: 400
    });

    socket.join(room1.name);

    socket.on('requestRoom', () => {
        socket.emit('room', room1);
    })

    socket.on('disconnect', () => {
        delete room1.players[socket.id];
        io.to(room1.name).emit('leave', {
            id: socket.id
        });
    })

    socket.on('move', (data) => {
        id = socket.id;
        socket.broadcast.to(room1.name).emit('move', {
            id: socket.id,
            x: data.x,
            y: data.y
        });
        room1.players[socket.id].x = data.x;
        room1.players[socket.id].y = data.y;
    });
});


httpServer.listen(3000, () => {
    console.log('listening on localhost:3000');
});
