import Phaser from 'phaser';
import EventBus from '../EventBus';

/**
 * HUDScene — Task/Objective di tengah atas canvas
 */
export class HUDScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HUDScene' });
    }

    create() {
        const { width } = this.scale;

        const PAD_X = 30;
        const PAD_Y = 10;
        const centerX = width / 2;

        // Label "TUJUAN"
        this.label = this.add.text(centerX, 16, 'TUJUAN', {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#aaccff',
            letterSpacing: 4
        }).setOrigin(0.5, 0).setAlpha(0).setDepth(1);

        // Teks isi Objective
        this.objectiveText = this.add.text(centerX, 34, '', {
            fontFamily: 'monospace',
            fontSize: '17px',
            color: '#ffffff',
            align: 'center',
        }).setOrigin(0.5, 0).setAlpha(0).setDepth(1);

        // Background box (digambar ulang setiap update)
        this.bgBox = this.add.graphics().setDepth(0);

        EventBus.on('update-objective', (text) => this.updateObjective(text));

        import('../../systems/StateManager').then(module => {
            if (module.GameState.objective) {
                this.updateObjective(module.GameState.objective);
            }
        });
    }

    updateObjective(text) {
        if (!text) {
            this.tweens.add({ targets: [this.bgBox, this.label, this.objectiveText], alpha: 0, duration: 400 });
            return;
        }

        this.objectiveText.setText(text);

        // Tunggu 1 frame agar Phaser selesai render teks dulu, baru ukur
        this.time.delayedCall(0, () => {
            const { width } = this.scale;
            const PAD_X = 28;
            const PAD_Y_TOP = 12;
            const PAD_Y_BOT = 14;

            const textW = this.objectiveText.width;
            const labelW = this.label.width;
            const boxW = Math.max(textW, labelW) + PAD_X * 2;
            const boxH = 70; // label + gap + teks
            const boxX = (width - boxW) / 2;
            const boxY = 8;

            // Gambar ulang background + border
            this.bgBox.clear();

            // Isi background
            this.bgBox.fillStyle(0x08080f, 0.88);
            this.bgBox.fillRect(boxX, boxY, boxW, boxH);

            // Border (rounded-ish via stroke)
            this.bgBox.lineStyle(2, 0x6688cc, 0.5);
            this.bgBox.strokeRect(boxX, boxY, boxW, boxH);

            // Garis pemisah tipis di bawah label
            this.bgBox.lineStyle(1, 0xaaccff, 0.2);
            this.bgBox.lineBetween(boxX + 10, boxY + 26, boxX + boxW - 10, boxY + 26);

            this.tweens.add({
                targets: [this.bgBox, this.label, this.objectiveText],
                alpha: 1,
                duration: 500
            });
        });
    }
}
