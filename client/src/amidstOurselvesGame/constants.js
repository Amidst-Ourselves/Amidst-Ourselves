export const MAP_SCALE = 6;
export const VIEW_DISTANCE = 500;

export const SPRITE_WIDTH = 13;
export const SPRITE_HEIGHT = 13;
export const SPRITE_CONFIG = {
    frameWidth: SPRITE_WIDTH,
    frameHeight: SPRITE_HEIGHT,
    endFrame: 110,
};

export const PLAYER_WIDTH = SPRITE_WIDTH * MAP_SCALE;
export const PLAYER_HEIGHT = SPRITE_HEIGHT * MAP_SCALE;
export const HEIGHT = 600;
export const WIDTH = 800;
export const SERVER_ADDRESS = 'http://localhost:3000';

export const GAME_STATE = {
    lobby: "lobby",
    action: "action"
};

export const PLAYER_STATE = {
    crewmate: "crewmate",
    imposter: "imposter",
    ghost: "ghost"
};

export const COLOUR_STATION_X = 200 * MAP_SCALE;
export const COLOUR_STATION_Y = 100 * MAP_SCALE;
export const COLOUR_STATION_MIN_DIST = 10 * MAP_SCALE;
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
export const MAP1_TASKS = {
    'upperEngine': {x: 1300, y: 750},
    'lowerEngine': {x: 1400, y: 750},
    'security': {x: 1500, y: 750},
    'reactor': {x: 1600, y: 750},
    'medbay': {x: 1700, y: 750},
    'electrical': {x: 1300, y: 800},
    'storage': {x: 1400, y: 800},
    'admin': {x: 1500, y: 800},
    'weapons': {x: 1600, y: 800},
    'sheilds': {x: 1700, y: 800},
    'o2': {x: 1300, y: 850},
    'navigation': {x: 1400, y: 850},
    'communications': {x: 1500, y: 850},
    'cafeteria': {x: 1600, y: 850}
}

export const BOARD_WIDTH = 780;
export const BOARD_HEIGHT = 580;
export const BOARD_RADIUS = 20;
export const BOARD_COLOR = 0xADD8E6;
export const BOARD_STROKE_COLOR = 0x808080;
export const BOARD_STROKE_WIDTH = 4;
