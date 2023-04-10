/* 
    FR18 - Meeting.Chat
    This feature enables players to use the chat functionality during meetings.
    The event is enable when player click the interactive button called 'text chat' during a meeting.
    Entered message would be send to server then broadcast to all players in the game room through the addMessage() function
*/

/* 
    FR15 - Common.Report
    The event is trigger when player press R key around a dead body.
    The function show() would be called to display after received the meeting signal.
*/

/* 
    FR16 - Common.Call
    The event is trigger when player press R key around the emergency meeting button.
    The function show() would be called to display after received the meeting signal.
*/

/* 
    FR19 - Meeting.Vote
    The event is triggered after a common meeting or a emergency meeting. 
    Living players can click on interactive vote tab to vote for the player they believe is an imposter.
*/

/* 
    FR20 - Meeting.Profane
    This event is triggered when a player entered some message then press the enter key.
    bad words library is used to check profane.
*/
import Phaser from "phaser";
import { GameObjects, Scene } from 'phaser';
import {
  WIDTH,
  HEIGHT,
  MAP_SCALE,
  FRAMES_PER_COLOUR,
  PLAYER_HEIGHT,
  PLAYER_STATE,
} from "../constants";

export default class Meeting extends GameObjects.Container {
    constructor(scene) {
        super(scene);
        this.scene = scene;
    }

