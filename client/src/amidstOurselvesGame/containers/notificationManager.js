import Phaser from "phaser";
import { GameObjects, Scene } from 'phaser';

export default class NotificationManager extends GameObjects.Container {
    constructor(scene, x, y, incrementY) {
        super(scene);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.incrementY = incrementY;
        this.notifications = {};
    }

    addNotification(message) {
        for (const existingNotificationId in this.notifications) {
            const existingNotification = this.notifications[existingNotificationId];
            existingNotification.y += this.incrementY;
        }

        const notificationId = this.generateNotificationId();
        const notification = this.scene.add.text(this.x, this.y, message, { font: '15px Arial', fill: '#ff0000' }).setScrollFactor(0);
        this.notifications[notificationId] = notification;

        setTimeout(() => {
            notification.destroy();
            delete this.notifications[notificationId];
        }, 5000);
    }

    generateNotificationId() {
        const timestamp = new Date().getTime();
        const randomString = Math.random().toString(36).substring(2, 8);
        return `${timestamp}-${randomString}`;
    }
}
