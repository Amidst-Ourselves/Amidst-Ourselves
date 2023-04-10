import 'jest-canvas-mock';
import Phaser from 'phaser';
import GameSettingsScene, { settingBar } from '../../amidstOurselvesGame/scenes/gameSettingsScene';

const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => store[key] = value.toString(),
        removeItem: (key) => delete store[key],
        clear: () => store = {},
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

jest.mock('phaser', () => ({
    Scene: jest.fn().mockImplementation(() => ({})),
}));

describe('GameSettingsScene', () => {
    let scene;

    beforeEach(() => {
        scene = new GameSettingsScene();
        scene.add = {
            text: jest.fn().mockReturnThis(),
            setInteractive: jest.fn().mockReturnThis(),
            on: jest.fn().mockReturnThis(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should create a new GameSettingsScene instance', () => {
        expect(scene).toBeInstanceOf(GameSettingsScene);
    });

    test('should create game settings', () => {
        scene.create();
        expect(scene.add.text).toHaveBeenCalled();
    });
});

describe('settingBar', () => {
    let _this;
    let setting;

    beforeEach(() => {
        _this = new Phaser.Scene();
        _this.add = {
            text: jest.fn().mockReturnThis(),
            setInteractive: jest.fn().mockReturnThis(),
            on: jest.fn().mockReturnThis(),
        };
        setting = new settingBar(_this, 100, 150, [1, 2, 3], 0, 'Test:', 0);
    });

    test('should create a new settingBar instance', () => {
        expect(setting).toBeInstanceOf(settingBar);
        expect(_this.add.text).toHaveBeenCalledTimes(4);
        expect(setting.increment.on).toHaveBeenCalledTimes(6);
        expect(setting.decrement.on).toHaveBeenCalledTimes(6);
    });

    test('should wrap the value correctly', () => {
        expect(setting.wrap(3)).toBe(0);
        expect(setting.wrap(-1)).toBe(2);
    });

    test('should get the current value correctly', () => {
        expect(setting.getValue()).toBe(1);
    });
});