    create() {
        // Create and configure the overlay graphics object
        this.overlay = this.scene.add.graphics();
        this.overlay.fillStyle(0x000000, 1);
        this.overlay.fillRect(0, 0, WIDTH, HEIGHT);
        this.overlay.setAlpha(0.7);
        this.overlay.setScrollFactor(0);
        this.overlay.visible = false;
        this.overlay.setDepth(HEIGHT * MAP_SCALE);

        const boardWidth = 780;
        const boardHeight = 580;
        const boardRadius = 20;
        const boardFillColor = 0xADD8E6;
        const boardStrokeColor = 0x808080;
        const boardStrokeWidth = 4;
    
        this.voting_board = this.scene.add.graphics().setScrollFactor(0).setDepth(HEIGHT * MAP_SCALE+1);
        this.voting_board.fillStyle(boardFillColor);
        this.voting_board.lineStyle(boardStrokeWidth, boardStrokeColor);
        this.voting_board.fillRoundedRect(0, 0, boardWidth, boardHeight, boardRadius);
        this.voting_board.strokeRoundedRect(0, 0, boardWidth, boardHeight, boardRadius);
        this.voting_board.x = this.scene.cameras.main.centerX - 780/2;
        this.voting_board.y = this.scene.cameras.main.centerY - 580/2;
        this.voting_board.visible = false;

        this.textOpened = false;
        this.textButton = this.scene.add.text(100, 500, 'Text Chat', { fontSize: '32px', fill: '#FFFFFF' });
        this.textButton.setOrigin(0.5);
        this.textButton.setScrollFactor(0);
        this.textButton.setScale(0.5);
        this.textButton.visible = false;
        this.textButton.setDepth(HEIGHT * MAP_SCALE+3);
        this.textButton.setPadding(10)
        this.textButton.setStyle({ backgroundColor: '#111' })
        this.textButton.setInteractive({ useHandCursor: true })
        this.textButton.on('pointerdown', () => {
            // Handle player vote button click event
            console.log("pressed");
            if(!this.textOpened){
                this.showTextChat();
            }
            else {
                this.hideText();
            }
        });
        this.textButton.on('pointerover', () => {
            this.textButton.setTint(0x808080);
        });
        this.textButton.on('pointerout', () => {
            // vote_tab.fillStyle(0x000000);
            this.textButton.clearTint();
        });


        this.ghostReminder = this.scene.add.text(300, 50, 'You cant vote as a ghost', { fontSize: '32px', fill: '#FFFFFF' });
        this.ghostReminder.setOrigin(0.5);
        this.ghostReminder.setScrollFactor(0);
        this.ghostReminder.setScale(0.5);
        this.ghostReminder.visible = false;
        this.ghostReminder.setDepth(HEIGHT * MAP_SCALE+3);
        this.ghostReminder.setPadding(10)
        this.ghostReminder.setStyle({ backgroundColor: '#111' })

        //////////////////////////////
        this.text_board = this.scene.add.graphics().setScrollFactor(0).setDepth(HEIGHT * MAP_SCALE+4);
        this.text_board.fillStyle(boardFillColor);
        this.text_board.lineStyle(boardStrokeWidth+4, boardStrokeColor);
        this.text_board.fillRoundedRect(250, 200, boardWidth, boardHeight, boardRadius);
        this.text_board.strokeRoundedRect(250, 200, boardWidth, boardHeight, boardRadius);
        this.text_board.x = this.scene.cameras.main.centerX - 780/2;
        this.text_board.y = this.scene.cameras.main.centerY - 580/2;
        this.text_board.setScale(0.6);
        this.text_board.visible = false;

        // Create a large rectangle for displaying messages
        const messageDisplayX = this.text_board.x - 20;
        const messageDisplayY = this.text_board.y - 60;
        // const messageDisplayWidth = boardWidth * 0.6 - 40;
        const messageDisplayHeight = boardHeight * 0.6 - 40 - boardHeight * 0.2;
        this.messageDisplay = this.scene.add.container(messageDisplayX, messageDisplayY).setScrollFactor(0).setDepth(HEIGHT * MAP_SCALE+5);
        this.messageDisplay.visible = false;
        // Create a smaller rectangle for inputting messages
        const messageInputX = this.text_board.x + 150;
        const messageInputY = this.text_board.y + messageDisplayHeight + 240;
        const messageInputWidth = boardWidth * 0.6;
        const messageInputHeight = boardHeight * 0.1;
        // this.messageInput = this.scene.add.zone(messageInputX, messageInputY, messageInputWidth, messageInputHeight).setOrigin(0.5).setScrollFactor(0).setDepth(7);

        this.messageInput = this.scene.add.graphics().setScrollFactor(0).setDepth(HEIGHT * MAP_SCALE+4);
        this.messageInput.fillStyle(0xFFFFFF);
        this.messageInput.lineStyle(boardStrokeWidth, boardStrokeColor);
        this.messageInput.fillRoundedRect(messageInputX, messageInputY, messageInputWidth, messageInputHeight, boardRadius);
        this.messageInput.strokeRoundedRect(messageInputX, messageInputY, messageInputWidth, messageInputHeight, boardRadius);
        this.messageInput.visible = false;
        // Create the message history array
        this.messageHistory = [];

        const inputMessageX = messageInputX + 10;
        const inputMessageY = messageInputY + 20;
        this.inputMessageText = this.scene.add.text(inputMessageX, inputMessageY, '').setScrollFactor(0).setDepth(HEIGHT * MAP_SCALE+5);
        this.inputMessageText.setColor('0x000000')
        this.inputMessageText.visible = false;
        this.inputMessage = '';

        let countdown = 30;
        this.countdownText = this.scene.add.text(10, 10, `Time left: ${countdown}s`, {
            fontSize: '32px',
            color: '#ffffff'
        }).setScrollFactor(0).setDepth(HEIGHT * MAP_SCALE+3);
        this.countdownText.visible = false;

        ///////////////////////////


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
            const vote_tab = this.scene.add.sprite(WIDTH / 2 - 500/2, 100 + (i * 70) - 50, 'tab').setScrollFactor(0).setDepth(HEIGHT * MAP_SCALE+2);
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

            const confirm_button = this.scene.add.sprite(WIDTH / 2 + 150, 100 + (i * 70) - 37, 'yes').setScrollFactor(0).setDepth(HEIGHT * MAP_SCALE+3);
            confirm_button.setOrigin(0,0);
            confirm_button.setScale(0.4);
            confirm_button.setInteractive();
            confirm_button.id = id;
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


            const cancel_button = this.scene.add.sprite(WIDTH / 2 + 200, 100 + (i * 70) - 35, 'no').setScrollFactor(0).setDepth(HEIGHT * MAP_SCALE+3);
            cancel_button.setOrigin(0,0);
            cancel_button.setScale(0.3);
            cancel_button.setInteractive();
            cancel_button.idx = i;
            cancel_button.player = player;
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


            const button = this.scene.add.text(WIDTH / 2, 100 + (i * 70) - 25, player.name, { fontSize: '32px', fill: '#000000' });
            button.setOrigin(0.5);
            button.setScrollFactor(0);
            button.setScale(0.5);
            button.visible = false;
            button.player = player;
            button.setDepth(HEIGHT * MAP_SCALE+3);
            this.votingButtons.push(button);


            const playerSprite = this.scene.add.sprite(WIDTH / 2 - 400/2, 100 + (i * 70) - 50 + PLAYER_HEIGHT/2, 'player', player.colour * FRAMES_PER_COLOUR).setOrigin(0.5, 1);
            playerSprite.setScrollFactor(0);
            playerSprite.setDepth(HEIGHT * MAP_SCALE+3);
            playerSprite.setScale(2);
            playerSprite.visible = false;
            playerSprite.player = player;
            this.playerSprites.push(playerSprite);
            i++;
        }

