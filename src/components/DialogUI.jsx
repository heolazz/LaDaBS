import { useState, useEffect, useRef } from 'react';
import EventBus from '../game/EventBus';

/**
 * DialogUI — React overlay HANYA untuk pilihan (choices)
 * Dialog teks biasa sekarang ditangani oleh SpeechBubble di Phaser canvas
 */
export default function DialogUI() {
    const [visible, setVisible] = useState(false);
    const [speaker, setSpeaker] = useState(null);
    const [displayText, setDisplayText] = useState('');
    const [fullText, setFullText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [choices, setChoices] = useState(null);
    const [isMicroChoice, setIsMicroChoice] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);

    const typeIntervalRef = useRef(null);

    const isInner = speaker?.includes('inner');

    useEffect(() => {
        const handleShow = (lineData) => {
            const { speaker, text, choices, isMicroChoice } = lineData;

            if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);

            setSpeaker(speaker || null);
            setChoices(choices || null);
            setIsMicroChoice(isMicroChoice || false);

            const safeText = text || '';
            setFullText(safeText);
            setDisplayText('');

            // Hanya tampilkan overlay jika ada choices
            if (choices) {
                setVisible(true);
                setFadeIn(false);
                requestAnimationFrame(() => setFadeIn(true));

                // Jika ada teks pengantar sebelum choices, ketik dulu
                if (safeText) {
                    setIsTyping(true);
                    let i = 0;
                    typeIntervalRef.current = setInterval(() => {
                        i++;
                        setDisplayText(safeText.slice(0, i));
                        if (i >= safeText.length) {
                            clearInterval(typeIntervalRef.current);
                            setIsTyping(false);
                        }
                    }, 35);
                } else {
                    setIsTyping(false);
                }
            }
        };

        const handleHide = () => {
            if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
            setFadeIn(false);
            setTimeout(() => {
                setVisible(false);
                setDisplayText('');
                setChoices(null);
                setIsMicroChoice(false);
            }, 150);
        };

        EventBus.on('show-dialog', handleShow);
        EventBus.on('hide-dialog', handleHide);

        return () => {
            EventBus.off('show-dialog', handleShow);
            EventBus.off('hide-dialog', handleHide);
            if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
        };
    }, []);

    // Klik di overlay (untuk skip typewriter teks pengantar choices)
    const handleClick = () => {
        if (isTyping) {
            if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
            setDisplayText(fullText);
            setIsTyping(false);
        }
    };

    const handleChoiceClick = (e, nextNode) => {
        e.stopPropagation();
        EventBus.emit('dialog-choice', nextNode);
    };

    if (!visible) return null;

    const speakerClean = speaker?.replace(' (inner)', '') || '';

    return (
        <div
            onClick={handleClick}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'auto',
                userSelect: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center', // Choices di tengah layar
                alignItems: 'center',
                padding: '0 8vw',
                boxSizing: 'border-box',
                cursor: 'default',
                // Dim overlay saat choices muncul
                background: 'rgba(0, 0, 0, 0.45)',
                opacity: fadeIn ? 1 : 0,
                transition: 'opacity 0.3s ease-out'
            }}
        >
            {/* Choice Panel */}
            <div style={{
                width: '100%',
                maxWidth: '500px',
                background: isInner
                    ? 'rgba(20, 15, 35, 0.95)'
                    : 'rgba(8, 12, 28, 0.95)',
                border: isInner
                    ? '1px solid rgba(120, 100, 160, 0.3)'
                    : '1px solid rgba(100, 140, 220, 0.2)',
                borderRadius: '12px',
                padding: '24px 28px',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 12px 48px rgba(0, 0, 0, 0.6)'
            }}>
                {/* Teks Pengantar (jika ada) */}
                {fullText && (
                    <p style={{
                        fontFamily: "'Segoe UI', sans-serif",
                        fontSize: '17px',
                        fontStyle: isInner ? 'italic' : 'normal',
                        lineHeight: '1.8',
                        color: isInner ? '#c8c0dd' : '#e8ecf4',
                        margin: '0 0 20px 0',
                        whiteSpace: 'pre-wrap',
                        textAlign: 'center',
                        textShadow: '0 1px 3px rgba(0,0,0,0.6)'
                    }}>
                        {displayText}
                        {isTyping && (
                            <span style={{
                                opacity: 0.5,
                                animation: 'cursorBlink 0.8s step-end infinite',
                                color: '#6090ff'
                            }}>▎</span>
                        )}
                    </p>
                )}

                {/* Pilihan */}
                {!isTyping && choices && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        {choices.map((choice, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => handleChoiceClick(e, choice.next)}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = isMicroChoice
                                        ? 'rgba(255, 60, 60, 0.25)'
                                        : 'rgba(80, 120, 255, 0.15)';
                                    e.currentTarget.style.borderColor = isMicroChoice
                                        ? 'rgba(255, 100, 100, 0.6)'
                                        : 'rgba(120, 160, 255, 0.5)';
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = isMicroChoice
                                        ? 'rgba(200, 40, 40, 0.08)'
                                        : 'rgba(255, 255, 255, 0.04)';
                                    e.currentTarget.style.borderColor = isMicroChoice
                                        ? 'rgba(255, 70, 70, 0.35)'
                                        : 'rgba(255, 255, 255, 0.15)';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }}
                                style={{
                                    padding: '14px 20px',
                                    background: isMicroChoice
                                        ? 'rgba(200, 40, 40, 0.08)'
                                        : 'rgba(255, 255, 255, 0.04)',
                                    border: isMicroChoice
                                        ? '1px solid rgba(255, 70, 70, 0.35)'
                                        : '1px solid rgba(255, 255, 255, 0.15)',
                                    borderLeft: isMicroChoice
                                        ? '3px solid rgba(255, 80, 80, 0.6)'
                                        : '3px solid rgba(100, 150, 255, 0.4)',
                                    borderRadius: '6px',
                                    color: isMicroChoice ? '#ffaaaa' : '#d8e0f0',
                                    cursor: 'pointer',
                                    fontFamily: "'Segoe UI', sans-serif",
                                    fontSize: '16px',
                                    textAlign: 'center',
                                    transition: 'all 0.2s ease-out',
                                    outline: 'none',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                                    animation: `choiceFadeIn 0.3s ease-out ${idx * 0.1}s both`
                                }}
                            >
                                <span style={{ opacity: 0.4, marginRight: '10px', fontSize: '13px' }}>
                                    {isMicroChoice ? '◆' : '▸'}
                                </span>
                                {choice.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes cursorBlink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                @keyframes choiceFadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
