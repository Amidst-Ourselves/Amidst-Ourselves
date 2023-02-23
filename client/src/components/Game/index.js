import Phaser from 'phaser';
import React from 'react';
import { config } from '../../amidstOurselvesGame/constants';

class Game extends React.Component {
    constructor(props) {
        super(props);

        this.game = null;
        this.config = config;
    }
    
    componentDidMount() {
        if (!this.game) {
            this.game = new Phaser.Game(this.config);
        }
    }

    render() {
        return <div id="game-container" />;
    }
}

export default Game;