import Phaser from 'phaser';

/**
 * Player — MC (Protagonist)
 * Menggunakan Graphics placeholder karena sprite asset belum ada.
 * Wrap dengan Container agar physics + visual mudah dikelola.
 */
export class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.speed = 200;
        this.isInteracting = false;

        // Mobile input states
        this.mobileInput = {
            left: false,
            right: false,
            interact: false,
            next: false
        };

        // Sprite asset
        this.body_obj = scene.physics.add.sprite(x, y, 'mc_idle_1');
        // Asset-nya berukuran 320x870, kita scale ke ukuran yang cocok
        this.body_obj.setScale(0.18);
        this.body_obj.setCollideWorldBounds(true);
        // Sesuaikan hitbox physics jika perlu
        this.body_obj.body.setSize(200, 800); // unscaled dimension size, will be scaled internally

        // Expose x, y, body untuk kompatibilitas
        this.x = x;
        this.y = y;
        this.body = this.body_obj.body;

        // Mainkan idle
        this.body_obj.play('mc_idle');

        // Input
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyE = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    /** Expose setVelocityX untuk kompatibilitas dengan scene */
    setVelocityX(vx) { this.body_obj.setVelocityX(vx); }

    update() {
        // Sync posisi dari physics body
        this.x = this.body_obj.x;
        this.y = this.body_obj.y;

        // Deteksi just-pressed (Keyboard)
        const justPressedE = Phaser.Input.Keyboard.JustDown(this.keyE);
        const justPressedSpace = Phaser.Input.Keyboard.JustDown(this.keySpace);

        // Gabungkan dengan mobile input
        this.justPressedE = justPressedE || this.mobileInput.interact;
        this.justPressedSpace = justPressedSpace || this.mobileInput.next;

        // Reset just-pressed mobile signals after being read
        if (this.mobileInput.interact) this.mobileInput.interact = false;
        if (this.mobileInput.next) this.mobileInput.next = false;

        if (this.isInteracting) {
            this.setVelocityX(0);
            this.body_obj.play('mc_idle', true);
            return;
        }

        const left = this.cursors.left.isDown || this.keyA.isDown || this.mobileInput.left;
        const right = this.cursors.right.isDown || this.keyD.isDown || this.mobileInput.right;

        if (left) {
            this.setVelocityX(-this.speed);
            this.body_obj.setFlipX(true);
            this.body_obj.play('mc_walk', true);
        } else if (right) {
            this.setVelocityX(this.speed);
            this.body_obj.setFlipX(false);
            this.body_obj.play('mc_walk', true);
        } else {
            this.setVelocityX(0);
            this.body_obj.play('mc_idle', true);
        }
    }

    destroy() {
        this.body_obj.destroy();
    }
}
