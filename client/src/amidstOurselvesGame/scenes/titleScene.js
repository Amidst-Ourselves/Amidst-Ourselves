import Phaser from 'phaser';


export default class TitleScene extends Phaser.Scene {
    constructor() {
        super("titleScene");
    }

    init(data) {
        this.data = data;
    }

    create() {
        const initialText = 'Type room code...';
        let inputText = '';

        //The following code enable the game to set the current logged user. 
        let storedName = localStorage.getItem('name');
        let storedEmail = localStorage.getItem('email');
        if(!storedName){
            storedName = "Anonymous";
        }
        if(!storedEmail){
            storedEmail = "Anonymous";
        }


        /*
        FR5 - Create.Priveate
        This code creates a button that will create a new game room when the user presses it.
        The button then takes the user to the game settings scene where they can set the game settings.
        After the user submits their settings, the game will be created and the user will be taken to the game scene.
        */
        let startGameText = this.add.text(100, 100, 'Click here to create a new game room!', { font: '32px Arial', fill: '#FFFFFF' });
        startGameText.setInteractive();
        startGameText.on('pointerover', () => {
            startGameText.setTint(0xFF0000);
        });
        startGameText.on('pointerout', () => {
            startGameText.setTint(0xFFFFFF);
        });
        startGameText.on('pointerdown', () => {
            this.scene.start("gameSettingsScene");
        });

        /*
        FR6 - Join.Priveate
        This code creates a button that will create a new game room when the user presses it.
        The user must type a room code into the window and then press the button to join the game.
        */
        let joinGameText = this.add.text(100, 200, 'Click here to join an existing game room!', { font: '32px Arial', fill: '#FFFFFF' });
        joinGameText.setInteractive();
        joinGameText.on('pointerover', () => {
            joinGameText.setTint(0x00FF00);
        });
        joinGameText.on('pointerout', () => {
            joinGameText.setTint(0xFFFFFF);
        });
        joinGameText.on('pointerdown', () => {
            localStorage.removeItem('email'); 
            localStorage.removeItem('name'); 

            this.scene.start("loadGameScene", {roomCode: inputText, playerName:storedName, playerEmail:storedEmail});
        });

        let roomCodeText = this.add.text(150, 250, initialText, { font: '32px Arial', fill: '#FFFFFF' });
        this.input.keyboard.on('keydown', function (event) {
            if (event.key === 'Backspace' && inputText.length > 0) {
                inputText = inputText.slice(0, -1);
            } else if (event.key === ' ') {
                // do nothing
            } else if (event.key.length === 1 && inputText.length < 4) {
                inputText += event.key;
            }

            if (inputText.length === 0) {
                roomCodeText.setText(initialText);
            } else {
                roomCodeText.setText(inputText);
            }
        });
    }
}