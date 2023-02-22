import Phaser from 'phaser';

export default class titleScene extends Phaser.Scene {
    constructor() {
        super("titleScene")
    }

    init(data) {
        this.data = data;
        console.log(data);
    }

    create() {
        const initialText = 'Type room code...';
        let inputText = '';

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

        let joinGameText = this.add.text(100, 200, 'Click here to join an existing game room!', { font: '32px Arial', fill: '#FFFFFF' });
        joinGameText.setInteractive();
        joinGameText.on('pointerover', () => {
            joinGameText.setTint(0x00FF00);
        });
        joinGameText.on('pointerout', () => {
            joinGameText.setTint(0xFFFFFF);
        });
        joinGameText.on('pointerdown', () => {
            this.scene.start("loadGameScene", {roomCode: inputText});
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