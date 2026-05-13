import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GAME_CONFIG } from '../game/config';

/**
 * PhaserGame — Mount Phaser canvas ke dalam React
 * Phaser berjalan sepenuhnya di dalam div ini
 */
export default function PhaserGame({ onGameReady }) {
    const gameRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (gameRef.current) return; // Prevent double-init (React StrictMode)

        const config = {
            ...GAME_CONFIG,
            parent: containerRef.current
        };

        gameRef.current = new Phaser.Game(config);

        if (onGameReady) {
            onGameReady(gameRef.current);
        }

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            id="game-container"
            style={{
                width: '100dvw',
                height: '100dvh',
                maxWidth: '1280px',
                maxHeight: '720px',
                aspectRatio: '16/9',
                margin: 'auto',
                position: 'relative',
                overflow: 'hidden'
            }}
        />
    );
}
