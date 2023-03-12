import Phaser from 'phaser';
import titleScene from '../../amidstOurselvesGame/scenes/titleScene'
import loadGameScene from '../../amidstOurselvesGame/scenes/loadGameScene';
import gameSettingsScene from '../../amidstOurselvesGame/scenes/gameSettingsScene';
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
            scene: [titleScene, loadGameScene, gameSettingsScene]
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