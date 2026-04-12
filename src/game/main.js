import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { UpgradeMenu } from './scenes/UpgradeMenu';
import { PauseMenu } from './scenes/PauseMenu';
import { AUTO, Game, Physics } from 'phaser';

const config = {
    type: AUTO,
    parent: 'game-container',
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    scale: {
        mode: Phaser.Scale.RESIZE,
        width: '100%',
        height: '100%',
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scene: [
        Boot,
        MainMenu,
        MainGame,
        GameOver,
        UpgradeMenu,
        PauseMenu
    ]
};

const StartGame = (parent) => {
    return new Game({ ...config, parent });
}

export default StartGame;