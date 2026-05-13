import Phaser from 'phaser';
import EventBus from '../EventBus';

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        const { width, height } = this.scale;

        // Tampilkan gambar Cover sebagai latar dan menu utama
        this.add.image(width / 2, height / 2, 'cover_bg')
            .setOrigin(0.5)
            .setDisplaySize(width, height);

        // Efek gradasi bayangan kecil di lantai bawah agar tombol lebih terlihat pop-out
        this.add.rectangle(0, height, width, 120, 0x000000, 0.4).setOrigin(0, 1);

        // START Button - Digeser agak ke bawah agar tidak menutupi gambar karakter
        const startBtn = this.add.text(width / 2, height - 70, '▶  Mulai Cerita', {
            fontFamily: 'monospace',
            fontSize: '22px',
            color: '#aaccff',
            backgroundColor: '#1a1a3a',
            padding: { x: 24, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startBtn.on('pointerover', () => startBtn.setColor('#ffffff'));
        startBtn.on('pointerout', () => startBtn.setColor('#aaccff'));
        startBtn.on('pointerup', () => {
            this.cameras.main.fadeOut(800, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('BedroomScene');
            });
        });

        // Subtle flicker animation
        this.tweens.add({
            targets: startBtn,
            alpha: 0.7,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Footer text
        this.add.text(width / 2, height - 40, 'Tekan tombol untuk melanjutkan', {
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#444466'
        }).setOrigin(0.5);

        // ==========================================
        // ---- DEBUG SCENE SELECTOR (U/ TESTING) ----
        // ==========================================
        const debugTitle = this.add.text(20, 20, '🛠️ DEBUG: SCENE SELECTOR', {
            fontFamily: 'monospace', fontSize: '14px', color: '#ffaaaa', backgroundColor: '#000', padding: { x: 4, y: 2 }
        });

        const scenes = [
            { name: '[ 1. Kamar Pagi ]', target: 'BedroomScene' },
            { name: '[ 2. Jalan Rel & Sakura ]', target: 'StreetScene' },
            { name: '[ 3. Ruang Kelas ]', target: 'SchoolScene' },
            { name: '[ 4. Koridor (Perpisahan) ]', target: 'CorridorScene' },
            { name: '[ 5. Jalan Pulang (Senja) ]', target: 'EndingScene' }
        ];

        let yy = 50;
        scenes.forEach((scn, idx) => {
            const btn = this.add.text(20, yy + (idx * 33), scn.name, {
                fontFamily: 'monospace', fontSize: '15px', color: '#ffffff', backgroundColor: '#334466', padding: { x: 10, y: 5 }
            })
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => btn.setBackgroundColor('#556688'))
                .on('pointerout', () => btn.setBackgroundColor('#334466'))
                .on('pointerdown', () => {
                    this.cameras.main.fadeOut(500, 0, 0, 0);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        // Reset game state saat loncat level biar interaksi ke-reset
                        import('../../systems/StateManager').then(module => {
                            try { module.GameState.flags = {}; } catch (e) { }
                        });
                        this.scene.start(scn.target);
                    });
                });
        });

        EventBus.emit('current-scene-ready', this);
    }
}
