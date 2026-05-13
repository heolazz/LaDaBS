import { useState, useEffect } from 'react';
import EventBus from '../game/EventBus';

export default function PauseUI() {
    const [isPaused, setIsPaused] = useState(false);
    const [currentScene, setCurrentScene] = useState(null);

    useEffect(() => {
        const onSceneReady = (scene) => {
            setCurrentScene(scene);
            const hiddenScenes = ['MainMenuScene', 'LoadingScene', 'BootScene'];
            if (hiddenScenes.includes(scene.scene.key)) {
                setCurrentScene(null);
            }
        };

        EventBus.on('current-scene-ready', onSceneReady);
        return () => EventBus.off('current-scene-ready', onSceneReady);
    }, []);

    const togglePause = () => {
        if (!currentScene) return;
        if (isPaused) {
            currentScene.scene.resume();
            setIsPaused(false);
        } else {
            currentScene.scene.pause();
            setIsPaused(true);
        }
    };

    const returnToMainMenu = () => {
        if (!currentScene) return;
        currentScene.scene.resume();
        currentScene.scene.start('MainMenuScene');
        setIsPaused(false);
        setCurrentScene(null);
    };

    if (!currentScene && !isPaused) return null;

    return (
        <>
            {/* Tombol Pause - Diposisikan oleh parent (App.jsx) */}
            {currentScene && !isPaused && (
                <button 
                    onClick={togglePause}
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
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}
                >
                    ☰ MENU
                </button>
            )}

            {/* Overlay Menu Pause */}
            {isPaused && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(5, 5, 13, 0.85)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 20000,
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        background: 'rgba(26, 26, 58, 0.95)',
                        padding: '40px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderTop: '4px solid #aaccff',
                        borderBottom: '4px solid #aaccff',
                        width: '100%',
                        maxWidth: '400px'
                    }}>
                        <h2 style={{ 
                            color: '#ffffff', 
                            marginBottom: '40px', 
                            fontSize: '24px',
                            fontFamily: 'monospace',
                            letterSpacing: '4px'
                        }}>GAME PAUSED</h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '250px' }}>
                            <button 
                                onClick={togglePause}
                                className="menu-btn"
                                style={menuButtonStyle('#1a1a3a', '#aaccff')}
                            >
                                ▶ LANJUTKAN
                            </button>
                            
                            <button 
                                onClick={returnToMainMenu}
                                className="menu-btn"
                                style={menuButtonStyle('#334466', '#ffffff')}
                            >
                                ✖ KELUAR KE MENU
                            </button>
                        </div>
                    </div>

                    <style>{`
                        .menu-btn:hover {
                            filter: brightness(1.3);
                            transform: scale(1.05);
                        }
                    `}</style>
                </div>
            )}
        </>
    );
}

const menuButtonStyle = (bgColor, textColor) => ({
    padding: '14px 20px',
    background: bgColor,
    color: textColor,
    border: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: 'monospace',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    textAlign: 'center'
});
