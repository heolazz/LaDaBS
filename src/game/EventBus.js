import Phaser from 'phaser';

// Jembatan komunikasi antara React ↔ Phaser
// React bisa listen events dari Phaser, dan sebaliknya
const EventBus = new Phaser.Events.EventEmitter();

export default EventBus;

/**
 * EVENTS yang tersedia:
 *
 * Phaser → React:
 *   'current-scene-ready'  : scene baru siap
 *   'show-dialog'          : { speaker, portrait, text }
 *   'hide-dialog'          : tutup dialog
 *   'update-objective'     : string objective baru
 *
 * React → Phaser:
 *   'dialog-next'          : tombol next ditekan dari UI React
 */
