import EventBus from '../game/EventBus';
import { SpeechBubble } from './SpeechBubble';

/**
 * DialogSystem — Mengelola antrian dialog (tree-based)
 * V2: Teks biasa → SpeechBubble (Phaser), Choices → React overlay
 */
export class DialogSystem {
    constructor(scene) {
        this.scene = scene;
        this.isActive = false;
        this.tree = null;
        this.queue = [];
        this.currentIndex = 0;
        this.onComplete = null;

        // Speech Bubble untuk dialog teks
        this.bubble = new SpeechBubble(scene);

        // Map speaker name → character sprite (diset oleh scene)
        this.speakerMap = {};

        // Tangkap event pilihan dari React UI
        EventBus.on('dialog-choice', (nextNode) => {
            this.jumpToNode(nextNode);
        });

        // Tangkap event klik/tap dari React UI untuk lanjut dialog (untuk fallback)
        EventBus.on('dialog-next', () => {
            this.next();
        });

        // Tangkap event klik/tap dari dalam game (Canvas) karena DialogUI React sekarang disembunyikan untuk teks biasa
        if (this.scene.input) {
            this.scene.input.on('pointerdown', () => {
                if (this.isActive) {
                    this.next();
                }
            });
        }
    }

    /**
     * Registrasikan mapping speaker → sprite
     * Panggil dari scene: dialogSystem.registerSpeaker('Aira', airaSprite)
     */
    registerSpeaker(name, sprite) {
        this.speakerMap[name] = sprite;
    }

    /**
     * Mulai dialog dengan struktur Tree
     */
    start(dialogTree, startNode, onComplete) {
        this.tree = dialogTree;
        this.isActive = true;
        this.onComplete = onComplete;
        this.jumpToNode(startNode);
    }

    /**
     * Melompat ke node dialog/scene lain dalam satu tree
     */
    jumpToNode(nodeName) {
        if (!this.tree || !this.tree[nodeName]) {
            console.error(`Dialog node [${nodeName}] tidak ditemukan! Mengakhiri dialog.`);
            this.end();
            return;
        }
        this.queue = this.tree[nodeName];
        this.currentIndex = 0;
        this._processCurrent();
    }

    _processCurrent() {
        if (this.currentIndex >= this.queue.length) {
            this.end();
            return;
        }

        const line = this.queue[this.currentIndex];

        // 1. Tangani Custom Actions
        if (line.action) {
            if (line.action === 'pause') {
                // Sembunyikan bubble & UI saat pause
                this.bubble.destroy();
                EventBus.emit('hide-dialog');
                this.scene.time.delayedCall(line.duration || 1000, () => {
                    this.currentIndex++;
                    this._processCurrent();
                });
                return;
            }
            else if (line.action === 'play_sfx') {
                console.log(`[Audio SFX] Memutar: ${line.sound}`);
                EventBus.emit('scene-action', line);
            }
            else if (line.action === 'next_scene') {
                this.jumpToNode(line.target);
                return;
            }
            else if (line.action === 'cut_to_white') {
                this.bubble.destroy();
                EventBus.emit('hide-dialog');
                this.scene.cameras.main.fadeOut(300, 255, 255, 255);
                this.scene.time.delayedCall(400, () => {
                    this.currentIndex++;
                    this._processCurrent();
                });
                return;
            }
            else {
                EventBus.emit('scene-action', line);
            }

            // Jika node hanya murni action (tanpa teks/choices), lanjut instan
            if (!line.text && !line.choices) {
                this.currentIndex++;
                this._processCurrent();
                return;
            }
        }

        // 2. Tangani Dialog
        if (line.choices) {
            // CHOICES → Tetap pakai React overlay
            this.bubble.destroy();
            EventBus.emit('show-dialog', line);
        } else if (line.text) {
            // TEKS BIASA → Speech Bubble di atas karakter
            EventBus.emit('hide-dialog'); // Pastikan React overlay tertutup

            const isInner = line.speaker?.includes('inner') || false;
            const speakerClean = line.speaker?.replace(' (inner)', '').replace(' 📱', '') || '';

            // Cari sprite target berdasarkan speaker
            let targetSprite = this._resolveTarget(speakerClean, isInner);

            this.bubble.show(targetSprite, line.speaker, line.text, isInner);
        } else {
            // Safety fallback
            this.currentIndex++;
            this._processCurrent();
        }
    }

    /**
     * Resolve speaker name ke sprite karakter
     */
    _resolveTarget(speakerClean, isInner) {
        // Inner monologue selalu muncul di atas MC (player)
        if (isInner) {
            return this.speakerMap['MC'] || this.speakerMap['player'] || this._getFallbackTarget();
        }

        // Cek exact match
        if (this.speakerMap[speakerClean]) {
            return this.speakerMap[speakerClean];
        }

        // Cek partial match (misal 'Aira 📱' → 'Aira')
        for (const key of Object.keys(this.speakerMap)) {
            if (speakerClean.includes(key) || key.includes(speakerClean)) {
                return this.speakerMap[key];
            }
        }

        // Fallback ke MC/player
        return this.speakerMap['MC'] || this.speakerMap['player'] || this._getFallbackTarget();
    }

    _getFallbackTarget() {
        // Fallback: posisi tengah layar atas
        const { width } = this.scene.scale;
        return {
            x: width / 2 + (this.scene.cameras.main.scrollX || 0),
            y: 200,
            displayHeight: 0
        };
    }

    /**
     * Lanjut baris berikutnya (dari klik/tap/spasi)
     */
    next() {
        if (!this.isActive) return;
        const line = this.queue[this.currentIndex];

        // Jika ada choice/pilihan, player tidak bisa sekadar skip next
        if (line && line.choices) return;

        // Jika masih typing, skip dulu
        if (this.bubble.isTyping) {
            this.bubble.skipTypewriter();
            return;
        }

        this.currentIndex++;
        this._processCurrent();
    }

    /**
     * Update bubble position (panggil dari scene.update)
     */
    update() {
        this.bubble.update();
    }

    end() {
        this.isActive = false;
        this.tree = null;
        this.queue = [];
        this.bubble.destroy();
        EventBus.emit('hide-dialog');
        if (this.onComplete) this.onComplete();
    }
}
