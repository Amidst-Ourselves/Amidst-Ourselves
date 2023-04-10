import Phaser from 'phaser';
import { HEIGHT } from "../constants";


export default class GameSettingsScene extends Phaser.Scene {
    constructor() {
        super("gameSettingsScene");
    }

    create() {

        let storedName = localStorage.getItem('name');
        let storedEmail = localStorage.getItem('email');
        if(!storedName){
            storedName = "Anonymous";
        }
        if(!storedEmail){
            storedEmail = "Anonymous";
        }


        this.add.text(50, 50, "Game Settings:", { font: '32px Arial', fill: '#FFFFFF' });
        let gameCreationText = this.add.text(50, HEIGHT - 100, "Create Game", { font: '32px Arial', fill: '#FFFFFF' });

        const playerLimit = new settingBar(this, 100, 150, [5,6,7,8], 0, "Player Limit:");
        const imposterCount = new settingBar(this, 100, 200, [1,2], 0, "Imposter Count:");
        const playerSpeed = new settingBar(this, 100, 250, [2,3,4,5], 0, "Player Speed:");
        const map = new settingBar(this, 100, 300, ["mp_1", "mp_2"], 0, "Map:", 60);

        gameCreationText.setInteractive();
        gameCreationText.on('pointerover', () => {
            gameCreationText.setTint(0xFFFF00);
        });
        gameCreationText.on('pointerout', () => {
            gameCreationText.setTint(0xFFFFFF);
        });
        gameCreationText.on('pointerdown', () => {
            localStorage.removeItem('email'); 
            localStorage.removeItem('name'); 

            this.scene.start("loadGameScene", {
                playerLimit: playerLimit.getValue(),
                playerName:storedName,
                playerEmail:storedEmail,
                imposterCount: imposterCount.getValue(),
                playerSpeed: playerSpeed.getValue(),
                map: map.getValue(),
                taskCount: 6
            });
        });
    }
}


export class settingBar {
    /*
        _this: Phaser.Scene -> the scene on which to draw the setting bar
        x: number -> the x coordinate of the setting bar (left justified)
        y: number -> the y coordinate of the setting bar (top justified)
        range: list -> the list of setting values
        initial: int -> the starting index
        title: string -> the name of the setting
        additionalOffset: number -> extra offset for the increment button
    */
    constructor(_this, x, y, range, initial, title, additionalOffset) {
        if (additionalOffset === undefined) {
            additionalOffset = 0;
        }

        const OFFSET = 50;
        const FONT = { font: '32px Arial', fill: '#FFFFFF' };

        this.x = x;
        this.y = y;
        this.range = range;
        this.size = range.length;
        this.current = this.wrap(initial);

        this.title = _this.add.text(x, y, title, FONT);
        this.increment = _this.add.text(x + OFFSET*8 + additionalOffset, y, '>', FONT);
        this.decrement = _this.add.text(x + OFFSET*6, y, '<', FONT);
        this.display = _this.add.text(x + OFFSET*7, y, this.range[initial], FONT);

        this.increment.setInteractive();
        this.increment.on('pointerover', () => {
            this.increment.setTint(0x00FF00);
        });
        this.increment.on('pointerout', () => {
            this.increment.setTint(0xFFFFFF);
        });
        this.increment.on('pointerdown', () => {
            this.current = this.wrap(this.current + 1);
            this.display.setText(this.range[this.current]);
        });

        this.decrement.setInteractive();
        this.decrement.on('pointerover', () => {
            this.decrement.setTint(0xFF0000);
        });
        this.decrement.on('pointerout', () => {
            this.decrement.setTint(0xFFFFFF);
        });
        this.decrement.on('pointerdown', () => {
            this.current = this.wrap(this.current - 1);
            this.display.setText(this.range[this.current]);
        });
    }

    wrap(x) {
        return (x%this.size + this.size)%this.size;
    }

    getValue() {
        return this.range[this.current];
    }
}