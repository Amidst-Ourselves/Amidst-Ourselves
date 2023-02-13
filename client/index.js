const SPRITE_WIDTH = 84;
const SPRITE_HEIGHT = 128;
const PLAYER_WIDTH = 34;
const PLAYER_HEIGHT = 46;

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
const game = new Phaser.Game(config);

let id = undefined;
let players = {};
let speed = 0;

const socket = io('http://localhost:3000');
socket.on('connect', () => {
    id = socket.id;
});




function preload() {
    this.load.image('ship', 'assets/ship.png');
    this.load.spritesheet('player', 'assets/player.png',
        {frameWidth: SPRITE_WIDTH, frameHeight: SPRITE_HEIGHT}
    );
}

function create() {
    const ship = this.add.image(50, 300, 'ship');
    keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    socket.emit('requestRoom');

    socket.on('room', (data) => {
        speed = data.speed;
        for (playerId in data.players) {
            createSprite(this, playerId, data.players[playerId].x, data.players[playerId].y);
        }
    });

    socket.on('move', (data) => {
        players[data.id].x = data.x;
        players[data.id].y = data.y;
    });

    socket.on('join', (data) => {
        createSprite(this, data.id, data.x, data.y)
        console.log('player joined ' + data.id);
    });
    
    socket.on('leave', (data) => {
        destroySprite(data.id);
        console.log('player left ' + data.id);
    });
}

function update() {
    if (players[id]) {
        this.cameras.main.centerOn(players[id].x, players[id].y);
        if (movePlayer()) {
            socket.emit('move', {x: players[id].x, y: players[id].y});
        }
    }
}


function createSprite(_this, playerId, x, y) {
    players[playerId] = _this.add.sprite(x, y, 'player');
    players[playerId].displayHeight = PLAYER_HEIGHT;
    players[playerId].displayWidth = PLAYER_WIDTH;
}

function destroySprite(playerId) {
    players[playerId].destroy();
}

function movePlayer() {
    let moved = false;
    if (keyUp.isDown) {
        players[id].y -= speed;
        moved = true;
    }
    if (keyDown.isDown) {
        players[id].y += speed;
        moved = true;
    }
    if (keyLeft.isDown) {
        players[id].x -= speed;
        moved = true;
    }
    if (keyRight.isDown) {
        players[id].x += speed;
        moved = true;
    }
    return moved;
}

