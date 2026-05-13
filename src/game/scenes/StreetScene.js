import Phaser from 'phaser';
import EventBus from '../EventBus';
import { DialogSystem } from '../../systems/DialogSystem';
import { Player } from '../../entities/Player';
import { DIALOGS } from '../../data/dialogs';
import { GameState } from '../../systems/StateManager';
import { MobileControls } from '../../systems/MobileControls';

export class StreetScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StreetScene' });
    }

    create() {
        const { width, height } = this.scale;

        // Konstanta
        const SCENE_WIDTH = 3840;
        // Camera max scroll = 3840 - 1280 = 2560px

        // Warna dasar langit
        this.cameras.main.setBackgroundColor('#a0cfd9');

        // Skala foreground agar proporsional (aset asli ~400px, layar 720px)
        // Di target, foreground cuma ~35% layar → scale 0.6
        const FG = 0.6;

        // ======================================================
        // LAYER DEPAN: TileSprite (di-repeat, scrollFactor 1.0)
        // ======================================================
        const addTileLayer = (key, depth, yFromBottom, customScaleY = FG) => {
            const img = this.textures.get(key).getSourceImage();
            const layer = this.add.tileSprite(0, height - yFromBottom, SCENE_WIDTH / FG, img.height, key)
                .setOrigin(0, 1)
                .setScale(FG, customScaleY)
                .setScrollFactor(1.0)
                .setDepth(depth);
            return layer;
        };

        // 7. Trotoar/Tanah (Depth 7, paling depan)
        // Di-pinch (scaleY diperkecil) agar dinding batu tidak terlalu tinggi
        const groundScaleY = FG * 0.5; // Squish vertikal 50%
        const groundH = Math.round(178 * groundScaleY); // 178 * 0.3 = ~53px
        addTileLayer('street_ground', 7, 0, groundScaleY);

        // 6. Jalan Aspal (Depth 6)
        const roadH = Math.round(108 * FG); // ~65px
        addTileLayer('street_road', 6, groundH);

        // 5. Rel Kereta Api (Depth 3)
        const railOffset = groundH + roadH; // 53 + 65 = 118px
        addTileLayer('street_railway', 3, railOffset);

        // 4. Pagar Besi (Depth 5)
        addTileLayer('street_fence', 5, railOffset);

        // ======================================================
        // LAYER BELAKANG: Parallax Sky, Buildings & Procedural River
        // ======================================================

        // --- Posisi horizon ---
        // Kita atur ujung bawah gedung dan jembatan/sungai di Y = 400
        const horizonY = 400;
        // --- Posisi batas atas foreground = fence top ---
        const bgBottomY = height - railOffset; // Y di mana river/bg bertemu foreground sampai ke bawah
        const riverAreaH = bgBottomY - horizonY; // 720 - 400 = 320 px

        // 1. LANGIT (Depth 0) — Parallax lambat
        const skyOrig = this.textures.get('street_sky').getSourceImage();
        const skyComboKey = 'sky_tiled';
        if (this.textures.exists(skyComboKey)) {
            this.textures.remove(skyComboKey);
        }
        const skyCanvas = this.textures.createCanvas(skyComboKey, skyOrig.width * 2, skyOrig.height);
        const skyCtx = skyCanvas.getContext();
        skyCtx.drawImage(skyOrig, 0, 0);
        skyCtx.save();
        skyCtx.translate(skyOrig.width * 2, 0);
        skyCtx.scale(-1, 1);
        skyCtx.drawImage(skyOrig, 0, 0);
        skyCtx.restore();
        skyCanvas.refresh();

        const BG_SCALE = 0.25;
        // Beri width tileSprite ekstra lebar ((width + 1000) / BG_SCALE) agar cover saat parallax shift
        this.add.tileSprite(0, horizonY, (width + 1000) / BG_SCALE, skyOrig.height, skyComboKey)
            .setOrigin(0, 1)
            .setScale(BG_SCALE)
            .setScrollFactor(0.05)
            .setDepth(0);

        // 2. BUILDINGS (Depth 1) — Parallax
        const bldgImg = this.textures.get('buildings_far').getSourceImage();
        this.add.tileSprite(0, horizonY, (width + 1000) / BG_SCALE, bldgImg.height, 'buildings_far')
            .setOrigin(0, 1)
            .setScale(BG_SCALE)
            .setScrollFactor(0.1)
            .setDepth(1);

        // ======================================================
        // 3. SUNGAI PROCEDURAL MELIUK & REFLEKSI (Depth 2)
        // ======================================================

        // a. Dasar sungai (Lebarkan biar aman saat parallax zoom)
        this.add.rectangle(0, horizonY, width + 2560, riverAreaH + 100, 0x8cb9cc)
            .setOrigin(0, 0)
            .setScrollFactor(0.15)
            .setDepth(2);

        // b. Refleksi Sky (Flip vertikal dengan scaleY negatif)
        this.add.tileSprite(0, horizonY, (width + 1500) / BG_SCALE, skyOrig.height, skyComboKey)
            .setOrigin(0, 1)
            .setScale(BG_SCALE, -BG_SCALE)
            .setAlpha(0.15)
            .setTint(0x7ab1c5) // Warna dibirukan
            .setScrollFactor(0.05)
            .setDepth(2);

        // c. Refleksi Buildings (Flip vertikal)
        this.add.tileSprite(0, horizonY, (width + 1500) / BG_SCALE, bldgImg.height, 'buildings_far')
            .setOrigin(0, 1)
            .setScale(BG_SCALE, -BG_SCALE)
            .setAlpha(0.3)
            .setTint(0x71a2b6) // Warna dibirukan
            .setScrollFactor(0.1)
            .setDepth(2);

        // --- FAR BANK TREES (Di Horizon, buram/hazy karena jauh) ---
        const addHorizonTree = (x, scale) => {
            // Pohon diletakkan di horison — dibuat buram (alpha rendah + tint biru)
            // untuk efek atmospheric perspective (kabut jarak jauh)
            this.add.image(x, horizonY, 'sakura_tree')
                .setOrigin(0.5, 1)
                .setScale(scale)
                .setAlpha(0.55)
                .setTint(0x9bbecf) // Kabut biru muda agar terlihat jauh
                .setScrollFactor(0.1)
                .setDepth(1.5);

            // Refleksi pohon di air (lebih pucat lagi)
            this.add.image(x, horizonY, 'sakura_tree')
                .setOrigin(0.5, 1)
                .setScale(scale, -scale)
                .setAlpha(0.2)
                .setTint(0x71a2b6)
                .setScrollFactor(0.1)
                .setDepth(2.05);
        };

        // Penempatan Pohon Background (sesuai referensi)
        // Pohon besar kiri & kanan, pohon kecil tersebar di tengah
        addHorizonTree(150, 0.15);  // Besar kiri
        addHorizonTree(500, 0.06);  // Kecil
        addHorizonTree(900, 0.06);  // Kecil
        addHorizonTree(1300, 0.06); // Kecil
        addHorizonTree(1700, 0.15); // Besar tengah-kanan
        addHorizonTree(2200, 0.06); // Kecil
        addHorizonTree(2600, 0.06); // Kecil
        addHorizonTree(3100, 0.15); // Besar kanan

        // d. Membuat tekstur Ombak Meliuk Procedural (Seamless Horizontal)
        if (!this.textures.exists('river_wave')) {
            const waveGfx = this.make.graphics({ x: 0, y: 0, add: false });

            // Highlight Ombak (Terang)
            waveGfx.fillStyle(0xffffff, 0.25);
            waveGfx.beginPath();
            waveGfx.moveTo(0, 20);
            for (let i = 0; i <= 400; i += 10) {
                // Sine wave meliuk
                waveGfx.lineTo(i, 20 + Math.sin(i * Math.PI / 100) * 6);
            }
            waveGfx.lineTo(400, 23);
            for (let i = 400; i >= 0; i -= 10) {
                waveGfx.lineTo(i, 21 + Math.sin((i + 15) * Math.PI / 100) * 6);
            }
            waveGfx.closePath();
            waveGfx.fillPath();

            // Bayangan Ombak (Gelap) di bawahnya sedikit
            waveGfx.fillStyle(0x7da4b8, 0.4);
            waveGfx.beginPath();
            waveGfx.moveTo(0, 30);
            for (let i = 0; i <= 400; i += 10) {
                waveGfx.lineTo(i, 30 + Math.sin(i * Math.PI / 100) * 5);
            }
            waveGfx.lineTo(400, 32);
            for (let i = 400; i >= 0; i -= 10) {
                waveGfx.lineTo(i, 30 + Math.sin(i * Math.PI / 100) * 5);
            }
            waveGfx.closePath();
            waveGfx.fillPath();

            waveGfx.generateTexture('river_wave', 400, 45);
            waveGfx.destroy();
        }

        // e. Layer-layer riak air dengan kedalaman berbeda
        const addWave = (ySpace, speed, scale, alpha, scrollFix) => {
            const w = this.add.tileSprite(0, horizonY + ySpace, (width + 2560) / scale, 45, 'river_wave')
                .setOrigin(0, 0)
                .setScale(scale)
                .setAlpha(alpha)
                .setScrollFactor(scrollFix) // Parallax ombak
                .setDepth(2.1); // Kedalaman di atas refleksi pohon

            // Animasi aliran air mengalir ke kiri (tilePosition bertambah positif)
            this.tweens.add({
                targets: w,
                tilePositionX: 400,
                duration: speed,
                repeat: -1,
                ease: 'Linear'
            });
        };

        // Menyusun ombak dari yang jauh (kecil/lambat) ke dekat (besar/cepat)
        addWave(5, 15000, 0.5, 0.6, 0.11);
        addWave(30, 12000, 0.7, 0.5, 0.12);
        addWave(80, 9000, 1.0, 0.4, 0.13);
        addWave(150, 7000, 1.5, 0.3, 0.14);
        addWave(250, 5000, 2.2, 0.2, 0.15);




        // ==========================================
        // 🟢 PROPS DI SEBALIK PAGAR (Pohon Sakura Midground)
        // ==========================================
        // Skala diperkecil menjadi 0.55 dan dipindah ke sisi kiri
        const mgSakuraScale = 0.55;
        this.add.image(250, bgBottomY, 'sakura_tree').setOrigin(0.5, 1).setScale(mgSakuraScale).setDepth(2.5);
        this.add.image(2000, bgBottomY, 'sakura_tree').setOrigin(0.5, 1).setScale(mgSakuraScale).setDepth(2.5);
        this.add.image(3600, bgBottomY, 'sakura_tree').setOrigin(0.5, 1).setScale(mgSakuraScale).setDepth(2.5);

        // ==========================================
        // 🟢 PROPS DI TROTOAR (Pohon Sakura Depan / Ground)
        // ==========================================
        // Diperbesar sesuai keinginan user agar lebih wajar
        const fgSakuraScale = 0.45;
        this.add.image(100, height - 5, 'sakura_tree').setOrigin(0.5, 1).setScale(fgSakuraScale).setDepth(9);
        this.add.image(1100, height - 5, 'sakura_tree').setOrigin(0.5, 1).setScale(fgSakuraScale).setDepth(9);
        this.add.image(2600, height - 5, 'sakura_tree').setOrigin(0.5, 1).setScale(fgSakuraScale).setDepth(9);
        this.add.image(3500, height - 5, 'sakura_tree').setOrigin(0.5, 1).setScale(fgSakuraScale).setDepth(9);

        // ==========================================
        // 🌸 KELOPAK SAKURA DI TANAH & JALAN
        // ==========================================
        // Buat texture kelopak kecil jika belum ada
        if (!this.textures.exists('petal_ground')) {
            const pg = this.make.graphics({ x: 0, y: 0, add: false });
            pg.fillStyle(0xffb7c5, 1);
            pg.fillEllipse(3, 2, 6, 4); // Kelopak oval kecil
            pg.generateTexture('petal_ground', 6, 4);
            pg.destroy();
        }

        // Sebar kelopak di area trotoar & jalan (scrollFactor 1 = ikut kamera)
        const petalYMin = height - groundH - roadH; // Atas jalan
        const petalYMax = height - 5; // Bawah trotoar
        for (let i = 0; i < 60; i++) {
            const px = Math.random() * SCENE_WIDTH;
            const py = petalYMin + Math.random() * (petalYMax - petalYMin);
            const petal = this.add.image(px, py, 'petal_ground')
                .setOrigin(0.5)
                .setAlpha(0.4 + Math.random() * 0.4)
                .setAngle(Math.random() * 360)
                .setScale(0.8 + Math.random() * 1.5)
                .setDepth(7.5);

            // 40% kelopak akan terus bergerak tertiup angin ke kiri
            if (Math.random() < 0.4) {
                // Animasi Berguling
                this.tweens.add({
                    targets: petal,
                    angle: '-=360',
                    duration: 3000 + Math.random() * 2000,
                    repeat: -1
                });

                // Animasi Bergeser (Tersapu)
                this.tweens.add({
                    targets: petal,
                    x: '-=200', // Terus geser ke kiri secara relatif
                    duration: 4000 + Math.random() * 2000,
                    repeat: -1,
                    onUpdate: () => {
                        // Jika sudah keluar layar kiri jauh, munculkan lagi di kanan
                        if (petal.x < -50) {
                            petal.x = SCENE_WIDTH + 50;
                            petal.y = petalYMin + Math.random() * (petalYMax - petalYMin); // Posisi Y baru
                        }
                    }
                });
            }
        }

        // ==========================================
        // 🟢 KERETA & PARTIKEL
        // ==========================================
        // Merakit Kereta Komuter (Kepala + Gerbong + Ekor)
        // Taruh tepat di atas rel kereta api (dinamis mengikuti railOffset)
        this.train = this.add.container(4000, height - railOffset).setDepth(4);

        const headImg = this.textures.get('train_head').getSourceImage();
        const carImg = this.textures.get('train_carriage').getSourceImage();

        // Paskan ukuran train (Misal tinggi 150px)
        const trainScale = 200 / headImg.height;
        const scaledHeadW = headImg.width * trainScale;
        const scaledCarW = carImg.width * trainScale;

        // Kepala depan (Karena gerak ke X negatif / kiri -> jika aset default kanan, kita flip)
        const frontHead = this.add.image(0, 0, 'train_head')
            .setOrigin(1, 1).setScale(trainScale).setFlipX(true);
        this.train.add(frontHead);

        // Deretan gerbong tengah
        let currentX = 0;
        const totalCarriages = 8; // Rangkaian KRL panjang!
        for (let i = 0; i < totalCarriages; i++) {
            const carriage = this.add.image(currentX, 0, 'train_carriage')
                .setOrigin(0, 1).setScale(trainScale);
            this.train.add(carriage);
            currentX += scaledCarW;
        }

        // Kepala belakang (Ekor)
        const rearHead = this.add.image(currentX, 0, 'train_head')
            .setOrigin(0, 1).setScale(trainScale);
        this.train.add(rearHead);

        // ---- AMBIENT TRAIN (Lalu lalang acak) ----
        this.ambientTrain = this.add.container(-5000, height - railOffset).setDepth(3.5);
        const frontHeadAmb = this.add.image(0, 0, 'train_head').setOrigin(1, 1).setScale(trainScale).setFlipX(true);
        this.ambientTrain.add(frontHeadAmb);
        let currXAmb = 0;
        for (let i = 0; i < 4; i++) {
            const carriage = this.add.image(currXAmb, 0, 'train_carriage').setOrigin(0, 1).setScale(trainScale);
            this.ambientTrain.add(carriage);
            currXAmb += scaledCarW;
        }
        const rearHeadAmb = this.add.image(currXAmb, 0, 'train_head').setOrigin(0, 1).setScale(trainScale);
        this.ambientTrain.add(rearHeadAmb);

        this.time.addEvent({
            delay: 15000,
            loop: true,
            callback: () => {
                // Biar nggak bentrok saat cutscene, ambient beroperasi 
                // setelah cutscene utama selesai atau jika berjauhan
                if (!GameState.get('street_aira_met')) return;

                if (Math.random() > 0.3 && !this.tweens.isTweening(this.ambientTrain)) {
                    this.ambientTrain.x = SCENE_WIDTH + 1500;
                    this.tweens.add({
                        targets: this.ambientTrain,
                        x: -3000,
                        duration: 8000 + Math.random() * 4000,
                        ease: 'Linear'
                    });
                }
            }
        });

        // Partikel Sakura
        if (!this.textures.exists('sakura_petal')) {
            const gfx = this.make.graphics({ x: 0, y: 0, add: false });
            gfx.fillStyle(0xffb7c5, 1);
            gfx.fillCircle(4, 4, 4); // Bentuk bunga sementera
            gfx.generateTexture('sakura_petal', 8, 8);
            gfx.destroy();
        }

        this.sakuraEmitter = this.add.particles(0, 0, 'sakura_petal', {
            x: { min: 0, max: 3840 },
            y: -20,
            speedX: { min: -30, max: -80 },
            speedY: { min: 30, max: 80 },
            scale: { start: 1, end: 0.2 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 10000,
            frequency: 100,
            blendMode: 'NORMAL'
        });

        // ---- WORLD BOUNDS ----
        this.physics.world.setBounds(0, 0, 3840, height);

        // ---- PLATFORM / GROUND ----
        this.ground = this.physics.add.staticGroup();
        this.ground.add(
            this.add.rectangle(1920, height - 10, 3840, 20, 0x3a4a5a).setOrigin(0.5)
        );
        this.physics.add.existing(this.ground.getChildren()[0], true);

        // ---- PLAYER ----
        this.player = new Player(this, 100, height - 80);
        this.player.body_obj.setDepth(10); // Player paling depan
        this.physics.add.collider(this.player.body_obj, this.ground);

        // ---- MOBILE CONTROLS ----
        this.mobileControls = new MobileControls(this, this.player);

        // ---- DIALOG SYSTEM ----
        this.dialogSystem = new DialogSystem(this);

        // ---- NPC AIRA ----
        this.aira = this._createAira(1200, height - 80);
        this.aira.setDepth(10); // Aira sejajar player



        // ---- REGISTER SPEAKER → SPRITE MAPPING ----
        this.dialogSystem.registerSpeaker('MC', this.player.body_obj);
        this.dialogSystem.registerSpeaker('player', this.player.body_obj);
        this.dialogSystem.registerSpeaker('Aira', this.aira);

        // ---- PINTU KELUAR KE SEKOLAH ----
        this.schoolExit = this._createInteractable(3700, height - 120, '🏫 Gerbang Sekolah', 0x446655);

        // ---- OBJECTIVE ----
        GameState.setObjective('Pergi ke sekolah bersama Aira');

        // ---- CAMERA ----
        this.cameras.main.setBounds(0, 0, 3840, height);
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

        return sprite;
    }

    _createInteractable(x, y, label, color) {
        const zone = this.add.zone(x, y, 100, 100);
        this.physics.add.existing(zone, true);

        const isTouch = this.sys.game.device.input.touch;
        const hint = isTouch ? '[!]' : '[!] Press E';

        const indicator = this.add.text(x, y - 50, hint, {
            fontFamily: 'monospace', fontSize: isTouch ? '14px' : '12px', color: '#aaccff',
            backgroundColor: '#222244', padding: { x: 6, y: 3 }
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: indicator, y: y - 60, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        zone.indicator = indicator;
        this.add.rectangle(x, y, 60, 100, color).setOrigin(0.5); // Visual pintu gerbang
        this.add.text(x, y - 60, label, { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);

        return zone;
    }

    update() {
        this.player.update();
        this.dialogSystem.update(); // Update posisi speech bubble





        // 1. TRIGGER KETEMU AIRA & INTERUPSI KERETA
        if (!GameState.get('street_aira_met')) {
            // Jika MC mendekat ke Aira (jarak < 120px)
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.aira.x, this.aira.y) < 120) {
                GameState.set('street_aira_met', true);

                // Kunci gerakan MC
                this.player.isInteracting = true;
                this.player.setVelocityX(0);

                // Aira menghadap ke MC
                this.aira.setFlipX(this.player.x < this.aira.x);

                // ANIMASI KERETA MELINTAS SANGAT KENCANG
                // Membawa angin kencang (gaya gravitasi pada partikel)
                this.tweens.add({
                    targets: this.train,
                    x: '-=10000',    // Jarak tempuh ditarik lebih jauh ke kiri
                    duration: 6000, // 6 detik — lebih lambat & dramatis
                    ease: 'Power2',
                    onStart: () => {
                        // 1. Ubah fisika angin partikel sakura (tersapu kencang)
                        this.sakuraEmitter.gravityX = -1500;
                        this.sakuraEmitter.gravityY = -100;

                        // 2. Kamera bergetar keras (Camera Shake)
                        this.cameras.main.shake(1500, 0.005);
                    },
                    onComplete: () => {
                        // Kembalikan angin kembali normal
                        this.sakuraEmitter.gravityX = 0;
                        this.sakuraEmitter.gravityY = 0;

                        // Tepat setelah kereta lewat dan hening, dialog berlanjut 
                        this.dialogSystem.start(DIALOGS.EPISODE_0, 'scene_2_street', () => {
                            this.player.isInteracting = false;
                            GameState.setObjective('Lanjut jalan ke sekolah →');
                        });
                    }
                });
            }
        }
        // 2. AIRA MENGIKUTI MC SETELAH DIALOG
        else {
            if (!this.dialogSystem.isActive && this.player.body.velocity.x !== 0) {
                const targetX = this.player.body_obj.flipX ? this.player.x + 70 : this.player.x - 70;
                const dx = targetX - this.aira.x;
                this.aira.x += dx * 0.05;

                if (Math.abs(dx) > 2) {
                    this.aira.play('aira_walk', true);
                    this.aira.setFlipX(dx < 0);
                } else {
                    this.aira.play('aira_idle', true);
                }
            } else {
                this.aira.play('aira_idle', true);
            }
        }

        // 3. PINTU KELUAR KE SEKOLAH
        const distExit = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.schoolExit.x, this.schoolExit.y);
        const isNearExit = distExit < 100;
        this.schoolExit.indicator.setAlpha(isNearExit ? 1 : 0);

        // Toggle Dynamic Action Button for Mobile
        this.mobileControls.showInteract(isNearExit);

        if (this.player.justPressedE && isNearExit) {
            if (GameState.canLeaveScene('StreetScene')) {
                this.cameras.main.fadeOut(800);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('SchoolScene');
                });
            }
        }

        // Dialog Next (Tekan Spasi)
        if (this.dialogSystem.isActive && this.player.justPressedSpace) {
            this.dialogSystem.next();
        }
    }
}
