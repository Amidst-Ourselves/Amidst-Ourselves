import Imposter from '../src/amidstOurselvesGame/containers/imposter';
import { PLAYER_STATE } from './src/amidstOurselvesGame/constants';


describe('Imposter', () => {
  let imposter;

  beforeEach(() => {
    const mockScene = {
      players: {
        'player1': {
          x: 0,
          y: 0,
          playerState: PLAYER_STATE.alive,
        },
        'player2': {
          x: 50,
          y: 50,
          playerState: PLAYER_STATE.alive,
        },
      },
      time: {
        now: 0,
      },
      socket: {
        id: 'player1',
        emit: jest.fn(),
      },
      updateLocalPlayerPosition: jest.fn(),
      add: jest.fn(() => ({
        setOrigin: jest.fn(),
        setPadding: jest.fn(),
        setStyle: jest.fn(),
        setScrollFactor: jest.fn(),
      })),
    };

    imposter = new Imposter(mockScene, mockScene.socket);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('kill() returns true when player is killed', () => {
    const result = imposter.kill(imposter.scene.players, {});
    expect(result).toBeTruthy();
  });

  test('kill() returns false when player is not killed', () => {
    imposter.player.x = 500;
    imposter.player.y = 500;
    const result = imposter.kill(imposter.scene.players, {});
    expect(result).toBeFalsy();
  });

  test('attemptKill() sets lastActionTime to current time', () => {
    imposter.attemptKill(imposter.scene.players, {});
    expect(imposter.lastActionTime).toBe(imposter.scene.time.now);
  });

  test('startCooldown() sets countdown and cooldownTimer', () => {
    imposter.startCooldown();
    expect(imposter.countdown.setText).toHaveBeenCalledWith('10');
    expect(imposter.cooldownTimer).toBeDefined();
    expect(imposter.killReady).toBeFalsy();
  });

  test('updateCooldown() sets countdown style to red when a player is nearby', () => {
    imposter.scene.players['player2'].playerState = PLAYER_STATE.ghost;
    imposter.updateCooldown();
    expect(imposter.countdown.setStyle).toHaveBeenCalledWith({ fill: '#ff0000' });
  });

  test('updateCooldown() sets countdown style to white when no players are nearby', () => {
    imposter.updateCooldown();
    expect(imposter.countdown.setStyle).toHaveBeenCalledWith({ fill: '#ffffff' });
  });
});