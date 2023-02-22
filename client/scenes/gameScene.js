class gameScene extends Phaser.Scene {
    constructor() {
        super("gameScene")
    }

    init(roomObj) {
        this.socket = io(SERVER_ADDRESS);
        this.players = {};
        this.audioIcons = {};
        this.speed = roomObj.speed;
        this.roomCode = roomObj.roomCode;
        // Calling webRTC manager here
        this.webRTC = new webRTCClientManager();
        this.webRTC.init(roomObj, this.socket);
        this.webRTC.create();
    }

    preload() {
        this.load.image('ship', 'assets/ship.png');
        this.load.image('skeld', 'assets/skeld.png');
        this.load.spritesheet('player', 'assets/player.png',
            {frameWidth: SPRITE_WIDTH, frameHeight: SPRITE_HEIGHT}
        );
        console.log("I'm loading sprite")
        this.load.spritesheet('audioIcon', 'assets/audioIcon.png',
            {frameWidth: SPRITE_WIDTH, frameHeight: SPRITE_HEIGHT}
        );
        console.log("I'm loading sprite")
    }
    
    create() {
        this.add.image(50, 300, 'ship');
        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    
        this.socket.emit('roomJoin', {roomCode: this.roomCode});

        this.socket.on('roomJoinResponse', (roomObj) => {
            for (let playerId in roomObj.players) {
                this.createSprite(playerId, roomObj.players[playerId].x, roomObj.players[playerId].y);
                this.createAudioSprite(playerId, roomObj.players[playerId].x, roomObj.players[playerId].y);
            }
        });
    
        this.socket.on('move', (playerObj) => {
            this.players[playerObj.id].x = playerObj.x;
            this.players[playerObj.id].y = playerObj.y;

            this.audioIcons[playerObj.id].x = playerObj.x;
            this.audioIcons[playerObj.id].y = playerObj.y - PLAYER_HEIGHT/2;
        });

        this.socket.on('webRTC_speaking', (config) => {
            // console.log("received" + config.bool);
            if(config.bool == true) {
                this.audioIcons[config.id].visible = true;
            }
            else {
                this.audioIcons[config.id].visible = false;
            }
        });
    

        this.socket.on('join', (playerObj) => {
            this.createSprite(playerObj.id, playerObj.x, playerObj.y)
            this.createAudioSprite(playerObj.id, playerObj.x, playerObj.y)
            console.log('player joined ' + playerObj.id);
        });
        
        this.socket.on('leave', (playerObj) => {
            this.destroySprite(playerObj.id);
            this.destroyAudioSprite(playerObj.id)
            console.log('player left ' + playerObj.id);
        });
    }
    
    update() {
        if (this.players[this.socket.id]) {
            this.cameras.main.centerOn(this.players[this.socket.id].x, this.players[this.socket.id].y);
            if (this.movePlayer()) {
                this.socket.emit('move', {
                    x: this.players[this.socket.id].x,
                    y: this.players[this.socket.id].y
                });
            }
        }
        this.webRTC.update(this.players);

    }
    
    createSprite(playerId, x, y) {
        this.players[playerId] = this.add.sprite(x, y, 'player');
        this.players[playerId].displayHeight = PLAYER_HEIGHT;
        this.players[playerId].displayWidth = PLAYER_WIDTH;
    }

    createAudioSprite(playerId, x, y) {

        this.audioIcons[playerId] = this.add.sprite(x , y - PLAYER_WIDTH/2, 'audioIcon')
        this.audioIcons[playerId].displayHeight = PLAYER_HEIGHT/2;
        this.audioIcons[playerId].displayWidth = PLAYER_WIDTH/2;
        this.audioIcons[playerId].visible = false;
    }
    
    destroySprite(playerId) {
        this.players[playerId].destroy();
        delete this.players[playerId];
    }

    destroyAudioSprite(playerId) {
        this.audioIcons[playerId].destroy();
        delete this.audioIcons[playerId];
    }
    
    movePlayer() {
        let moved = false;
        if (this.keyUp.isDown) {
            this.players[this.socket.id].y -= this.speed;
            moved = true;
        }
        if (this.keyDown.isDown) {
            this.players[this.socket.id].y += this.speed;
            moved = true;
        }
        if (this.keyLeft.isDown) {
            this.players[this.socket.id].x -= this.speed;
            moved = true;
        }
        if (this.keyRight.isDown) {
            this.players[this.socket.id].x += this.speed;
            moved = true;
        }
        this.audioIcons[this.socket.id].x = this.players[this.socket.id].x
        this.audioIcons[this.socket.id].y = this.players[this.socket.id].y - PLAYER_HEIGHT/2;
        return moved;
    }
}