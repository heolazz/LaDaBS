import Phaser from 'phaser';
import EventBus from '../EventBus';
import { DialogSystem } from '../../systems/DialogSystem';
import { Player } from '../../entities/Player';
import { DIALOGS } from '../../data/dialogs';
import { GameState } from '../../systems/StateManager';
import { MobileControls } from '../../systems/MobileControls';

export class CorridorScene extends Phaser.Scene {
    constructor() { super({ key: 'CorridorScene' }); }

    create() {
        const { width, height } = this.scale;

        // ---- BACKGROUND LORONG SORE ----
        this.add.rectangle(0, 0, 2560, height, 0x5a3020).setOrigin(0); // Dinding koridor oranye gelap
        this.add.rectangle(0, height * 0.7, 2560, height * 0.3, 0x3a1a10).setOrigin(0); // Lantai bayangan

        this.physics.world.setBounds(0, 0, 2560, height);
        this.ground = this.physics.add.staticGroup();
        this.ground.add(this.add.rectangle(1280, height - 10, 2560, 20, 0x2a1005).setOrigin(0.5));
        this.physics.add.existing(this.ground.getChildren()[0], true);

        // ---- PLAYER ----
        this.player = new Player(this, 100, height - 80);
        this.physics.add.collider(this.player.body_obj, this.ground);

        this.mobileControls = new MobileControls(this, this.player);
        this.dialogSystem = new DialogSystem(this);

        // ---- AIRA MENUNGGU DI UJUNG LORONG ----
        this.aira = this.physics.add.sprite(2000, height - 80, 'aira_idle_1').setScale(0.18);
        this.aira.setCollideWorldBounds(true);
        this.aira.body.setSize(200, 800);
        this.aira.play('aira_idle');
        this.aira.setFlipX(true);

        // ---- REGISTER SPEAKER MAPPING ----
        this.dialogSystem.registerSpeaker('MC', this.player.body_obj);
        this.dialogSystem.registerSpeaker('player', this.player.body_obj);
        this.dialogSystem.registerSpeaker('Aira', this.aira);

        this.cameras.main.setBounds(0, 0, 2560, height);
        this.cameras.main.startFollow(this.player.body_obj, true, 0.08, 0.08);
        this.cameras.main.fadeIn(1200); // Fade in lebih pelan karena pergantian mood

        GameState.setObjective('Kejar Aira di ujung koridor');

        // Hook: Animasi Aira berjalan menjauh saat dialog memerintahkan
        const corridorActionHandler = (actionData) => {
            if (actionData.action === 'character_walk_away' && actionData.character === 'aira') {
                this.aira.setFlipX(false); // Aira berbalik membelakangi MC
                this.aira.play('aira_walk', true);
                this.tweens.add({
                    targets: this.aira,
                    x: this.aira.x + 600,
                    alpha: 0.3,
                    duration: 4000,
                    ease: 'Power1'
                });
            }
            if (actionData.action === 'character_turn_back' && actionData.character === 'aira') {
                // Hentikan tweens jalan menjauh
                this.tweens.killTweensOf(this.aira);
                // Aira berbalik menghadap MC
                this.aira.setFlipX(true);
                this.aira.play('aira_walk', true);
                // Animasi Aira JALAN KEMBALI ke dekat MC + opacity kembali
                this.tweens.add({
                    targets: this.aira,
                    x: this.player.x + 150, // Kembali ke dekat MC
                    alpha: 1,
                    duration: 1500,
                    ease: 'Sine.easeOut',
                    onComplete: () => {
                        this.aira.play('aira_idle', true);
                    }
                });
            }
        };
        EventBus.on('scene-action', corridorActionHandler);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EventBus.off('scene-action', corridorActionHandler);
        });

        EventBus.emit('current-scene-ready', this);
    }

    update() {
        this.player.update();
        this.dialogSystem.update();

        // 1. TRIGGER PERPISAHAN KORIDOR
        if (!GameState.get('corridor_aira_met')) {
            // Ketika MC mendekat
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.aira.x, this.aira.y) < 250) {
                GameState.set('corridor_aira_met', true);

                this.player.isInteracting = true;
                this.player.setVelocityX(0);

                // Mulai Naskah Scene 4
                this.dialogSystem.start(DIALOGS.EPISODE_0, 'scene_4_sore', () => {
                    // Setelah seluruh mikro-choice dan keraguan selesai, lanjut fade out panjang ke jalan pulang (EndingScene)
                    this.cameras.main.fadeOut(2000, 0, 0, 0);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.scene.start('EndingScene');
                    });
                });
            }
        }

        // Dialog Next dengan Space
        if (this.dialogSystem.isActive && this.player.justPressedSpace) {
            this.dialogSystem.next();
        }
    }
}
