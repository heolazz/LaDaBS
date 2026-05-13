import Phaser from 'phaser';
import EventBus from '../EventBus';
import { DialogSystem } from '../../systems/DialogSystem';
import { Player } from '../../entities/Player';
import { DIALOGS } from '../../data/dialogs';
import { GameState } from '../../systems/StateManager';
import { MobileControls } from '../../systems/MobileControls';

export class EndingScene extends Phaser.Scene {
    constructor() { super({ key: 'EndingScene' }); }

    create() {
        const { width, height } = this.scale;

        // ---- BACKGROUND JALANAN MALAM (DARK VOID) ----
        this.add.rectangle(0, 0, 3840, height, 0x111116).setOrigin(0);
        this.add.rectangle(0, height * 0.6, 3840, height * 0.4, 0x050508).setOrigin(0);

        this.physics.world.setBounds(0, 0, 3840, height);

        // ---- KERETA API SORE/MALAM ----
        this.train = this.add.rectangle(-3000, height * 0.45, 4000, 180, 0x08080c).setOrigin(0, 0.5);

        // ---- PARTIKEL SAKURA --- -
        if (!this.textures.exists('sakura_petal_end')) {
            const gfx = this.make.graphics({ x: 0, y: 0, add: false });
            gfx.fillStyle(0xffb7c5, 1);
            gfx.fillCircle(4, 4, 4);
            gfx.generateTexture('sakura_petal_end', 8, 8);
            gfx.destroy();
        }

        this.sakuraEmitter = this.add.particles(0, 0, 'sakura_petal_end', {
            x: { min: 0, max: 3840 },
            y: -20,
            speedX: { min: -10, max: -30 },
            speedY: { min: 20, max: 40 },  // Sangat lambat dan melankolis
            scale: { start: 0.8, end: 0.1 },
            alpha: { start: 0.4, end: 0 },
            lifespan: 12000,
            frequency: 150,
            blendMode: 'ADD'
        });

        // ---- GROUND ----
        this.ground = this.physics.add.staticGroup();
        this.ground.add(this.add.rectangle(1920, height - 10, 3840, 20, 0x000000).setOrigin(0.5));
        this.physics.add.existing(this.ground.getChildren()[0], true);

        // ---- PLAYER & AIRA ---
        this.player = new Player(this, 100, height - 80);
        this.physics.add.collider(this.player.body_obj, this.ground);

        // Aira ditempatkan jauh di depan, berjalan pelan
        this.aira = this.physics.add.sprite(900, height - 80, 'aira_walk_1').setScale(0.18).setAlpha(0.8);
        this.aira.play('aira_walk');
        this.aira.setVelocityX(160); // Aira berjalan menjauh

        this.dialogSystem = new DialogSystem(this);

        // ---- REGISTER SPEAKER MAPPING ----
        this.dialogSystem.registerSpeaker('MC', this.player.body_obj);
        this.dialogSystem.registerSpeaker('player', this.player.body_obj);
        this.dialogSystem.registerSpeaker('Aira', this.aira);

        this.mobileControls = new MobileControls(this, this.player);

        this.cameras.main.setBounds(0, 0, 3840, height);
        this.cameras.main.startFollow(this.player.body_obj, true, 0.04, 0.04);
        this.cameras.main.fadeIn(2500, 0, 0, 0);

        // Hilangkan Objective karena ini cinematic murni
        EventBus.emit('update-objective', '');

        // Trigger jalan kaki: Monologue dimulai setelah MC jalan sedikit ke depan
        this.endingTrigger = this.add.zone(450, height - 120, 200, 400);
        this.physics.add.existing(this.endingTrigger, true);
        this.endingStarted = false;

        // Event Hooking (Sistem "Action" Dialog)
        const sceneActionHandler = (actionData) => {
            if (actionData.action === 'character_vanish' && actionData.character === 'aira') {
                // Aira memudar, mengecil sekeras-kerasnya menjauh ke ufuk
                this.tweens.add({
                    targets: this.aira,
                    alpha: 0,
                    scaleX: 0.02,
                    scaleY: 0.02,
                    y: this.aira.y - 20, // Simulasi perspektif jauh
                    duration: 3000,
                    ease: 'Power2',
                    onComplete: () => { this.aira.destroy(); }
                });

                // Pelankan langkah kaki MC hingga berhenti dan termangu
                this.tweens.add({
                    targets: this.player.body_obj.velocity,
                    x: 0,
                    duration: 2500,
                    onUpdate: () => { if (this.player.body.velocity.x < 10) this.player.play('mc_idle') }
                });
            }
            if (actionData.action === 'play_sfx' && actionData.sound === 'train_loud_emotional_peak') {
                // Lewatkan bayangan kereta hitam dengan bergetar keras
                this.tweens.add({
                    targets: this.train,
                    x: 4000,
                    duration: 900,
                    ease: 'Power1',
                    onStart: () => {
                        this.cameras.main.shake(900, 0.008);
                        // Partikel sakura tersapu ganas efek kereta
                        this.sakuraEmitter.gravityX = -1200;
                    }
                });
            }
            if (actionData.action === 'show_final_line') {
                // Kirim ke React UI untuk menampilkan tulisan 'Before...' di atas layar putih
                // Karena Phaser camera sudah mati (fadeOut putih), kita tampilkan di React layer
                EventBus.emit('show-final-title', 'Before...');

                // Setelah 5 detik, kembali ke MainMenu
                this.time.delayedCall(5000, () => {
                    EventBus.emit('hide-final-title');
                    try { GameState.flags = {}; GameState.current_objective = ''; } catch (e) { }
                    this.scene.start('MainMenuScene');
                });
            }
        };

        EventBus.on('scene-action', sceneActionHandler);

        // Bersihkan memory event
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EventBus.off('scene-action', sceneActionHandler);
        });

        EventBus.emit('current-scene-ready', this);
    }

    update() {
        this.player.update();
        this.dialogSystem.update();

        // 1. TRIGGER MONOLOGUE ENDING KETIKA BERJALAN
        if (!this.endingStarted && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.endingTrigger.x, this.endingTrigger.y) < 100) {
            this.endingStarted = true;
            this.player.isInteracting = true; // Kunci gerakan saat monologue jalan
            this.player.setVelocityX(0);

            this.dialogSystem.start(DIALOGS.EPISODE_0, 'scene_5_ending', () => { });
        }

        // Block manual next via Space selama efek berlangsung keras
        if (this.dialogSystem.isActive && this.player.justPressedSpace) {
            this.dialogSystem.next();
        }
    }
}
