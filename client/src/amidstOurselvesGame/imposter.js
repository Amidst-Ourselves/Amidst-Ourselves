export default class imposter {
    init(socket) {
        this.killCooldown = 20000; // in sec
        this.socket = socket;
    }

    update(player) {
        this.player = player;
    }

    kill(players, deadBodies) {
        console.log(players);
        for (let player in players) {
            console.log(players[player].x);
            console.log(players[player].y);
            console.log(this.player.x);
            console.log(this.player.y);
            if((Math.abs(players[player].x - this.player.x) + Math.abs(players[player].y - this.player.y)) < 10 && player != this.socket.id) {
                console.log("I'm killing: "+players[player].id);
                this.socket.emit('kill', {
                    id: player,
                    x: players[player].x,
                    y: players[player].y
                });

                deadBodies[player].x = players[player].x;
                deadBodies[player].y = players[player].y;
                deadBodies[player].visible = true;
                return true;
            } 
        }
        return false;
    }
}