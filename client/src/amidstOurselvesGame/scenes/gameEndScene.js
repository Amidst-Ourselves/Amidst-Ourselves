import e from 'cors';
import Phaser from 'phaser';
import { HEIGHT } from "../constants";
import MiniMap from "../containers/minimap";
import TaskManager from "../containers/taskManager";
import TitleScene from "./titleScene";


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
        this.speed = roomObj.playerSpeed;
        this.winner = roomObj.winner;
        this.playersAtEnd = roomObj.playersAtEnd;

        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.killButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
        this.callButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        this.miniMap = new MiniMap(
            this,
            Phaser.Input.Keyboard.KeyCodes.M,
        );
        this.taskManager = new TaskManager(
            this,
            Phaser.Input.Keyboard.KeyCodes.F,
            roomObj.totalTasks,
            roomObj.tasksComplete,
            (taskName) => { this.socket.emit('taskCompleted', {'name': taskName}); },
        );

        this.canMove = true;
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
        }, 20000);


    }
}
