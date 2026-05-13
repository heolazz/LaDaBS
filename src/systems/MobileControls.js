import Phaser from 'phaser';

/**
 * MobileControls — Dynamic Floating Joystick and Contextual Action Button.
 * Includes "Tap to Next" logic for dialogs.
 */
export class MobileControls {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.isActive = false;

        // Cek apakah touch device
        const isTouch = scene.sys.game.device.input.touch;

        // Debug: force enable for testing if needed
        // const isTouch = true; 

        if (isTouch) {
            this.create();
            this.isActive = true;
        }
    }

    create() {
        const { width, height } = this.scene.scale;

        // --- Floating Joystick Components (Hidden by default) ---
        const baseRadius = 60;
        const knobRadius = 30;

        this.joyBase = this.scene.add.graphics();
        this.joyBase.fillStyle(0xffffff, 0.1);
        this.joyBase.lineStyle(3, 0xffffff, 0.2);
        this.joyBase.fillCircle(0, 0, baseRadius);
        this.joyBase.strokeCircle(0, 0, baseRadius);
        this.joyBase.setVisible(false).setScrollFactor(0).setDepth(200);

        this.joyKnob = this.scene.add.graphics();
        this.joyKnob.fillStyle(0xffffff, 0.4);
        this.joyKnob.fillCircle(0, 0, knobRadius);
        this.joyKnob.lineStyle(2, 0xffffff, 0.6);
        this.joyKnob.strokeCircle(0, 0, knobRadius);
        this.joyKnob.setVisible(false).setScrollFactor(0).setDepth(201);

        // --- Contextual Action Button ---
        this.btnAction = this.scene.add.container(width - 100, height - 120);

        const bgInner = this.scene.add.graphics();
        // Pixel diamond shape
        bgInner.fillStyle(0x334466, 0.8);
        bgInner.lineStyle(4, 0xaaccff, 1);

        const pts = [
            { x: 0, y: -45 }, { x: 45, y: 0 },
            { x: 0, y: 45 }, { x: -45, y: 0 }
        ];
        bgInner.fillPoints(pts, true);
        bgInner.strokePoints(pts, true);

        // Action Text "!" or a Symbol
        const actionTxt = this.scene.add.text(0, 0, '!', {
            fontSize: '32px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.btnAction.add([bgInner, actionTxt]);
        this.btnAction.setScrollFactor(0).setDepth(200);
        this.btnAction.setSize(80, 80);
        this.btnAction.setInteractive({ useHandCursor: true });
        this.btnAction.setVisible(false); // Hidden until needed

        this.btnAction.on('pointerdown', (pointer) => {
            pointer.event.stopPropagation();
            this.player.mobileInput.interact = true;
            this.scene.tweens.add({
                targets: this.btnAction,
                scale: 0.9,
                duration: 50
            });
        });
        this.btnAction.on('pointerup', () => {
            this.scene.tweens.add({
                targets: this.btnAction,
                scale: 1.0,
                duration: 50
            });
        });

        // --- Input State Handling ---
        this.dragPointer = null;
        this.baseRadius = baseRadius;

        this.scene.input.on('pointerdown', (pointer) => {
            // Priority 1: Dialog Progression (Anywhere if interacting, else Right Half)
            if (this.player.isInteracting || pointer.x > width / 2) {
                // Check if NOT on the Action Button itself
                const distToBtn = Phaser.Math.Distance.Between(pointer.x, pointer.y, width - 100, height - 120);
                if (distToBtn > 60 || !this.btnAction.visible) {
                    this.player.mobileInput.next = true;
                    return;
                }
            }

            // Priority 2: Dynamic Joystick (left half, only if NOT interacting)
            if (!this.player.isInteracting && pointer.x < width / 2 && !this.dragPointer) {
                this.dragPointer = pointer;
                this.joyBase.setPosition(pointer.x, pointer.y).setVisible(true);
                this.joyKnob.setPosition(pointer.x, pointer.y).setVisible(true);
            }
        });

        this.scene.input.on('pointermove', (pointer) => {
            if (this.dragPointer && this.dragPointer.id === pointer.id) {
                const dist = Phaser.Math.Distance.Between(this.joyBase.x, this.joyBase.y, pointer.x, pointer.y);
                const angle = Phaser.Math.Angle.Between(this.joyBase.x, this.joyBase.y, pointer.x, pointer.y);

                const moveDist = Math.min(dist, baseRadius);
                const kX = this.joyBase.x + Math.cos(angle) * moveDist;
                const kY = this.joyBase.y + Math.sin(angle) * moveDist;

                this.joyKnob.setPosition(kX, kY);

                // Update Player
                if (moveDist > 10) {
                    const horizontal = Math.cos(angle);
                    this.player.mobileInput.left = horizontal < -0.3;
                    this.player.mobileInput.right = horizontal > 0.3;
                } else {
                    this.player.mobileInput.left = false;
                    this.player.mobileInput.right = false;
                }
            }
        });

        this.scene.input.on('pointerup', (pointer) => {
            if (this.dragPointer && this.dragPointer.id === pointer.id) {
                this.dragPointer = null;
                this.joyBase.setVisible(false);
                this.joyKnob.setVisible(false);
                this.player.mobileInput.left = false;
                this.player.mobileInput.right = false;
            }
        });
    }

    /**
     * Show/Hide the contextual action button.
     */
    showInteract(visible) {
        if (!this.isActive) return;
        if (this.btnAction.visible !== visible) {
            this.btnAction.setVisible(visible);
            if (visible) {
                this.btnAction.setScale(0);
                this.scene.tweens.add({
                    targets: this.btnAction,
                    scale: 1,
                    duration: 200,
                    ease: 'Back.easeOut'
                });
            }
        }
    }
}
