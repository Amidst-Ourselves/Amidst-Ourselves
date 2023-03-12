import { MAP1_WALLS, MAP1_SPAWN_X, MAP1_SPAWN_Y, MAP_SCALE } from "../constants";


// Finds the new position of the player. Considers wall locations.
export function movePlayer(speed, oldX, oldY, up, down, left, right) {
    let newX = oldX;
    let newY = oldY;

    let moved = false;
    if (up) {
        newY -= speed;
        moved = true;
    }
    if (down) {
        newY += speed;
        moved = true;
    }
    if (left) {
        newX -= speed;
        moved = true;
    }
    if (right) {
        newX += speed;
        moved = true;
    }
    if (!moved) return;

    let wallnewX = Math.floor(newX/MAP_SCALE);
    let wallnewY = Math.floor(newY/MAP_SCALE);
    let walloldX = Math.floor(oldX/MAP_SCALE);
    let walloldY = Math.floor(oldY/MAP_SCALE);

    if (!MAP1_WALLS.has(`${wallnewX}-${wallnewY}`)) {
        return {x: newX, y: newY};
    }
    else if (!MAP1_WALLS.has(`${walloldX}-${wallnewY}`)) {
        return {x: oldX, y: newY};
    }
    else if (!MAP1_WALLS.has(`${wallnewX}-${walloldY}`)) {
        return {x: newX, y: oldY};
    }
    return false;
}
