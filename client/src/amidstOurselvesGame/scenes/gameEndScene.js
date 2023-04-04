import Phaser from 'phaser';


export default class gameEndScene extends Phaser.Scene {
    constructor() {
        super("gameEndScene")
    }

    init(roomObj) {
        this.socket = this.registry.get('socket');
        this.webRTC = this.registry.get('webRTC');
        this.roomCode = roomObj.roomCode;
        this.host = roomObj.host;
        this.tempPlayers = roomObj.players;
        this.winner = roomObj.winner;
        this.playersAtEnd = roomObj.playersAtEnd;
    }

    create() {
        const winner = ["Crewmates won the game! All imposters killed!", "Imposters won the game! ", "Crewmates won the game! All task completed!"];
        console.log("through game end scene")
        console.log(this.winner)
        let endGameMessage="";

        if(this.winner === "imposters"){
            endGameMessage = winner[1];
        }else if(this.winner === "crewmates"){
            endGameMessage = winner[0];
        }else if(this.winner === "crewmateTask"){
            endGameMessage = winner[2];
        }

        const gameEndText = this.add.text(0, 50, "Game Ended!", { font: '32px Arial', fill: '#FFFFFF' });
        const winnerText = this.add.text(0, 100, endGameMessage, { font: '32px Arial', fill: '#FFFFFF', align: 'center' });
        const winnerTextX = this.cameras.main.centerX - winnerText.displayWidth / 2; 
        const gameEndTextX = this.cameras.main.centerX - gameEndText.displayWidth / 2; 
        winnerText.setX(winnerTextX);
        gameEndText.setX(gameEndTextX)

        console.log(this.playersAtEnd);
        
        setTimeout(() => {
            window.location.reload();
        }, 5000);
    }
}
