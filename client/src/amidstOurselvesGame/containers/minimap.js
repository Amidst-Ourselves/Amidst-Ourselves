import Phaser from "phaser";
import {
    WIDTH,
    HEIGHT,
    MAP1_MINIMAP_SCALE,
    MAP1_MINIMAP_PLAYER_HEIGHT,
    MAP1_MINIMAP_PLAYER_WIDTH,
    MAP_SCALE,
    FRAMES_PER_COLOUR
} from "../constants";

export default class MiniMap extends Phaser.GameObjects.Container {
    constructor(scene, keyCode) {
        super(scene);

        this.keyMiniMap = this.scene.input.keyboard.addKey(keyCode);
    }

    create(player, playerKey, mapKey) {
        this.overlay = this.scene.add.graphics();
        this.overlay.fillStyle(0x000000, 1);
        this.overlay.fillRect(0, 0, WIDTH, HEIGHT);
        this.overlay.setAlpha(0.7);
        this.overlay.setScrollFactor(0);
        this.overlay.visible = false;

        this.miniMap = this.scene.add.image(0, 0, mapKey);
        this.miniMap.setOrigin(0,0);
        this.miniMap.setScale(MAP1_MINIMAP_SCALE);
        this.miniMap.setAlpha(0.7);
        this.miniMap.setScrollFactor(0);
        this.miniMap.visible = false;

        this.miniMapPlayer = this.scene.add.sprite(0, 0, playerKey, player.colour * FRAMES_PER_COLOUR);
        this.miniMapPlayer.setOrigin(0.5, 1);
        this.miniMapPlayer.displayHeight = MAP1_MINIMAP_PLAYER_HEIGHT;
        this.miniMapPlayer.displayWidth = MAP1_MINIMAP_PLAYER_WIDTH;
        this.miniMapPlayer.setScrollFactor(0);
        this.miniMapPlayer.visible = false;

        this.player = player;

        this.keyMiniMap.on('down', () => {
            let complement = !this.miniMap.visible;
            this.miniMap.visible = complement;
            this.overlay.visible = complement;
            this.miniMapPlayer.visible = complement;
        });

        this.miniMapTasks = [];
    }

    createTaskSprites() {
        console.log('tasks', this.scene.taskManager.tasks);
        for (let task of this.scene.taskManager.tasks) {
            const circle = this.scene.add.graphics();
            circle.fillStyle(0xffff00, 1);
            circle.fillCircle(Math.floor(task.x/MAP_SCALE*MAP1_MINIMAP_SCALE), Math.floor(task.y/MAP_SCALE*MAP1_MINIMAP_SCALE), 5);
            circle.setScrollFactor(0);
            circle.visible = false;
            this.miniMapTasks.push(circle);
        }
    }

    toggleMiniMap() { 
        let complement = !this.miniMap.visible;
        this.miniMap.visible = complement;
        this.overlay.visible = complement;
        this.miniMapPlayer.visible = complement;
        this.updateMiniMap_tasks(complement);
    }

    update() {
        this.miniMapPlayer.x = Math.floor(this.player.x/MAP_SCALE*MAP1_MINIMAP_SCALE);
        this.miniMapPlayer.y = Math.floor(this.player.y/MAP_SCALE*MAP1_MINIMAP_SCALE);
    }

    updateMiniMap_tasks(complement) {
        for (let task of this.miniMapTasks) {
            task.visible = complement;
        }
    }
}