        const badWords = require('bad-words');
        this.filter = new badWords();
    }

    show() {

        this.scene.canMove = false;
        console.log("show meeting")
        // Show the meeting screen
        this.overlay.visible = true;
        this.skipText = true;
        this.voting_board.visible = true;
        this.textButton.visible = true;
        this.countdownText.visible = true;
        this.scene.inMeeting = true;

        for (const button of this.votingButtons) {
            if (button.player.playerState != PLAYER_STATE.ghost) {
                button.visible = true;
            }
        }
        for (const player of this.playerSprites) {
            if(player.player.playerState != PLAYER_STATE.ghost) {
                player.visible = true;
            }
            // player.visible = true;
        }
        for (const tab of this.vote_tabs) {
            if (tab.player.playerState != PLAYER_STATE.ghost) {
                tab.visible = true;
                if (this.scene.players[this.scene.socket.id].playerState == PLAYER_STATE.ghost) {
                    tab.disableInteractive();
                }
            }
        }

        if (this.scene.players[this.scene.socket.id].playerState == PLAYER_STATE.ghost) {
            this.ghostReminder.visible = true;
        }

        // Countdown timer
        let countdown = 30;

        this.meetingTimer = this.scene.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
            // console.log(this.scene.sys.game.loop.delta);  
            countdown --;
            this.countdownText.setText(`Time left: ${Math.round(countdown)}s`);

            if (countdown <= 0) {
                this.hide();
                this.hideText();
                this.meetingTimer.remove();
                this.countdownText.visible = false;
                // this.countdownText = null;
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
        this.textButton.visible = false;
        this.ghostReminder.visible = false;
        this.scene.inMeeting = false;

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
        console.log("voted for: ");
        console.log(player);
        this.scene.socket.emit("voted", player);
        this.vote_tabs[idx].setTint(0x808080);
        for (const tab of this.vote_tabs) {
            tab.disableInteractive();
        }
        this.hideConfirmationButtons(idx);
    }

    checkMeetingConditions() {
        const player = this.scene.players[this.scene.socket.id];
        if (player.playerState == PLAYER_STATE.ghost) {
            return false;
        }
        if (Phaser.Math.Distance.Between(this.scene.eButton.x, this.scene.eButton.y, player.x, player.y) < 50 && !this.scene.eButtonPressed) {
            this.scene.eButtonPressed = true;
            return true;
        }
        for (const deadBody in this.scene.deadBodies) {
            if (Phaser.Math.Distance.Between(this.scene.deadBodies[deadBody].x, this.scene.deadBodies[deadBody].y, player.x, player.y) < 50) {
                return true;
            }
        }
        return false;
    }

    showResult(result) {
        console.log("show result");
        console.log(result)
        if (result !== null) {
            const player = this.scene.players[result.result].name;
            let message = `Player ${player} is voted out`; 
            // this.scene.players[result.result].playerState = PLAYER_STATE.ghost;
            if (result.result === this.scene.socket.id) {
                this.scene.changeLocalPlayerToGhost();
                this.scene.taskManager.finishAllTasks();
            } else {
                this.scene.changePlayerToGhost(result.result);
            }
            const text = this.scene.add.text(100, 200, message, { fontSize: '32px', fill: '#ffffff' });
            text.setScrollFactor(0);
            // Countdown timer
            let countdown = 5;

            const timer = this.scene.time.addEvent({
                delay: 1000,
                loop: true,
                callback: () => {
                // console.log(this.scene.sys.game.loop.delta);  
                countdown --;

                if (countdown <= 0) {
                    timer.remove();
                    text.destroy();
                }
                },
                Loop: true,
            });
        }
        else {
            let message = 'Nothing happened';
            const text = this.scene.add.text(100, 200, message, { fontSize: '32px', fill: '#ffffff' });
            text.setScrollFactor(0);
            // Countdown timer
            let countdown = 5;

            const timer = this.scene.time.addEvent({
                delay: 1000,
                loop: true,
                callback: () => {
                // console.log(this.scene.sys.game.loop.delta);  
                countdown --;

                if (countdown <= 0) {
                    timer.remove();
                    text.destroy();
                }
                },
                Loop: true,
            });
        }
    }

    showTextChat() {
        this.messageDisplay.visible = true;
        this.text_board.visible = true;
        this.messageInput.visible = true;
        this.inputMessageText.visible = true;
        this.textOpened = true;
        this.keyboardListener = this.scene.input.keyboard.on('keydown', (event) => {

            if (this.scene.inMeeting) {
                // Handle special keys
                if (event.key === 'Backspace') {
                    // Remove the last character of the input message
                    this.inputMessage = this.inputMessage.slice(0, -1);
                } else if (event.key === 'Enter') {

                    if (!this.filter.isProfane(this.inputMessage) && this.scene.players[this.scene.socket.id].playerState != PLAYER_STATE.ghost) {
                        // Display the input message in the messageDisplay area
                        this.scene.socket.emit("new_message", this.inputMessage);
                        this.addMessage(this.scene.players[this.scene.socket.id].name, this.inputMessage);
                    } 

                    // Clear the input message
                    this.inputMessage = '';
                } else {
                    if (this.inputMessage.length < 30) {
                        const keyCode = event.keyCode;
                        const isAlphanumeric = (keyCode >= 48 && keyCode <= 57) || (keyCode >= 65 && keyCode <= 90) || (keyCode >= 97 && keyCode <= 122);
                        const isCommonPunctuation = (keyCode >= 32 && keyCode <= 47) || (keyCode >= 58 && keyCode <= 64) || (keyCode >= 91 && keyCode <= 96) || (keyCode >= 123 && keyCode <= 126);
                    
                        if (isAlphanumeric || isCommonPunctuation) {
                        // Update the input message with the new character
                            this.inputMessage += event.key;
                        }
                    }
                }

                // Update the inputMessageText object
                this.inputMessageText.setText(this.inputMessage);
            }
        });
        // this.keyboardListener = this.scene.input.keyboard.on('keydown', this.keyboardListener);
    }

    hideText() {
        this.messageDisplay.visible = false;
        this.text_board.visible = false;
        this.messageInput.visible = false;
        this.inputMessageText.visible = false;
        if (this.keyboardListener) {
            this.keyboardListener.visible = false;
        }
        this.textOpened = false;
        // this.scene.input.keyboard.removeListener('keydown', this.keyboardListener);
    }
    updateMessageDisplay() {
        // Clear the current message display
        this.messageDisplay.removeAll(true);

        while (this.messageHistory.length > 10) {
            // Remove the oldest message from the history
            this.messageHistory.shift();
        }
      
        // Add the messages from the message history
        for (let i = 0; i < this.messageHistory.length; i++) {
          const messageObject = this.messageHistory[i];
          const isCurrentUser = messageObject.user === this.scene.socket.id;
          const xPosition = isCurrentUser ? 600 : 200;
          const yPosition = 200 + i * 30; // Adjust this value to control the spacing between messages
      
          // Create a text object for the message
          const messageText = this.scene.add.text(xPosition, yPosition, `${messageObject.user}: ${messageObject.message}`).setScrollFactor(0).setDepth(HEIGHT * MAP_SCALE+5).setBackgroundColor('#FFF9E6').setColor('#000000').setOrigin(isCurrentUser ? 1 : 0, 0);
        //   messageText.setOrigin(isCurrentUser ? 1 : 0, 0);
      
          // Add the message text to the message display
          this.messageDisplay.add(messageText);
        }
    }
    // Create a function to handle adding and displaying messages
    addMessage(user, message) {

        // Create a new message object and push it to the message history array
            const newMessage = {
                user: user,
                message: message,
                timestamp: new Date(),
            };
            this.messageHistory.push(newMessage);

            // Update the message display
            this.updateMessageDisplay();
            
    };

    // Example function for simulating incoming messages from other players
    simulateIncomingMessage = () => {
        const otherPlayerName = 'OtherPlayer';
        const exampleMessage = 'Hello!';
        this.addMessage(otherPlayerName, exampleMessage);
    };

    // Example function for simulating sending a message as the current user
    simulateSendMessage = () => {
        const currentUserName = 'CurrentUser';
        const exampleMessage = 'Hi there!';
        this.addMessage(currentUserName, exampleMessage);
    };

    updateScene(scene) {
        this.scene = scene;   
    }

    endMeeting() {
        this.hide();
        this.hideText();
        this.meetingTimer.remove();
        this.countdownText.visible = false;
    }
}
