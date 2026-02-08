import React from 'react';
import type { ColorOption } from '../types';
import { isDark } from '../utils/color';

interface ColorPaletteProps {
    colors: ColorOption[];
    selectedColor: ColorOption | null;
    onSelectColor: (color: ColorOption | null) => void;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({ colors, selectedColor, onSelectColor }) => {
    return (
        <div className="color-palette-panel">
            <div className="color-palette-grid">
                {colors.map((option) => (
                    <button
                        key={option.symbol}
                        onClick={() => onSelectColor(option)}
                        className={`color-palette-btn ${selectedColor?.symbol === option.symbol ? 'selected' : ''}`}
                    >
                        <div
                            className="color-swatch"
                            style={{
                                backgroundColor: option.color,
                                color: option.textColor || (isDark(option.color) ? 'white' : 'black'),
                            }}
                        >
                            {option.symbol !== '□' && option.symbol}
                        </div>
                        <span className="color-name">{option.name}</span>
                    </button>
                ))}
            </div>
            <button
                onClick={() => onSelectColor(null)}
                className={`eraser-btn ${selectedColor === null ? 'selected' : ''}`}
            >
                Suddgummi
            </button>
        </div>
    );
};
