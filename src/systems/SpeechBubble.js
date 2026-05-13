import Phaser from 'phaser';

/**
 * SpeechBubble — Menampilkan dialog teks di atas karakter dalam Phaser canvas
 * Mendukung typewriter effect, inner monologue styling, dan auto-positioning.
 */
export class SpeechBubble {
    constructor(scene) {
        this.scene = scene;
        this.container = null;
        this.bgGraphics = null;
        this.textObj = null;
        this.nametagObj = null;
        this.pointerObj = null;
        this.typeTimer = null;
        this.isTyping = false;
        this.fullText = '';
        this.currentCharIndex = 0;
        this.targetSprite = null;
        this.isInner = false;

        // Config
        this.MAX_WIDTH = 320;
        this.PADDING = 14;
        this.OFFSET_Y = -20; // Jarak di atas kepala karakter
        this.TYPE_SPEED = 35; // ms per karakter
    }

    /**
     * Tampilkan speech bubble di atas target sprite
     * @param {Phaser.GameObjects.Sprite|Object} target - Sprite karakter (harus punya .x, .y)
     * @param {string} speaker - Nama pembicara
     * @param {string} text - Teks dialog
     * @param {boolean} isInner - Apakah inner monologue
     */
    show(target, speaker, text, isInner = false) {
        this.destroy(); // Hapus bubble sebelumnya

        this.targetSprite = target;
        this.fullText = text;
        this.isInner = isInner;
        this.currentCharIndex = 0;
        this.isTyping = true;

        const speakerClean = speaker?.replace(' (inner)', '').replace(' 📱', '') || '';

        // === CREATE CONTAINER ===
        this.container = this.scene.add.container(0, 0).setDepth(100);

        // === NAMETAG ===
        if (speakerClean) {
            this.nametagObj = this.scene.add.text(0, 0, isInner ? `💭 ${speakerClean}` : speakerClean, {
                fontFamily: "'Segoe UI', Arial, sans-serif",
                fontSize: '12px',
                fontStyle: 'bold',
                color: isInner ? '#c8b8e8' : '#8cb4ff',
                backgroundColor: isInner ? 'rgba(40, 30, 60, 0.9)' : 'rgba(15, 20, 45, 0.9)',
                padding: { x: 8, y: 3 },
                resolution: 2
            }).setOrigin(0, 1);
            this.container.add(this.nametagObj);
        }

        // === TEXT OBJECT ===
        this.textObj = this.scene.add.text(0, 0, '', {
            fontFamily: "'Segoe UI', 'Noto Sans JP', sans-serif",
            fontSize: '15px',
            fontStyle: isInner ? 'italic' : 'normal',
            color: isInner ? '#d0c8e8' : '#f0f0f8',
            wordWrap: { width: this.MAX_WIDTH - (this.PADDING * 2) },
            lineSpacing: 6,
            resolution: 2
        }).setOrigin(0, 0);
        this.container.add(this.textObj);

        // === BACKGROUND GRAPHICS (akan digambar ulang tiap frame) ===
        this.bgGraphics = this.scene.add.graphics();
        this.container.addAt(this.bgGraphics, 0); // Di belakang teks

        // === CONTINUE INDICATOR ===
        this.continueIndicator = this.scene.add.text(0, 0, '▼', {
            fontFamily: 'sans-serif',
            fontSize: '12px',
            color: isInner ? 'rgba(160, 140, 200, 0.6)' : 'rgba(100, 150, 255, 0.6)',
            resolution: 2
        }).setOrigin(1, 0).setAlpha(0);
        this.container.add(this.continueIndicator);

        // Bounce animation untuk continue indicator
        this.scene.tweens.add({
            targets: this.continueIndicator,
            y: '+=4',
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // === START TYPEWRITER ===
        this._typeNext();
        this.typeTimer = this.scene.time.addEvent({
            delay: this.TYPE_SPEED,
            callback: this._typeNext,
            callbackScope: this,
            loop: true
        });

        // Update posisi tiap frame
        this._updatePosition();
    }

    _typeNext() {
        if (!this.textObj || !this.isTyping) return;

        this.currentCharIndex++;
        this.textObj.setText(this.fullText.slice(0, this.currentCharIndex));

        // Redraw background setiap kali teks berubah
        this._drawBackground();
        this._updatePosition();

        if (this.currentCharIndex >= this.fullText.length) {
            this.isTyping = false;
            if (this.typeTimer) {
                this.typeTimer.remove(false);
                this.typeTimer = null;
            }
            // Tampilkan continue indicator
            if (this.continueIndicator) {
                this.continueIndicator.setAlpha(1);
            }
        }
    }

    /**
     * Skip typewriter — tampilkan seluruh teks instan
     */
    skipTypewriter() {
        if (!this.isTyping) return;
        this.isTyping = false;
        this.currentCharIndex = this.fullText.length;

        if (this.typeTimer) {
            this.typeTimer.remove(false);
            this.typeTimer = null;
        }

        if (this.textObj) {
            this.textObj.setText(this.fullText);
            this._drawBackground();
            this._updatePosition();
        }

        if (this.continueIndicator) {
            this.continueIndicator.setAlpha(1);
        }
    }

    _drawBackground() {
        if (!this.bgGraphics || !this.textObj) return;

        this.bgGraphics.clear();

        const textBounds = this.textObj.getBounds();
        const pad = this.PADDING;
        const w = Math.max(textBounds.width + pad * 2, 80);
        const h = textBounds.height + pad * 2;
        const radius = 10;

        // Nametag offset
        const nameH = this.nametagObj ? 18 : 0;

        // Background fill
        if (this.isInner) {
            this.bgGraphics.fillStyle(0x1a1228, 0.92);
            this.bgGraphics.lineStyle(1.5, 0x6a58a0, 0.4);
        } else {
            this.bgGraphics.fillStyle(0x0a0e1e, 0.92);
            this.bgGraphics.lineStyle(1.5, 0x4a6aaa, 0.35);
        }

        // Rounded rectangle
        this.bgGraphics.fillRoundedRect(-pad, nameH, w, h, radius);
        this.bgGraphics.strokeRoundedRect(-pad, nameH, w, h, radius);

        // Pointer triangle (mengarah ke bawah ke karakter)
        const pointerX = w / 2 - pad;
        const pointerY = nameH + h;
        this.bgGraphics.fillStyle(this.isInner ? 0x1a1228 : 0x0a0e1e, 0.92);
        this.bgGraphics.fillTriangle(
            pointerX - 8, pointerY,
            pointerX + 8, pointerY,
            pointerX, pointerY + 12
        );

        // Reposition text
        this.textObj.setPosition(0, nameH + pad);

        // Reposition nametag
        if (this.nametagObj) {
            this.nametagObj.setPosition(-pad, nameH);
        }

        // Reposition continue indicator
        if (this.continueIndicator) {
            this.continueIndicator.setPosition(w - pad, nameH + h - 4);
        }
    }

    _updatePosition() {
        if (!this.container || !this.targetSprite) return;

        const target = this.targetSprite;
        // Ambil posisi di atas kepala karakter
        // Untuk sprite: gunakan .y - (displayHeight / 2) sebagai pucuk kepala
        const tx = target.x || 0;
        const ty = (target.y || 0) - ((target.displayHeight || target.height || 100) / 2);

        // Hitung lebar bubble agar bisa center
        const textBounds = this.textObj ? this.textObj.getBounds() : { width: 100 };
        const bubbleW = Math.max(textBounds.width + this.PADDING * 2, 80);

        this.container.setPosition(
            tx - bubbleW / 2 + this.PADDING,
            ty + this.OFFSET_Y - (this.textObj ? this.textObj.height : 20) - this.PADDING * 2 - 12 - (this.nametagObj ? 18 : 0)
        );
    }

    /**
     * Update posisi bubble (panggil dari scene.update)
     */
    update() {
        if (this.container && this.targetSprite) {
            this._updatePosition();
        }
    }

    /**
     * Hapus bubble sepenuhnya
     */
    destroy() {
        if (this.typeTimer) {
            this.typeTimer.remove(false);
            this.typeTimer = null;
        }
        if (this.container) {
            this.container.destroy(true);
            this.container = null;
        }
        this.bgGraphics = null;
        this.textObj = null;
        this.nametagObj = null;
        this.continueIndicator = null;
        this.targetSprite = null;
        this.isTyping = false;
    }
}
