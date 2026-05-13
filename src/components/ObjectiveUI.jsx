import { useState, useEffect } from 'react';
import EventBus from '../game/EventBus';

/**
 * ObjectiveUI — Menampilkan objective saat ini di pojok kiri atas
 */
export default function ObjectiveUI() {
    const [objective, setObjective] = useState('');
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handle = (text) => {
            setObjective(text);
            setVisible(true);
        };
        EventBus.on('update-objective', handle);
        return () => EventBus.off('update-objective', handle);
    }, []);

    if (!visible) return null;

    return (
        <div style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            background: 'rgba(8, 8, 20, 0.75)',
            border: '1px solid rgba(100, 120, 200, 0.25)',
            borderRadius: '6px',
            padding: '8px 16px',
            pointerEvents: 'none'
        }}>
            <div style={{
                fontFamily: 'monospace',
                fontSize: '11px',
                color: 'rgba(150, 170, 255, 0.5)',
                marginBottom: '3px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
            }}>
                Tujuan
            </div>
            <div style={{
                fontFamily: "'Georgia', serif",
                fontSize: '14px',
                color: 'rgba(220, 225, 255, 0.85)'
            }}>
                {objective}
            </div>
        </div>
    );
}
