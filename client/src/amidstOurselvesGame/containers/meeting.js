import Phaser from "phaser";
import {
  WIDTH,
  HEIGHT,
  MAP1_MINIMAP_SCALE,
  MAP1_MINIMAP_PLAYER_HEIGHT,
  MAP1_MINIMAP_PLAYER_WIDTH,
  MAP_SCALE,
  FRAMES_PER_COLOUR,
  PLAYER_HEIGHT,
  SPRITE_CONFIG,
} from "../constants";

export default class Meeting extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene);

        // Create and configure the overlay graphics object
        this.overlay = this.scene.add.graphics();
        this.overlay.fillStyle(0x000000, 1);
        this.overlay.fillRect(0, 0, WIDTH, HEIGHT);
        this.overlay.setAlpha(0.7);
        this.overlay.setScrollFactor(0);
        this.overlay.visible = false;
        this.overlay.setDepth(2);

        // Create a text object for the skip button
        this.skipText = this.scene.add.text(20, HEIGHT - 50, "Skip", {
            fontSize: "32px",
            color: "#ffffff",
        });
        this.skipText.setScrollFactor(0);
        this.skipText.setInteractive();
        this.skipText.on("pointerdown", () => {
        // Handle skip button click event
        });
        this.skipText.visible = false;
        this.skipText.setDepth(4);

        // this.scene.load.spritesheet('player', 'amidstOurselvesAssets/player.png', SPRITE_CONFIG);
        // this.scene.load.spritesheet('tab', 'amidstOurselvesAssets/tab.png', {frameWidth: 500,
        //     frameHeight: 50});

        const boardWidth = 780;
        const boardHeight = 580;
        const boardRadius = 20;
        const boardFillColor = 0xADD8E6;
        const boardStrokeColor = 0x808080;
        const boardStrokeWidth = 4;
    
        this.voting_board = this.scene.add.graphics().setScrollFactor(0).setDepth(3);
        this.voting_board.fillStyle(boardFillColor);
        this.voting_board.lineStyle(boardStrokeWidth, boardStrokeColor);
        this.voting_board.fillRoundedRect(0, 0, boardWidth, boardHeight, boardRadius);
        this.voting_board.strokeRoundedRect(0, 0, boardWidth, boardHeight, boardRadius);
        this.voting_board.x = this.scene.cameras.main.centerX - 780/2;
        this.voting_board.y = this.scene.cameras.main.centerY - 580/2;
        this.voting_board.visible = false;

        let i = 0;
        this.votingButtons = [];
        this.playerSprites = [];
        this.vote_tabs = [];
        this.confirm_buttons = [];
        this.cancel_buttons = [];
        for (const id in this.scene.players) {
            const player = this.scene.players[id];
            // console.log(player)

            // const vote_tab = this.scene.add.graphics().setScrollFactor(0).setDepth(4);
            const vote_tab = this.scene.add.sprite(WIDTH / 2 - 500/2, 100 + (i * 70) - 50, 'tab').setScrollFactor(0).setDepth(4);
            vote_tab.setOrigin(0,0);
            vote_tab.setScale(0.5);
            vote_tab.setInteractive();
            vote_tab.player = player;
            vote_tab.idx = i;
            vote_tab.on('pointerdown', () => {
                // Handle player vote button click event
                console.log("pressed");
                this.showConfirmationButtons(vote_tab.idx);
            });
            vote_tab.on('pointerover', () => {
                vote_tab.setTint(0x808080);
            });
            vote_tab.on('pointerout', () => {
                // vote_tab.fillStyle(0x000000);
                vote_tab.clearTint();
            });
            vote_tab.visible = false;
            this.vote_tabs.push(vote_tab);

            const confirm_button = this.scene.add.sprite(WIDTH / 2 + 150, 100 + (i * 70) - 37, 'yes').setScrollFactor(0).setDepth(5);
            confirm_button.setOrigin(0,0);
            confirm_button.setScale(0.4);
            confirm_button.setInteractive();
            confirm_button.player = id;
            confirm_button.idx = i;
            confirm_button.on('pointerdown', () => {
                // Handle player vote button click event
                console.log("pressed");
                this.updateVotes(confirm_button.id, confirm_button.idx);
            });
            confirm_button.on('pointerover', () => {
                confirm_button.setTint(0x808080);
            });
            confirm_button.on('pointerout', () => {
                // vote_tab.fillStyle(0x000000);
                confirm_button.clearTint();
            });
            confirm_button.visible = false;
            this.confirm_buttons.push(confirm_button);


            const cancel_button = this.scene.add.sprite(WIDTH / 2 + 200, 100 + (i * 70) - 35, 'no').setScrollFactor(0).setDepth(5);
            cancel_button.setOrigin(0,0);
            cancel_button.setScale(0.3);
            cancel_button.setInteractive();
            cancel_button.idx = i;
            cancel_button.on('pointerdown', () => {
                // Handle player vote button click event
                console.log("pressed");
                this.hideConfirmationButtons(cancel_button.idx);

            });
            cancel_button.on('pointerover', () => {
                cancel_button.setTint(0x808080);
            });
            cancel_button.on('pointerout', () => {
                // vote_tab.fillStyle(0x000000);
                cancel_button.clearTint();
            });
            cancel_button.visible = false;
            this.cancel_buttons.push(cancel_button);


            const button = this.scene.add.text(WIDTH / 2, 100 + (i * 70) - 25, id, { fontSize: '32px', fill: '#000000' });
            button.setOrigin(0.5);
            button.setScrollFactor(0);
            button.setScale(0.5);
            button.visible = false;
            button.setDepth(5);
            this.votingButtons.push(button);


            const playerSprite = this.scene.add.sprite(WIDTH / 2 - 400/2, 100 + (i * 70) - 50 + PLAYER_HEIGHT/2, 'player', player.colour * FRAMES_PER_COLOUR).setOrigin(0.5, 1);
            playerSprite.setScrollFactor(0);
            playerSprite.setDepth(5);
            playerSprite.setScale(2);
            playerSprite.visible = false;
            this.playerSprites.push(playerSprite);
            i++;
        }



    }

    show() {

        this.scene.canMove = false;
        console.log("show meeting")
        // Show the meeting screen
        this.overlay.visible = true;
        this.skipText = true;
        this.voting_board.visible = true;

        for (const button of this.votingButtons) {
            button.visible = true;
        }
        for (const player of this.playerSprites) {
            player.visible = true;
        }
        for (const tab of this.vote_tabs) {
            tab.visible = true;
        }

          // Countdown timer
        let countdown = 30;
        const countdownText = this.scene.add.text(10, 10, `Time left: ${countdown}s`, {
            fontSize: '32px',
            color: '#ffffff'
        }).setScrollFactor(0).setDepth(5);

        const timer = this.scene.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
            // console.log(this.scene.sys.game.loop.delta);  
            countdown --;
            countdownText.setText(`Time left: ${Math.round(countdown)}s`);

            if (countdown <= 0) {
                this.hide();
                timer.remove();
                countdownText.visible = false;
            }
            },
            Loop: true,
        });
    }

    hide() {
        this.scene.canMove = true;
        // Hide the meeting screen
        this.overlay.visible = false;
        this.skipText = false;
        this.voting_board.visible = false;

        for (const button of this.votingButtons) {
            button.visible = false;
        }
        for (const player of this.playerSprites) {
            player.visible = false;
        }
        for (const tab of this.vote_tabs) {
            tab.visible = false;
            tab.clearTint();
            tab.setInteractive();
            this.scene.socket.emit("meetingTimeUp");
        }
    }

    showConfirmationButtons(idx) {
        this.confirm_buttons[idx].visible = true;
        this.cancel_buttons[idx].visible = true;
    }

    hideConfirmationButtons(idx) {
        this.confirm_buttons[idx].visible = false;
        this.cancel_buttons[idx].visible = false;
    }

    updateVotes(player, idx) {
        this.scene.socket.emit("voted", player);
        this.vote_tabs[idx].setTint(0x808080);
        for (const tab of this.vote_tabs) {
            tab.disableInteractive();
        }
        this.hideConfirmationButtons(idx);
    }

    checkMeetingConditions() {
        const player = this.scene.players[this.scene.socket.id];
        for (const deadBody in this.scene.deadBodies) {
            if (Phaser.Math.Distance.Between(this.scene.deadBodies[deadBody].x, this.scene.deadBodies[deadBody].y, player.x, player.y) < 50) {
                return true;
            }
        }
        return false;
    }

    showResult(result) {
        console.log("show result");
        if (result) {
            
        //     // Countdown timer
        //     let countdown = 5;

        //     const timer = this.scene.time.addEvent({
        //         delay: 1000,
        //         loop: true,
        //         callback: () => {
        //         // console.log(this.scene.sys.game.loop.delta);  
        //         countdown --;

        //         if (countdown <= 0) {
        //             timer.remove();
        //         }
        //         },
        //         Loop: true,
        //     });
        // }
            const text = this.scene.add.text(400, 200, '', { fontSize: '32px', fill: '#ffffff' });
            text.setOrigin(0.5);
            text.setScrollFactor(0);
        
            const message = 'Player { } is voted out';
            const duration = 1000;
            const delay = 200;
        
            let tween = this.scene.tweens.add({
                targets: text,
                duration: duration,
                delay: delay,
                ease: 'Linear',
                repeat: message.length - 1,
                onUpdate: function (tween, target) {
                    const progress = tween.totalProgress();
                    const currentIndex = Math.floor(progress * message.length);
                    target.setText(message.substring(0, currentIndex + 1));
                }
            });
        }
        else {
            const text = this.scene.add.text(400, 200, '', { fontSize: '32px', fill: '#ffffff' });
            text.setOrigin(0.5);
            text.setScrollFactor(0);
        
            const message = 'Nothing happened';
            const duration = 1000;
            const delay = 200;
        
            let tween = this.scene.tweens.add({
                targets: text,
                duration: duration,
                delay: delay,
                ease: 'Linear',
                repeat: message.length - 1,
                onUpdate: function (tween, target) {
                    const progress = tween.totalProgress();
                    const currentIndex = Math.floor(progress * message.length);
                    target.setText(message.substring(0, currentIndex + 1));
                }
            });
        }
    }
}
