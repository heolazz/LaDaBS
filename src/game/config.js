import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { LoadingScene } from './scenes/LoadingScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { BedroomScene } from './scenes/BedroomScene';
import { StreetScene } from './scenes/StreetScene';
import { SchoolScene } from './scenes/SchoolScene'; // <--- Import Kelas
import { CorridorScene } from './scenes/CorridorScene'; // <--- Import Lorong
import { EndingScene } from './scenes/EndingScene'; // <--- Import Ending

export const GAME_CONFIG = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
    },
    backgroundColor: '#0a0a0f',
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    scene: [
        BootScene,
        LoadingScene,
        MainMenuScene,
        BedroomScene,
        StreetScene,
        SchoolScene, // <--- Daftar Kelas
        CorridorScene, // <--- Daftar Lorong Sore
        EndingScene  // <--- Daftar Ending (Tamat)
    ]
};
