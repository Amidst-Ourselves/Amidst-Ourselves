import Phaser from "phaser";

export default class TaskManager extends Phaser.GameObjects.Container {

    constructor(scene, socket) {
        super(scene);

        this.socket = socket;
        this.tasks = [];
        this.progressBar = null;
        this.progressTween = null;
        this.taskInProgress = null;
        this.totalTasks = 6;
        this.completedTasks = 0;
    
        // create progress bar
        this.createProgressBar();



        this.taskInProgress = false;
        this.taskTimeRemaining = 0;
        this.taskTimerText = null;
        this.taskCompleteCallback = null;
        this.scene.input.keyboard.on('keydown', this.handleKeyDown, this);
        this.scene.input.keyboard.on('keyup', this.handleKeyUp, this);
    }
    
    createProgressBar() {
        console.log("creating progress bar");
        // // add progress bar graphics
        // const progressBarBg = this.scene.add.graphics().setScrollFactor(0);
        // progressBarBg.fillStyle(0x000000, 0.5);
        // progressBarBg.fillRect(0, 0, 200, 20);
        // const progressBar = this.scene.add.graphics().setScrollFactor(0);
        // progressBar.fillStyle(0x00ff00, 1);
        // progressBar.fillRect(0, 0, 200, 20);
        // this.progressBar = this.scene.add.container(500, 500, [progressBarBg, progressBar]);
        // this.progressBar.setVisible(false);


        this.totalProgressBarBg = this.scene.add.graphics().setScrollFactor(0);
        this.totalProgressBarBg.fillStyle(0x000000, 0.5);
        this.totalProgressBarBg.fillRect(0, 0, 200, 20);
        this.totalProgressBar = this.scene.add.graphics().setScrollFactor(0);
        this.totalProgressBar.fillStyle(0x00ff00, 1);
        this.totalProgressBar.fillRect(0, 0, 0, 20);
        this.totalProgressBarContainer = this.scene.add.container(500, 550, [this.totalProgressBarBg, this.totalProgressBar]);
    
    }
    
    addTask(x, y) {
        const task = this.scene.add.sprite(x, y, 'task');
        task.isComplete = false;
        task.setInteractive();
        task.on('pointerdown', () => {
            this.startTask(task);
        });
        this.tasks.push(task);

        this.countdown = this.scene.add.text(x, y, 'task', { fontSize: '32px', fill: '#ffffff' })
        .setOrigin(0.5)
        .setPadding(10)
        .setStyle({ backgroundColor: '#000000'});
    }

    // Please DO NOT remove this piece of code, I might revisit it in the future.
    // startTask(task) {
    //     let completed = false;
    //     if (this.taskInProgress) return false;

    //     this.taskInProgress = task;
    //     this.progressBar.setVisible(true);

    //     this.progressTween = null;

    //     const startProgress = () => {
    //         this.progressTween = this.scene.tweens.add({
    //             targets: this.progressBar.list[1],
    //             scaleX: 0,
    //             duration: 3000,
    //             onComplete: () => {
    //                 if (!this.taskInProgress || !this.progressTween) {
    //                     return false;
    //                 }
    //                 // this.progressTween.restart();
    //                 this.progressTween.stop();
    //                 this.progressTween = null;
    //                 this.completeTask();
    //                 completed = true;
    //                 return true;
    //             }
    //         });
    //         return false;
    //     };

    //     const stopProgress = () => {
    //         if (!this.taskInProgress || !this.progressTween) {
    //             return false;
    //         }
    //         if (this.progressTween) {
    //             console.log('reset');
    //             this.progressTween.stop();
    //             this.progressBar.list[1].setScale(1, 1); // reset the scale of the green progress bar
    //             this.progressTween.restart();
    //             this.progressTween = null;
    //             this.resetTask();
    //         }
    //         return false;
    //     };

    //     this.scene.input.keyboard.on('keydown-F', startProgress);
    //     this.scene.input.keyboard.on('keyup-F', stopProgress);

