export const MAP_SCALE = 6;
export const VIEW_DISTANCE = 500;

export const SPRITE_WIDTH = 13;
export const SPRITE_HEIGHT = 13;
export const SPRITE_CONFIG = {
    frameWidth: SPRITE_WIDTH,
    frameHeight: SPRITE_HEIGHT,
    endFrame: 110,
};

export const BUTTON_SPRITE_HEIGHT = 8;
export const BUTTON_SPRITE_WIDTH = 10;
export const BUTTON_CONFIG = {
    frameWidth: BUTTON_SPRITE_WIDTH,
    frameHeight: BUTTON_SPRITE_HEIGHT,
    endFrame: 1,
};

export const TASK_SPRITE_HEIGHT = 7;
export const TASK_SPRITE_WIDTH = 7;
export const TASK_CONFIG = {
    frameWidth: TASK_SPRITE_WIDTH,
    frameHeight: TASK_SPRITE_HEIGHT,
    endFrame: 1,
};

export const PLAYER_WIDTH = SPRITE_WIDTH * MAP_SCALE;
export const PLAYER_HEIGHT = SPRITE_HEIGHT * MAP_SCALE;
export const HEIGHT = 600;
export const WIDTH = 800;
export const SERVER_ADDRESS = process.env.REACT_APP_HOST_URL;

export const GAME_STATE = {
    lobby: "lobby",
    action: "action",
    end: "end"
};

export const PLAYER_STATE = {
    crewmate: "crewmate",
    imposter: "imposter",
    ghost: "ghost"
};

export const COLOUR_STATION_MIN_DIST = 20 * MAP_SCALE;
export const FRAMES_PER_COLOUR = 11;
export const NUMBER_OF_COLOURS = 10;
export const GHOST_FRAME_OFFSET = 0; // this is 0 because I don't want to make ghost animations
export const DEAD_BODY_FRAME_OFFSET = 8;

export const COLOUR_NAMES = [
    'red',
    'blue',
    'green',
    'pink',
    'orange',
    'yellow',
    'black',
    'white',
    'purple',
    'brown'
];

export const MAP1_SPAWN_X = 230 * MAP_SCALE;
export const MAP1_SPAWN_Y = 130 * MAP_SCALE;

export const MAP1_WIDTH = 430;
export const MAP1_HEIGHT = 310;

export const MAP1_MINIMAP_SCALE = WIDTH/MAP1_WIDTH;
export const MAP1_MINIMAP_PLAYER_WIDTH = SPRITE_WIDTH * MAP1_MINIMAP_SCALE;
export const MAP1_MINIMAP_PLAYER_HEIGHT = SPRITE_HEIGHT * MAP1_MINIMAP_SCALE;

export const MAP1_TASK_MIN_DIST = 10 * MAP_SCALE;

export const BUTTON_X = 232;
export const BUTTON_Y = 110;

export const MAP1_TASKS = {
    'upperEngine': {x: 75, y: 98},
    'lowerEngine': {x: 75, y: 227},
    'security': {x: 124, y: 148},
    'reactor': {x: 39, y: 193},
    'medbay': {x: 175, y: 162},
    'electrical': {x: 155, y: 189},
    'storage': {x: 243, y: 236},
    'o2': {x: 291, y: 153},
    'weapons': {x: 369, y: 84},
    'sheilds': {x: 323, y: 236},
    'admin': {x: 305, y: 174},
    'navigation': {x: 387, y: 156},
    'communications': {x: 274, y: 247},
    //'cafeteria': {x: 0, y: 0}
}

export const BOARD_WIDTH = 780;
export const BOARD_HEIGHT = 580;
export const BOARD_RADIUS = 20;
export const BOARD_COLOR = 0xADD8E6;
export const BOARD_STROKE_COLOR = 0x808080;
export const BOARD_STROKE_WIDTH = 4;
