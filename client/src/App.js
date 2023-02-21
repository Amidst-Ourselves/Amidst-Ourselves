import React, { Component } from 'react';
import Phaser from 'phaser';
import titleScene from './client/scenes/titleScene';
import loadGameScene from './client/scenes/loadGameScene';
import gameScene from './client/scenes/gameScene';
const SPRITE_WIDTH = 84;
const SPRITE_HEIGHT = 128;
const PLAYER_WIDTH = 34;
const PLAYER_HEIGHT = 46;
const SERVER_ADDRESS = 'http://localhost:3000';


class MyGame extends Phaser.Game {
  constructor() {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 800,
      scene: [titleScene, loadGameScene, gameScene],
      parent: 'game-container',
    };

    super(config);
  }
}

export default class App extends Component {
  game = null;

  componentDidMount() {
    this.game = new MyGame();
  }

  componentWillUnmount() {
    this.game.destroy(true);
  }

  render() {
    return (
      <div style={{ textAlign: "center" }}>
        <h1>Amidst Ourselves</h1>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} id="game-container"></div>
      </div>
    );
  }
}



