import Phaser from 'phaser';
import TitleScene from '../../amidstOurselvesGame/scenes/titleScene'
import LoadGameScene from '../../amidstOurselvesGame/scenes/loadGameScene';
import GameSettingsScene from '../../amidstOurselvesGame/scenes/gameSettingsScene';
import { WIDTH, HEIGHT } from '../../amidstOurselvesGame/constants';
import React, { useRef, useEffect } from 'react';


export default function Game() {
    const gameContainerRef = useRef(null);
  
    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            width: WIDTH,
            height: HEIGHT,
            parent: gameContainerRef.current,
            pixelArt: true,
            scene: [TitleScene, LoadGameScene, GameSettingsScene]
        };
  
        const game = new Phaser.Game(config);
  
        return () => {
            game.destroy(true);
        };
    }, []);
  
    return (
      <div ref={gameContainerRef}></div>
    );
  }