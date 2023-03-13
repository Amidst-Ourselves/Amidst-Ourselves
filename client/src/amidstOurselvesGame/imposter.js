export default class imposter {

    constructor(socket) {
        this.killCooldown = 20000; // in sec
        this.socket = socket;
    }

    update(player) {
        this.player = player;
    }

    kill(players, deadBodies) {
        for (let player in players) {
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

    killWrapper(time, lastActionTime, players, id, deadBodies) {
        if (time - lastActionTime >= this.killCooldown) {
            this.update(players[id]);
            let kill_flag = this.kill(players, deadBodies);
            if (kill_flag) {
                lastActionTime = time;
            }
        }
        return lastActionTime;
    }
}