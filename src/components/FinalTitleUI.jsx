import { useState, useEffect } from 'react';
import EventBus from '../game/EventBus';

/**
 * FinalTitleUI — Overlay React untuk menampilkan tulisan akhir "Before..."
 * di atas layar putih setelah Phaser camera mati (fadeOut putih).
 */
export default function FinalTitleUI() {
    const [visible, setVisible] = useState(false);
    const [text, setText] = useState('');
    const [textOpacity, setTextOpacity] = useState(0);

    useEffect(() => {
        const handleShow = (title) => {
            setText(title);
            setVisible(true);
            // Fade-in teks secara bertahap
            setTimeout(() => setTextOpacity(1), 300);
        };

        const handleHide = () => {
            setTextOpacity(0);
            setTimeout(() => {
                setVisible(false);
                setText('');
            }, 800);
        };

        EventBus.on('show-final-title', handleShow);
        EventBus.on('hide-final-title', handleHide);

        return () => {
            EventBus.off('show-final-title', handleShow);
            EventBus.off('hide-final-title', handleHide);
        };
    }, []);

    if (!visible) return null;

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#ffffff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
            pointerEvents: 'none'
        }}>
            <span style={{
                fontFamily: "'Georgia', serif",
                fontSize: '36px',
                fontStyle: 'italic',
                color: '#111111',
                letterSpacing: '0.15em',
                opacity: textOpacity,
                transition: 'opacity 3s ease-in-out'
            }}>
                {text}
            </span>
        </div>
    );
}
