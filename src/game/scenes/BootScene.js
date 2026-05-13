import Phaser from 'phaser';

/**
 * BootScene — Scene pertama yang berjalan.
 * Fungsi: preload asset UI dan langsung pindah ke LoadingScene.
 */
export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Load hanya asset minimal untuk loading screen
        // this.load.image('loading_bg', 'assets/ui/loading_bg.png');
        // this.load.image('progress_bar', 'assets/ui/progress_bar.png');
    }

    create() {
        this.scene.launch('HUDScene');
        this.scene.start('LoadingScene');
    }
}