    //     this.scene.input.keyboard.removeListener('keydown-F', Phaser.Input.Keyboard.KeyCodes.F, startProgress);
    //     this.scene.input.keyboard.removeListener('keyup-F', Phaser.Input.Keyboard.KeyCodes.F, stopProgress);
    //     return completed;

    // }


    handleKeyDown(event) {
        if (event.key === 'f' && !this.taskInProgress) {
            this.taskInProgress = true;
            this.taskTimeRemaining = 3000;
            
            this.taskTimerText = this.scene.add.text(1350, 800, '3.0', { font: '16px Arial', fill: '#ffffff' });
            this.taskTimerText.setDepth(1);

            // Check if there is already a timer event running and stop it
            if (this.taskTimerEvent) {
                this.scene.time.removeEvent(this.taskTimerEvent);
            }
            this.scene.keyUp.enabled = false;
            this.scene.keyDown.enabled = false;
            this.scene.keyLeft.enabled = false;
            this.scene.keyRight.enabled = false;


            this.taskTimerEvent = this.scene.time.addEvent({ delay: 100, callback: this.updateTaskTimer, callbackScope: this, loop: true });
        }
      }
    
    handleKeyUp(event) {
        if (event.key === 'f' && this.taskInProgress) {
            if (this.taskTimeRemaining <= 0) {
                // this.taskCompleteCallback();
                if (typeof this.taskCompleteCallback === 'function') {
                    this.scene.keyUp.enabled = true;
                    this.scene.keyDown.enabled = true;
                    this.scene.keyLeft.enabled = true;
                    this.scene.keyRight.enabled = true;
                    this.taskCompleteCallback();
                }
            }
            this.taskInProgress = false;
            this.taskTimeRemaining = 0;
            this.taskTimerText.destroy();
            this.scene.keyUp.enabled = true;
            this.scene.keyDown.enabled = true;
            this.scene.keyLeft.enabled = true;
            this.scene.keyRight.enabled = true;
        }
    }
    
    updateTaskTimer() {
        if (this.taskInProgress) {
          this.taskTimeRemaining -= 100;
          const secondsRemaining = (this.taskTimeRemaining / 1000).toFixed(1);
          this.taskTimerText.setText(secondsRemaining);
          if (this.taskTimeRemaining <= 0) {
            this.taskTimerText.setText('0.0');
          }
        }
    }
    
    startTask(completeCallback) {
        this.taskCompleteCallback = completeCallback;
    }

    // Please DO NOT remove this piece of code, I might revisit it in the future.
    // resetTask() {
    //     console.log('reseting');
    //     this.taskInProgress = null;
    //     this.progressBar.setVisible(false);
    //     this.progressBar.list[1].setScale(1, 1); // reset the scale of the green progress bar
    // }
    
    // completeTask() {
    //     console.log("I'm here");
    //     this.progressBar.setVisible(false);

    //     this.updateCompletedTasks(this.taskInProgress);
    //     this.updateTotalProgressBar();
    //     this.taskInProgress = null;
    // }

    updateTotalProgressBar() {
            // update total progress bar
            const totalProgress = (this.completedTasks / this.totalTasks) * 200;
            this.totalProgressBar.clear();
            this.totalProgressBar.fillStyle(0x00ff00, 1);
            this.totalProgressBar.fillRect(0, 0, totalProgress, 20);
    }

    updateCompletedTasks(index) {
        // find index of completed task in tasks array
        // const index = this.tasks.indexOf(task);

        if(index == -1) {
            return;
        }

        if (this.tasks[index].isComplete) {
            return;
        }

        this.tasks[index].isComplete = true;
        this.completedTasks += 1;
    }

    findTask() {
        const player = this.scene.players[this.socket.id];
        const task = this.tasks.find(task => 
            Phaser.Math.Distance.Between(task.x, task.y, player.x, player.y) < 50 && !task.isComplete);
        return task;
    }
}