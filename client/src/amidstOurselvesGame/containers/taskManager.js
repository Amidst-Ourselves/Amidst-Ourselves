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
    }
    
    createProgressBar() {
        console.log("creating progress bar");
        // add progress bar graphics
        const progressBarBg = this.scene.add.graphics().setScrollFactor(0);
        progressBarBg.fillStyle(0x000000, 0.5);
        progressBarBg.fillRect(0, 0, 200, 20);
        const progressBar = this.scene.add.graphics().setScrollFactor(0);
        progressBar.fillStyle(0x00ff00, 1);
        progressBar.fillRect(0, 0, 200, 20);
        this.progressBar = this.scene.add.container(500, 500, [progressBarBg, progressBar]);
        this.progressBar.setVisible(false);

        this.countdown = this.scene.add.text(1350, 650, 'task', { fontSize: '32px', fill: '#ffffff' })
        .setOrigin(0.5)
        .setPadding(10)
        .setStyle({ backgroundColor: '#000000'});


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
    }
    
    startTask(task) {
        if (this.taskInProgress) return false;

        this.taskInProgress = task;
        this.progressBar.setVisible(true);

        let progressTween = null;

        const startProgress = () => {
            progressTween = this.scene.tweens.add({
                targets: this.progressBar.list[1],
                scaleX: 0,
                duration: 3000,
                onComplete: () => {
                    if (!this.taskInProgress || !progressTween) {
                        return false;
                    }
                    progressTween.stop();
                    progressTween = null;
                    this.completeTask();
                    return true;
                }
            });
        };

        const stopProgress = () => {
            if (!this.taskInProgress || !progressTween) {
                return false;
            }
            if (progressTween) {
                progressTween.stop();
                progressTween = null;
                this.resetTask();
            }
        };

        this.scene.input.keyboard.on('keydown-F', startProgress);
        this.scene.input.keyboard.on('keyup-F', stopProgress);
        // return false;

    }

    resetTask() {
        this.taskInProgress = null;
        this.progressBar.setVisible(false);
        this.progressBar.list[1].setScale(1, 1); // reset the scale of the green progress bar
    }
    
    completeTask() {
        console.log("I'm here");
        this.progressBar.setVisible(false);

        // // find index of completed task in tasks array
        // const index = this.tasks.indexOf(this.taskInProgress);

        // // // remove completed task from tasks array
        // // if (index !== -1) {
        // //     this.tasks.splice(index, 1);
        // // }
        // if (this.tasks[index].isComplete) {
        //     return;
        // }
        // this.completedTasks += 1;
        this.updateCompletedTasks(this.taskInProgress);
        this.updateTotalProgressBar();

        // this.taskInProgress.destroy();
        this.taskInProgress = null;
    }

    updateTotalProgressBar() {
            // update total progress bar
            const totalProgress = (this.completedTasks / this.totalTasks) * 200;
            this.totalProgressBar.clear();
            this.totalProgressBar.fillStyle(0x00ff00, 1);
            this.totalProgressBar.fillRect(0, 0, totalProgress, 20);
    }

    updateCompletedTasks(task) {
        // find index of completed task in tasks array
        const index = this.tasks.indexOf(task);

        // // remove completed task from tasks array
        // if (index !== -1) {
        //     this.tasks.splice(index, 1);
        // }

        if (this.tasks[index].isComplete) {
            return;
        }

        this.tasks[index].isComplete = true;
        this.completedTasks += 1;
    }
}