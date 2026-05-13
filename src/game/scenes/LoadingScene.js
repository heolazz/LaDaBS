import Phaser from 'phaser';

/**
 * LoadingScene — Preload SEMUA asset game di sini.
 * Tampilkan progress bar loading.
 */
export class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadingScene' });
    }

    preload() {
        const { width, height } = this.scale;

        // --- Loading Bar UI ---
        const progressBg = this.add.graphics();
        progressBg.fillStyle(0x222244, 1);
        progressBg.fillRoundedRect(width / 2 - 200, height / 2 - 15, 400, 30, 8);

        const progressBar = this.add.graphics();

        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#aaaacc'
        }).setOrigin(0.5);

        const titleText = this.add.text(width / 2, height / 2 - 120, 'Last Day Before Something', {
            fontFamily: 'serif',
            fontSize: '28px',
            color: '#ffffff',
            alpha: 0.7
        }).setOrigin(0.5);

        // Progress bar update
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x8899ff, 1);
            progressBar.fillRoundedRect(width / 2 - 198, height / 2 - 13, 396 * value, 26, 6);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBg.destroy();
            loadingText.destroy();
        });

        // =========================================
        // LOAD SEMUA ASSET DI SINI
        // =========================================

        // === ASSETS MC ===
        this.load.image('mc_idle_1', 'assets/mc/idle/mc_idle.png');
        this.load.image('mc_idle_2', 'assets/mc/idle/mc_idle_2.png');
        this.load.image('mc_idle_3', 'assets/mc/idle/mc_idle_3.png');

        this.load.image('mc_walk_1', 'assets/mc/walk/mc_walk_1.png');
        this.load.image('mc_walk_2', 'assets/mc/walk/mc_walk_2.png');
        this.load.image('mc_walk_3', 'assets/mc/walk/mc_walk_3.png');

        this.load.image('mc_portrait', 'assets/mc/dialog/mc_dialog_neutral.png');
        this.load.image('mc_dialog_sad', 'assets/mc/dialog/mc_dialog_sad.png');

        // === ASSETS AIRA ===
        this.load.image('aira_idle_1', 'assets/fl/idle/aira_idle_1.png');
        this.load.image('aira_idle_2', 'assets/fl/idle/aira_idle_2.png');
        this.load.image('aira_idle_3', 'assets/fl/idle/aira_idle_3.png');

        this.load.image('aira_walk_1', 'assets/fl/walk/aira_walk_1.png');
        this.load.image('aira_walk_2', 'assets/fl/walk/aira_walk_2.png');
        this.load.image('aira_walk_3', 'assets/fl/walk/aira_walk_3.png');

        // === ENVIRONMENT: BEDROOM ===
        this.load.image('bedroom_wall', 'assets/environment/bedroom/bedroom_wall.png');
        this.load.image('bedroom_tile', 'assets/environment/bedroom/bedroom_tile.png');

        // === ENVIRONMENT: STREET ===
        this.load.image('street_sky', 'assets/environment/street/sky_overcast.png');
        this.load.image('buildings_far', 'assets/environment/street/buildings_far.png');
        this.load.image('street_river', 'assets/environment/street/street_river.png');
        this.load.image('street_railway', 'assets/environment/street/street_railway.png');
        this.load.image('street_fence', 'assets/environment/street/street_fence.png');
        this.load.image('street_road', 'assets/environment/street/street_road.png');
        this.load.image('street_ground', 'assets/environment/street/street_ground.png');
        this.load.image('sakura_tree', 'assets/environment/street/sakura_tree.png');

        // === PROPS: STREET ===
        this.load.image('train_head', 'assets/props/street/train_head.png');
        this.load.image('train_carriage', 'assets/props/street/train_carriage.png');

        // === PROPS: BEDROOM ===
        this.load.image('bedroom_bed', 'assets/props/bedroom/prop_bed.png');
        this.load.image('bedroom_desk', 'assets/props/bedroom/prop_desk.png');
        this.load.image('bedroom_wardrobe', 'assets/props/bedroom/prop_wardrobe.png');
        this.load.image('bedroom_bookshelf', 'assets/props/bedroom/prop_bookshelf.png');
        this.load.image('bedroom_window', 'assets/props/bedroom/prop_window.png');
        this.load.image('bedroom_door', 'assets/props/bedroom/prop_door.png');

        // === COVER / UI ===
        this.load.image('cover_bg', 'assets/Cover.png');

        // Backgrounds (scene lain)
        // this.load.image('bedroom_bg', 'assets/backgrounds/bedroom_bg.png');
        // this.load.image('street_bg', 'assets/backgrounds/street_bg.png');
        // this.load.image('school_class_bg', 'assets/backgrounds/school_class_bg.png');

        // UI
        // this.load.image('dialog_box', 'assets/ui/dialog_box.png');
        // this.load.image('name_tag', 'assets/ui/name_tag.png');
        // this.load.image('indicator_e', 'assets/ui/indicator_e.png');

        // Tilemaps
        // this.load.tilemapTiledJSON('bedroom_map', 'assets/tilesets/bedroom_map.json');
        // this.load.image('bedroom_tileset', 'assets/tilesets/bedroom_tileset.png');

        // Audio
        // this.load.audio('bedroom_bgm', 'assets/audio/bgm/bedroom_theme.mp3');
        // this.load.audio('footstep_sfx', 'assets/audio/sfx/footstep.mp3');
        // this.load.audio('dialog_blip', 'assets/audio/sfx/dialog_blip.mp3');
    }

    create() {
        // Buat animasi MC
        this.anims.create({
            key: 'mc_idle',
            frames: [
                { key: 'mc_idle_1' },
                { key: 'mc_idle_2' },
                { key: 'mc_idle_3' }
            ],
            frameRate: 4,
            repeat: -1
        });

        this.anims.create({
            key: 'mc_walk',
            frames: [
                { key: 'mc_walk_1' },
                { key: 'mc_walk_2' },
                { key: 'mc_walk_3' }
            ],
            frameRate: 6,
            repeat: -1
        });

        // Buat animasi AIRA (FL)
        this.anims.create({
            key: 'aira_idle',
            frames: [
                { key: 'aira_idle_1' },
                { key: 'aira_idle_2' },
                { key: 'aira_idle_3' }
            ],
            frameRate: 4,
            repeat: -1
        });

        this.anims.create({
            key: 'aira_walk',
            frames: [
                { key: 'aira_walk_1' },
                { key: 'aira_walk_2' },
                { key: 'aira_walk_3' }
            ],
            frameRate: 6,
            repeat: -1
        });

        this.scene.start('MainMenuScene');
    }
}
