import 'jest-canvas-mock';
import Phaser from 'phaser';
import TitleScene from '../../amidstOurselvesGame/scenes/titleScene';

jest.mock('phaser', () => {
    const original = jest.requireActual('phaser');
    return {
        ...original,
        Scene: jest.fn(original.Scene)
    };
});

describe('TitleScene', () => {
  let scene;

  beforeEach(() => {
    scene = new TitleScene();
    scene.add = {
        text: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
    };
    scene.input = {
        keyboard: {
            on: jest.fn().mockReturnThis(),
        },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new TitleScene instance', () => {
    expect(scene).toBeInstanceOf(TitleScene);
  });

  test('should initialize data', () => {
    const data = { message: 'Test message' };
    scene.init(data);
    expect(scene.data).toEqual(data);
  });

  test('should create the start game and join game texts', () => {
    scene.create();
    expect(scene.add.text).toHaveBeenCalledTimes(3);
  });

  test('should set texts to be interactive', () => {
    scene.create();
    expect(scene.add.text().setInteractive).toHaveBeenCalledTimes(2);
  });

  test('should listen for pointer events on start game text', () => {
    scene.create();
    expect(scene.add.text().on).toHaveBeenCalledWith('pointerover', expect.any(Function));
    expect(scene.add.text().on).toHaveBeenCalledWith('pointerout', expect.any(Function));
    expect(scene.add.text().on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
  });

  test('should listen for pointer events on join game text', () => {
    scene.create();
    expect(scene.add.text().on).toHaveBeenCalledWith('pointerover', expect.any(Function));
    expect(scene.add.text().on).toHaveBeenCalledWith('pointerout', expect.any(Function));
    expect(scene.add.text().on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
  });

  test('should listen for keyboard input', () => {
    scene.create();
    expect(scene.input.keyboard.on).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
