import { useState, useEffect } from 'react';
import PhaserGame from './components/PhaserGame';
import DialogUI from './components/DialogUI';
import FinalTitleUI from './components/FinalTitleUI';
import PauseUI from './components/PauseUI';

export default function App() {
    const [gameStarted, setGameStarted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Fungsi untuk Fullscreen
    const handleFullscreen = () => {
        const elem = document.documentElement;
        if (!document.fullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        document.addEventListener('webkitfullscreenchange', handler);

        // Shortcut Keyboard Global
        const handleKeyDown = (e) => {
            if (e.key.toLowerCase() === 'f') {
                handleFullscreen();
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('fullscreenchange', handler);
            document.removeEventListener('webkitfullscreenchange', handler);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
            height: '100vh',
            background: '#05050d',
            overflow: 'hidden',
            position: 'fixed',
            top: 0,
            left: 0,
            fontFamily: 'monospace'
        }}>
            {/* Overlay Rotasi */}
            <div className="rotate-overlay" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: '#0a0a0f',
                color: 'white',
                display: 'none',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
                textAlign: 'center',
                padding: '20px'
            }}>
                <div style={{
                    fontSize: '60px',
                    marginBottom: '30px',
                    animation: 'rotateDevice 2s infinite'
                }}>📱</div>
                <h2 style={{ 
                    margin: '20px 0', 
                    fontSize: '22px', 
                    color: '#aaccff',
                    letterSpacing: '2px'
                }}>HARAP PUTAR PERANGKAT</h2>
                <p style={{ 
                    opacity: 0.7, 
                    fontSize: '14px', 
                    maxWidth: '400px', 
                    lineHeight: '1.6',
                    color: '#ffffff'
                }}>
                    Game ini didesain untuk mode Landscape.<br/><br/>
                    Gunakan tombol Fullscreen jika tampilan kurang pas.
                </p>
                <style>{`
                    @media screen and (orientation: portrait) {
                        .rotate-overlay { display: flex !important; }
                    }
                    @keyframes rotateDevice {
                        0% { transform: rotate(0deg); }
                        50% { transform: rotate(-90deg); }
                        100% { transform: rotate(0deg); }
                    }
                `}</style>
            </div>

            {/* Container Control Group (Pindah kembali ke Pojok Kanan) */}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 10000,
                display: 'flex',
                gap: '10px'
            }}>
                <PauseUI />
                
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        handleFullscreen();
                    }}
                    style={{
                        background: '#1a1a3a',
                        color: '#aaccff',
                        border: 'none',
                        padding: '10px 15px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontFamily: 'monospace',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}
                >
                    {isFullscreen ? 'EXIT' : '⛶ FULLSCREEN'}
                </button>
            </div>

            {/* Game container */}
            <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#0a0a0f'
            }}>

                {/* Phaser Canvas */}
                <PhaserGame onGameReady={() => setGameStarted(true)} />

                {/* React UI Overlays */}
                {gameStarted && (
                    <>
                        <DialogUI />
                        <FinalTitleUI />
                    </>
                )}
            </div>
        </div>
    );
}
