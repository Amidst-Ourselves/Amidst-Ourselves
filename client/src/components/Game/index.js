import Phaser from 'phaser';
import React from 'react';
import { config } from '../../amidstOurselvesGame/constants';

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.game = null;
    }
    
    componentDidMount() {
        this.game = new Phaser.Game(config);
    }

    componentWillUnmount() {
        this.game.destroy(true);
    }

    render() {
        return <div id="game-container" />;
    }
}

export default Game;