import Phaser from 'phaser';
import EventBus from '../EventBus';
import { DialogSystem } from '../../systems/DialogSystem';
import { Player } from '../../entities/Player';
import { DIALOGS } from '../../data/dialogs';
import { GameState } from '../../systems/StateManager';
import { MobileControls } from '../../systems/MobileControls';

/**
 * Scene 1: Kamar (Bedroom)
 * Objectives:
 *  - Baca HP (chat dari Aira)
 *  - Baca catatan sekolah
 *  - Pergi ke pintu
 */
export class BedroomScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BedroomScene' });
    }

    create() {
        const { width, height } = this.scale;
        const WORLD_W = 2560;
        const GROUND_Y = 640;

        // ---- LAYER 0: SKY (langit malam) ----
        this.add.rectangle(0, 0, WORLD_W, 150, 0x0d0b1a).setOrigin(0).setDepth(0);

        // ---- PARALLAX: Bulan & Bintang ----
        this._createParallaxSky(WORLD_W);

        // ---- LAYER 1: WALL TILE ----
        const WALL_SCALE = 490 / 1024;
        const WALL_W_RAW = 645 * WALL_SCALE;
        const wallCount = Math.ceil(WORLD_W / WALL_W_RAW) + 1;
        for (let i = 0; i < wallCount; i++) {
            this.add.image(Math.round(i * WALL_W_RAW), 150, 'bedroom_wall')
                .setOrigin(0, 0)
                .setScale(WALL_SCALE)
                .setDepth(1);
        }

        // ---- LAYER 1: FLOOR TILE ----
        const FLOOR_H = height - GROUND_Y;
        const FLOOR_SCALE = FLOOR_H / 479;
        const FLOOR_W_RAW = 1024 * FLOOR_SCALE;
        const floorCount = Math.ceil(WORLD_W / FLOOR_W_RAW) + 1;
        for (let i = 0; i < floorCount; i++) {
            this.add.image(Math.round(i * FLOOR_W_RAW), GROUND_Y, 'bedroom_tile')
                .setOrigin(0, 0)
                .setScale(FLOOR_SCALE)
                .setDepth(1);
        }

        // ---- FURNITUR ----
        this._setupFurniture(GROUND_Y, height);

        // ---- AMBIENT OVERLAY (GLOOMY TONE) ----
        // Memberikan filter kegelapan pada seluruh ruangan termasuk dinding dan karakter
        this.add.rectangle(0, 0, WORLD_W, height, 0x1a2138, 0.45)
            .setOrigin(0, 0)
            .setDepth(4.5); // Di atas player (4), di bawah UI interaction (5)

        // ---- EFEK PENCAHAYAAN ----
        this._createLightingEffects(GROUND_Y);

        // ---- PARTIKEL DEBU ----
        this._createDustParticles(GROUND_Y);

        // ---- WORLD BOUNDS ----
        this.physics.world.setBounds(0, 0, WORLD_W, height);

        // ---- PLATFORM / GROUND ----
        this.ground = this.physics.add.staticGroup();
        this.ground.add(
            this.add.rectangle(WORLD_W / 2, GROUND_Y + 10, WORLD_W, 20, 0x000000, 0).setOrigin(0.5)
        );
        this.physics.add.existing(this.ground.getChildren()[0], true);

        // ---- PLAYER ----
        const PLAYER_SPAWN_Y = GROUND_Y - 78;
        this.player = new Player(this, 200, PLAYER_SPAWN_Y);
        this.player.body_obj.setDepth(4);
        this.physics.add.collider(this.player.body_obj, this.ground);

        // ---- MOBILE CONTROLS ----
        this.mobileControls = new MobileControls(this, this.player);

        // ---- DIALOG SYSTEM ----
        this.dialogSystem = new DialogSystem(this);
        this.dialogSystem.registerSpeaker('MC', this.player.body_obj);
        this.dialogSystem.registerSpeaker('player', this.player.body_obj);

        // ---- INTERACTION INDICATORS ----
        this.bedInteract = this._createInteractable(450, height - 120, '🛏️ Kasur', 0x334466);
        this.hpPhone = this._createInteractable(450, height - 120, '📱 HP', 0x334466);
        this.noteBook = this._createInteractable(750, height - 120, '📓 Catatan', 0x334466);
        this.doorExit = this._createInteractable(2400, height - 120, '🚪 Pintu', 0x664433);

        // ---- OBJECTIVE ----
        GameState.setObjective('Habiskan waktu di kamar...');

        // ---- CAMERA ----
        this.cameras.main.setBounds(0, 0, WORLD_W, height);
        this.cameras.main.startFollow(this.player.body_obj, true, 0.08, 0.08);
        this.cameras.main.fadeIn(1200);

        // ---- AUTO-DIALOG: Bangun Tidur ----
        if (!GameState.get('bedroom_wakeup_done')) {
            GameState.set('bedroom_wakeup_done', true);
            this.player.isInteracting = true;
            this.time.delayedCall(1500, () => {
                this.dialogSystem.start(DIALOGS.EPISODE_0, 'scene_1_kamar', () => {
                    this.player.isInteracting = false;
                });
            });
        }

        EventBus.emit('current-scene-ready', this);
    }

    // ==============================
    // FURNITUR & PROPS
    // ==============================
    _setupFurniture(GROUND_Y, height) {
        // --- GROUND SHADOWS ---
        this.add.ellipse(70, GROUND_Y, 140, 20, 0x000000, 0.4).setDepth(1.5); // Lemari
        this.add.ellipse(450, GROUND_Y, 220, 30, 0x000000, 0.4).setDepth(1.5); // Kasur
        this.add.ellipse(750, GROUND_Y, 160, 25, 0x000000, 0.4).setDepth(1.5); // Meja
        this.add.ellipse(1000, GROUND_Y + 5, 140, 20, 0x000000, 0.4).setDepth(1.5); // Rak Buku

        // Lemari Pakaian (Wardrobe) - Pojok kiri
        this.add.image(70, GROUND_Y, 'bedroom_wardrobe')
            .setOrigin(0.5, 1)
            .setScale(0.18)
            .setDepth(2);

        // Kasur (Bed)
        this.add.image(450, GROUND_Y, 'bedroom_bed')
            .setOrigin(0.5, 1)
            .setScale(0.28)
            .setDepth(3);

        // Meja belajar (Desk)
        this.add.image(750, GROUND_Y, 'bedroom_desk')
            .setOrigin(0.5, 1)
            .setScale(0.38)
            .setDepth(2);

        // Jendela Besar - Di atas kasur
        this.add.image(650, GROUND_Y - 285, 'bedroom_window')
            .setOrigin(0.5, 0.5)
            .setScale(0.65)
            .setDepth(1);

        // Rak Buku (Bookshelf)
        this.add.image(1000, GROUND_Y + 5, 'bedroom_bookshelf')
            .setOrigin(0.5, 1)
            .setScale(0.18)
            .setDepth(2);

        // Pintu Keluar
        this.add.ellipse(2400, GROUND_Y + 5, 120, 15, 0x000000, 0.4).setDepth(1.5);
        this.add.image(2400, GROUND_Y, 'bedroom_door')
            .setOrigin(0.5, 1)
            .setScale(0.18)
            .setDepth(2);
    }

    // ==============================
    // PARALLAX SKY (Bulan & Bintang)
    // ==============================
    _createParallaxSky(worldW) {
        // Bulan dinonaktifkan (karena sudah ada di dalam gambar jendela)
        // this.moon = this.add.circle(900, 50, 25, 0xeeeedd).setDepth(0).setAlpha(0.7);

        // Bintang kecil-kecil
        this.stars = [];
        for (let i = 0; i < 30; i++) {
            const sx = Phaser.Math.Between(0, worldW);
            const sy = Phaser.Math.Between(5, 140);
            const size = Phaser.Math.Between(1, 3);
            const alpha = Phaser.Math.FloatBetween(0.2, 0.7);
            const star = this.add.circle(sx, sy, size, 0xffffff).setDepth(0).setAlpha(alpha);
            star.setData('origX', sx);
            this.stars.push(star);

            // Kedip-kedip
            this.tweens.add({
                targets: star,
                alpha: { from: alpha, to: alpha * 0.3 },
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }

    // ==============================
    // EFEK PENCAHAYAAN
    // ==============================
    _createLightingEffects(GROUND_Y) {

        // Cahaya hangat dari lampu meja
        const lampGlow = this.add.ellipse(780, GROUND_Y - 80, 180, 200, 0xffcc66, 0.15);
        lampGlow.setDepth(5).setBlendMode(Phaser.BlendModes.ADD);

        // Pulsing halus pada lampu meja
        this.tweens.add({
            targets: lampGlow,
            alpha: { from: 0.15, to: 0.08 },
            scaleX: { from: 1, to: 0.95 },
            scaleY: { from: 1, to: 0.95 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // ==============================
    // PARTIKEL DEBU MELAYANG
    // ==============================
    _createDustParticles(GROUND_Y) {
        for (let i = 0; i < 20; i++) {
            const px = Phaser.Math.Between(100, 1600);
            const py = Phaser.Math.Between(200, GROUND_Y - 50);
            const dust = this.add.circle(px, py, Phaser.Math.Between(1, 2), 0xccccaa)
                .setAlpha(Phaser.Math.FloatBetween(0.1, 0.3))
                .setDepth(6);

            this.tweens.add({
                targets: dust,
                y: py - Phaser.Math.Between(40, 120),
                x: px + Phaser.Math.Between(-30, 30),
                alpha: 0,
                duration: Phaser.Math.Between(4000, 8000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 5000),
                onRepeat: () => {
                    dust.x = Phaser.Math.Between(100, 1600);
                    dust.y = Phaser.Math.Between(200, GROUND_Y - 50);
                    dust.setAlpha(Phaser.Math.FloatBetween(0.1, 0.3));
                }
            });
        }
    }

    // ==============================
    // INTERACTABLE ZONES
    // ==============================
    _createInteractable(x, y, label, color) {
        const zone = this.add.zone(x, y, 80, 80);
        this.physics.add.existing(zone, true);

        const isTouch = this.sys.game.device.input.touch;
        const hint = isTouch ? '[!]' : '[!] Press E';

        const indicator = this.add.text(x, y - 50, hint, {
            fontFamily: 'monospace',
            fontSize: isTouch ? '14px' : '12px',
            color: '#aaccff',
            backgroundColor: '#222244',
            padding: { x: 6, y: 3 }
        }).setOrigin(0.5).setAlpha(0).setDepth(5);

        this.tweens.add({
            targets: indicator,
            y: y - 60,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        zone.indicator = indicator;
        zone.label = label;
        return zone;
    }

    // ==============================
    // UPDATE LOOP
    // ==============================
    update() {
        this.player.update();
        this.dialogSystem.update();

        // Parallax bulan & bintang (bergerak lebih lambat dari kamera)
        if (this.moon) {
            const camX = this.cameras.main.scrollX;
            this.moon.x = 900 - camX * 0.05;
            this.stars.forEach(star => {
                star.x = star.getData('origX') - camX * 0.03;
            });
        }

        // Cek proximity & tampilkan indicator [E]
        const interactables = [this.bedInteract, this.hpPhone, this.noteBook, this.doorExit];
        let nearAny = false;
        interactables.forEach(obj => {
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                obj.x, obj.y
            );
            const isNear = dist < 100;
            obj.indicator.setAlpha(isNear ? 1 : 0);
            if (isNear) nearAny = true;
        });

        // Toggle Dynamic Action Button for Mobile
        this.mobileControls.showInteract(nearAny);

        // Input E
        if (this.player.justPressedE) {
            this._checkInteraction();
        }

        // Dialog next
        if (this.dialogSystem.isActive && this.player.justPressedSpace) {
            this.dialogSystem.next();
        }
    }

    // ==============================
    // INTERAKSI
    // ==============================
    _checkInteraction() {
        if (this.dialogSystem.isActive) return;

        // Kasur (Bed)
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.bedInteract.x, this.bedInteract.y) < 100) {
            if (!GameState.get('bedroom_bed_checked')) {
                GameState.set('bedroom_bed_checked', true);
                this.player.isInteracting = true;
                this.dialogSystem.start(DIALOGS.EPISODE_0, 'bed_interact', () => {
                    this.player.isInteracting = false;
                });
            }
        }

        // HP Phone
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.hpPhone.x, this.hpPhone.y) < 100) {
            if (!GameState.get('bedroom_hp_read')) {
                GameState.set('bedroom_hp_read', true);
                this.player.isInteracting = true;
                this.dialogSystem.start(DIALOGS.EPISODE_0, 'hp_notification', () => {
                    this.player.isInteracting = false;
                    if (GameState.get('bedroom_note_read')) {
                        GameState.setObjective('Pergi ke sekolah →');
                    }
                });
            }
        }

        // Catatan
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.noteBook.x, this.noteBook.y) < 100) {
            if (!GameState.get('bedroom_note_read')) {
                GameState.set('bedroom_note_read', true);
                this.player.isInteracting = true;
                this.dialogSystem.start(DIALOGS.EPISODE_0, 'catatan_sekolah', () => {
                    this.player.isInteracting = false;
                    if (GameState.get('bedroom_hp_read')) {
                        GameState.setObjective('Pergi ke sekolah →');
                    }
                });
            }
        }

        // Pintu
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.doorExit.x, this.doorExit.y) < 100) {
            if (GameState.canLeaveScene('BedroomScene')) {
                this.cameras.main.fadeOut(800);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('StreetScene');
                });
            } else {
                this.dialogSystem.start({
                    temp: [{ speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Ada yang kelupaan. Aku belum cek HP dan catatanku di meja.' }]
                }, 'temp', () => { });
            }
        }
    }
}
