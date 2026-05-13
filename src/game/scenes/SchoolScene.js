import Phaser from 'phaser';
import EventBus from '../EventBus';
import { DialogSystem } from '../../systems/DialogSystem';
import { Player } from '../../entities/Player';
import { DIALOGS } from '../../data/dialogs';
import { GameState } from '../../systems/StateManager';
import { MobileControls } from '../../systems/MobileControls';

export class SchoolScene extends Phaser.Scene {
    constructor() { super({ key: 'SchoolScene' }); }

    create() {
        const { width, height } = this.scale;

        // ---- BACKGROUND SEKOLAH (KELAS) ----
        this.add.rectangle(0, 0, 2560, height, 0x3a4050).setOrigin(0); // Dinding Kelas
        this.add.rectangle(0, height * 0.7, 2560, height * 0.3, 0x4a5060).setOrigin(0); // Lantai

        this.physics.world.setBounds(0, 0, 2560, height);

        // ---- GROUND ----
        this.ground = this.physics.add.staticGroup();
        this.ground.add(this.add.rectangle(1280, height - 10, 2560, 20, 0x5a6070).setOrigin(0.5));
        this.physics.add.existing(this.ground.getChildren()[0], true);

        // ---- PLAYER ----
        this.player = new Player(this, 200, height - 80);
        this.physics.add.collider(this.player.body_obj, this.ground);

        // ---- MOBILE CONTROLS ----
        this.mobileControls = new MobileControls(this, this.player);

        this.dialogSystem = new DialogSystem(this);

        // ---- INTERACTABLES ----
        // Aira duduk/berdiri di kelas
        this.aira = this._createAira(800, height - 80);

        // ---- REGISTER SPEAKER MAPPING ----
        this.dialogSystem.registerSpeaker('MC', this.player.body_obj);
        this.dialogSystem.registerSpeaker('player', this.player.body_obj);
        this.dialogSystem.registerSpeaker('Aira', this.aira);

        // Jendela (Core Event)
        this.jendela = this._createInteractable(1400, height - 150, '🪟 Jendela', 0x88aabb);

        // Pintu Pulang
        this.doorExit = this._createInteractable(2400, height - 120, '🚪 Pintu Pulang', 0x664433);

        GameState.setObjective('Habiskan waktu terakhir di kelas');

        // ---- CAMERA ----
        this.cameras.main.setBounds(0, 0, 2560, height);
        this.cameras.main.startFollow(this.player.body_obj, true, 0.08, 0.08);
        this.cameras.main.fadeIn(800);

        EventBus.emit('current-scene-ready', this);
    }

    _createAira(x, y) {
        const sprite = this.physics.add.sprite(x, y, 'aira_idle_1');
        sprite.setScale(0.18);
        sprite.setCollideWorldBounds(true);
        sprite.body.setSize(200, 800);
        sprite.play('aira_idle');

        const zone = this.add.zone(x, y, 100, 100);
        this.physics.add.existing(zone, true);

        const isTouch = this.sys.game.device.input.touch;
        const hint = isTouch ? '[!]' : '[!] Press E';

        const indicator = this.add.text(x, y - 70, hint, {
            fontFamily: 'monospace', fontSize: isTouch ? '14px' : '12px', color: '#aaccff',
            backgroundColor: '#222244', padding: { x: 6, y: 3 }
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({ targets: indicator, y: y - 80, duration: 800, yoyo: true, repeat: -1 });

        sprite.zone = zone;
        sprite.zone.indicator = indicator;
        return sprite;
    }

    _createInteractable(x, y, label, color) {
        const zone = this.add.zone(x, y, 100, 150);
        this.physics.add.existing(zone, true);

        const isTouch = this.sys.game.device.input.touch;
        const hint = isTouch ? '[!]' : '[!] Press E';

        const indicator = this.add.text(x, y - 50, hint, {
            fontFamily: 'monospace', fontSize: isTouch ? '14px' : '12px', color: '#aaccff',
            backgroundColor: '#222244', padding: { x: 6, y: 3 }
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({ targets: indicator, y: y - 60, duration: 800, yoyo: true, repeat: -1 });

        zone.indicator = indicator;
        this.add.rectangle(x, y, 80, 120, color).setOrigin(0.5);
        this.add.text(x, y - 70, label, { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);

        return zone;
    }

    update() {
        this.player.update();
        this.dialogSystem.update();

        // 1. Aira Interaction (Pinjam Pulpen) - Opsional
        const distAira = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.aira.x, this.aira.y);
        const isNearAira = distAira < 100;
        this.aira.zone.indicator.setAlpha(isNearAira ? 1 : 0);

        // 2. Jendela Interaction (Momen Emosional) - Wajib
        const distJendelaX = Math.abs(this.player.x - this.jendela.x);
        const isNearJendela = distJendelaX < 100;
        this.jendela.indicator.setAlpha(isNearJendela ? 1 : 0);

        // 3. Pintu Keluar
        const distExit = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.doorExit.x, this.doorExit.y);
        const isNearExit = distExit < 100;
        this.doorExit.indicator.setAlpha(isNearExit ? 1 : 0);

        // Toggle Dynamic Action Button for Mobile
        this.mobileControls.showInteract(isNearAira || isNearJendela || isNearExit);

        if (this.player.justPressedE && isNearAira && !GameState.get('school_pen_borrowed')) {
            GameState.set('school_pen_borrowed', true);
            this.player.isInteracting = true;
            this.dialogSystem.start({ temp: [{ speaker: 'Aira', portrait: 'aira_portrait', text: 'Tumben hari ini sepi ya.' }] }, 'temp', () => {
                this.player.isInteracting = false;
            });
        }

        if (this.player.justPressedE && isNearJendela && !GameState.get('school_window_seen')) {
            GameState.set('school_window_seen', true);
            this.player.isInteracting = true;
            this.player.setVelocityX(0);

            // Pindahkan Aira ke samping MC menghadap Jendela
            this.aira.x = this.player.x + 80; // Sebelahnya
            this.aira.setFlipX(true);
            this.aira.play('aira_idle', true);

            // Dialog Momen Jendela / Kelas
            this.dialogSystem.start(DIALOGS.EPISODE_0, 'scene_3_kelas', () => {
                this.player.isInteracting = false;
                GameState.setObjective('Pulang sekolah →');
            });
        }

        if (this.player.justPressedE && isNearExit) {
            if (GameState.canLeaveScene('SchoolScene')) {
                this.cameras.main.fadeOut(800);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('CorridorScene'); // Lanjut ke koridor perpisahan
                });
            } else {
                this.player.isInteracting = true;
                this.dialogSystem.start({ temp: [{ speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Masih ada yang tertinggal. Aku belum mau pulang.' }] }, 'temp', () => {
                    this.player.isInteracting = false;
                });
            }
        }

        if (this.dialogSystem.isActive && this.player.justPressedSpace) {
            this.dialogSystem.next();
        }
    }
}
