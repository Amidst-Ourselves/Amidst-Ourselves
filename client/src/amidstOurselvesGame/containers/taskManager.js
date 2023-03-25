import Phaser from "phaser";
import { MAP1_TASKS, MAP1_TASK_MIN_DIST } from "../constants";

export default class TaskManager extends Phaser.GameObjects.Container {

    constructor(scene, keyCode, totalTasks, taskCompleteCallback) {
        super(scene);

        this.tasks = {};
        this.taskNames = {};

        this.keyTask = this.scene.input.keyboard.addKey(keyCode);

        this.progressBar = null;
        this.taskInProgress = null;
        this.totalTasks = totalTasks;
        this.completedTasks = 0;

        this.taskCompleteCallback = taskCompleteCallback;

        this.currentTaskName = undefined;

        this.taskInProgress = false;
        this.taskTimeRemaining = 0;
        this.taskTimerText = null;
        this.scene.input.keyboard.on('keydown', this.handleKeyDown, this);
        this.scene.input.keyboard.on('keyup', this.handleKeyUp, this);
        this.taskAvailable = false;
    }

    create(player) {
        this.totalProgressBarBg = this.scene.add.graphics()
        this.totalProgressBarBg.fillStyle(0x000000, 0.5);
        this.totalProgressBarBg.fillRect(0, 0, 200, 20);
        this.totalProgressBarBg.setScrollFactor(0);

        this.totalProgressBar = this.scene.add.graphics().setScrollFactor(0);
        this.totalProgressBar.fillStyle(0x00ff00, 1);
        this.totalProgressBar.fillRect(0, 0, 0, 20);
        this.totalProgressBarBg.setScrollFactor(0);

        for (let taskName of player.tasks) {
            if (MAP1_TASKS[taskName] !== undefined) {
                this.addTask(taskName, MAP1_TASKS[taskName].x, MAP1_TASKS[taskName].y);
            }
        }

        this.player = player;

        this.keyTask.on('down', () => {
            const taskName = this.findTask();
            if (taskName !== undefined) {
                console.log("starting task");
                this.taskAvailable = true;
                this.startTask(taskName);
            }
            else {
                this.taskAvailable = false;
            }
        });
    }

    addTask(name, x, y) {
        let task = this.scene.add.sprite(x, y, 'task');
        let taskName = this.scene.add.text(x, y, name, { fontSize: '32px', fill: '#ffffff' })

        this.tasks[name] = task;
        this.taskNames[name] = taskName
    }

    removeTask(name) {
        this.tasks[name].destroy();
        delete this.tasks[name];

        this.taskNames[name].destroy();
        delete this.taskNames[name];
    }

    getTaskInfo() {
        let taskInfo = {};
        for (let task in this.tasks) {
            taskInfo[task] = {x: this.tasks[task].x, y: this.tasks[task].y};
        }
        return taskInfo;
    }

    handleKeyDown(event) {
        if (event.key === 'f' && !this.taskInProgress && this.taskAvailable) {
            this.taskInProgress = true;
            this.taskTimeRemaining = 3000;
            
            this.taskTimerText = this.scene.add.text(250, 0, '3.0', { font: '16px Arial', fill: '#ffffff' });
            this.taskTimerText.setScrollFactor(0);
            this.taskTimerText.setDepth(1);

            // Check if there is already a timer event running and stop it
            if (this.taskTimerEvent) {
                this.scene.time.removeEvent(this.taskTimerEvent);
            }
            this.scene.canMove = false;


            this.taskTimerEvent = this.scene.time.addEvent({ delay: 100, callback: this.updateTaskTimer, callbackScope: this, loop: true });
        }
      }
    
    handleKeyUp(event) {
        if (event.key === 'f' && this.taskInProgress) {
            if (this.taskTimeRemaining <= 0) {
                this.taskCompleteCallback(this.currentTaskName);
            }
            this.currentTaskName = undefined;
            this.taskInProgress = false;
            this.taskTimeRemaining = 0;
            this.taskTimerText.destroy();
            this.scene.canMove = true;
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
    
    startTask(taskName) {
        this.currentTaskName = taskName;
    }

    finishTask(taskName) {
        this.removeTask(taskName);
        this.incrementTaskbar(taskName);
    }

    incrementTaskbar() {
        this.completedTasks += 1;
        let totalProgress = (this.completedTasks / this.totalTasks) * 200;

        this.totalProgressBar.clear();
        this.totalProgressBar.fillStyle(0x00ff00, 1);
        this.totalProgressBar.fillRect(0, 0, totalProgress, 20);
    }

    findTask() {
        for (let task in this.tasks) {
            if (this.inRange(this.tasks[task].x, this.tasks[task].y)) {
                return task;
            }
        }
        return undefined;
    }

    inRange(taskX, taskY) {
        return this.manhattanDist(this.player.x, this.player.y, taskX, taskY) < MAP1_TASK_MIN_DIST;
    }

    manhattanDist(x1, y1, x2, y2) {
        return Math.abs(x1-x2) + Math.abs(y1-y2);
    }
}
