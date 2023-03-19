import Phaser from "phaser";

export default class TaskManager extends Phaser.GameObjects.Container {

    constructor(scene, socket) {
        super(scene);

        this.socket = socket;
        this.tasks = [];
        this.progressBar = null;
        this.progressTween = null;
        this.taskInProgress = null;
    
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
    }
    
    addTask(x, y) {
        const task = this.scene.add.sprite(x, y, 'task');
        task.setInteractive();
        task.on('pointerdown', () => {
            this.startTask(task);
        });
        this.tasks.push(task);
    }
    
    startTask(task) {
        if (this.taskInProgress) return;

        this.taskInProgress = task;
        this.progressBar.setVisible(true);

        let progressTween = null;

        const startProgress = () => {
            progressTween = this.scene.tweens.add({
                targets: this.progressBar.list[1],
                scaleX: 0,
                duration: 3000,
                onComplete: () => {
                    progressTween.stop();
                    progressTween = null;
                    this.completeTask();
                }
            });
        };

        const stopProgress = () => {
            if (!this.taskInProgress || !progressTween) {
                return;
            }
            if (progressTween) {
                progressTween.stop();
                progressTween = null;
                this.resetTask();
            }
        };

        this.scene.input.keyboard.on('keydown-F', startProgress);
        this.scene.input.keyboard.on('keyup-F', stopProgress);

    }

    resetTask() {
        this.taskInProgress = null;
        this.progressBar.setVisible(false);
        this.progressBar.list[1].setScale(1, 1); // reset the scale of the green progress bar
    }
    
    completeTask() {
        this.progressBar.setVisible(false);

        // find index of completed task in tasks array
        const index = this.tasks.indexOf(this.taskInProgress);

        // remove completed task from tasks array
        if (index !== -1) {
            this.tasks.splice(index, 1);
        }

        // this.taskInProgress.destroy();
        this.taskInProgress = null;
    }
}