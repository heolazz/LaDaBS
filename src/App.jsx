import { useState } from 'react';
import PhaserGame from './components/PhaserGame';
import DialogUI from './components/DialogUI';
import ObjectiveUI from './components/ObjectiveUI';
import FinalTitleUI from './components/FinalTitleUI';

export default function App() {
    const [gameStarted, setGameStarted] = useState(false);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
            height: '100vh',
            background: '#05050d'
        }}>
            {/* Game container dengan UI overlay */}
            <div style={{
                position: 'relative',
                width: '100dvw',
                height: '100dvh',
                maxWidth: '1280px',
                maxHeight: '720px',
                aspectRatio: '16/9',
                display: 'flex',
                background: '#0a0a0f',
                boxShadow: '0 0 100px rgba(0,0,0,0.5)'
            }}>

                {/* Phaser Canvas */}
                <PhaserGame onGameReady={() => setGameStarted(true)} />

                {/* React UI Overlays — hanya tampil setelah game siap */}
                {gameStarted && (
                    <>
                        <ObjectiveUI />
                        <DialogUI />
                        <FinalTitleUI />
                    </>
                )}
            </div>
        </div>
    );
}
