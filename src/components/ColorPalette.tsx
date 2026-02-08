import React from 'react';
import type { ColorOption } from '../types';

interface ColorPaletteProps {
    colors: ColorOption[];
    selectedColor: ColorOption | null; // null means eraser
    onSelectColor: (color: ColorOption | null) => void;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({ colors, selectedColor, onSelectColor }) => {
    return (
        <div className="card flex-col">
            <span className="label">Färgpalett</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {colors.map((option) => (
                    <button
                        key={option.symbol}
                        onClick={() => onSelectColor(option)}
                        style={{
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: selectedColor?.symbol === option.symbol ? '#e0e0ff' : 'white',
                            border: selectedColor?.symbol === option.symbol ? '2px solid #646cff' : '1px solid #ddd',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            justifyContent: 'flex-start'
                        }}
                    >
                        <div
                            style={{
                                width: '24px',
                                height: '24px',
                                backgroundColor: option.color,
                                border: '1px solid #ccc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                color: option.textColor || (isDark(option.color) ? 'white' : 'black'),
                                borderRadius: '4px'
                            }}
                        >
                            {option.symbol !== '□' && option.symbol}
                        </div>
                        <span style={{ fontSize: '0.9rem' }}>{option.name}</span>
                    </button>
                ))}
            </div>

            <div style={{ marginTop: '0.5rem', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                <button
                    onClick={() => onSelectColor(null)}
                    style={{
                        width: '100%',
                        backgroundColor: selectedColor === null ? '#ffe0e0' : 'white',
                        border: selectedColor === null ? '2px solid #ff4d4f' : '1px solid #ddd',
                        color: '#333'
                    }}
                >
                    🗑️ Suddgummi
                </button>
            </div>
        </div>
    );
};

// Helper (duplicated from Cell.tsx, could be moved to utils but simple enough here)
function isDark(color: string): boolean {
    if (color === 'transparent') return false;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    if (isNaN(r)) return false;
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq < 128;
}
