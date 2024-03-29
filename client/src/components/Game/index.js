import Phaser from 'phaser';
import TitleScene from '../../amidstOurselvesGame/scenes/titleScene'
import LoadGameScene from '../../amidstOurselvesGame/scenes/loadGameScene';
import GameSettingsScene from '../../amidstOurselvesGame/scenes/gameSettingsScene';
import { WIDTH, HEIGHT } from '../../amidstOurselvesGame/constants';
import React, { useRef, useLayoutEffect } from 'react';


export default function Game({ userData }) {
    const gameContainerRef = useRef(null);
    // let storedName = localStorage.getItem('name');
    // console.log(storedName); // Logan this is the player name. 
    // console.log("from index.js");
    // console.log(userData.name);
    // console.log(userData.email);
  
    useLayoutEffect(() => {
        const config = {
            type: Phaser.AUTO,
            width: WIDTH,
            height: HEIGHT,
            fps: 60,
            parent: gameContainerRef.current,
            pixelArt: true,
            scene: [TitleScene, LoadGameScene, GameSettingsScene]
        };
  
        const game = new Phaser.Game(config);

        //game.scene.getScene('TitleScene').data.set('userData', userData);
        // game.scene.getScene('GameSettingsScene').data.set('userData', userData);


        const handleBeforeUnload = () => {
            console.log('beforeunload');
            game.destroy(true);
        };
        const handleUnload = () => {
            console.log('unload');
            game.destroy(true);
          };
          

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('unload', handleUnload);

  
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('unload', handleUnload);

            game.destroy(true);
        };
    }, []);
  
    return (
      <div ref={gameContainerRef}></div>
    );
}
