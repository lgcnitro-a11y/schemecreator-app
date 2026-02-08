import React from 'react';
import type { ArrowDirection } from '../types';

interface ArrowDirectionPickerProps {
    position: { x: number; y: number };
    onSelect: (direction: ArrowDirection) => void;
    onCancel: () => void;
}

const directions: { dir: ArrowDirection; label: string; gridArea: string; rotation: number }[] = [
    { dir: 'up-left', label: '↖', gridArea: '1/1', rotation: -135 },
    { dir: 'up', label: '↑', gridArea: '1/2', rotation: -90 },
    { dir: 'up-right', label: '↗', gridArea: '1/3', rotation: -45 },
    { dir: 'left', label: '←', gridArea: '2/1', rotation: 180 },
    { dir: 'right', label: '→', gridArea: '2/3', rotation: 0 },
    { dir: 'down-left', label: '↙', gridArea: '3/1', rotation: 135 },
    { dir: 'down', label: '↓', gridArea: '3/2', rotation: 90 },
    { dir: 'down-right', label: '↘', gridArea: '3/3', rotation: 45 },
];

export const ArrowDirectionPicker: React.FC<ArrowDirectionPickerProps> = ({
    position,
    onSelect,
    onCancel,
}) => {
    return (
        <>
            <div className="arrow-picker-overlay" onClick={onCancel} />
            <div
                className="arrow-picker"
                style={{
                    left: position.x,
                    top: position.y,
                }}
            >
                <div className="arrow-picker-grid">
                    {directions.map(({ dir, label, gridArea }) => (
                        <button
                            key={dir}
                            className="arrow-dir-btn"
                            style={{ gridArea }}
                            onClick={() => onSelect(dir)}
                            title={dir}
                        >
                            {label}
                        </button>
                    ))}
                    <button
                        className="arrow-dir-btn cancel"
                        style={{ gridArea: '2/2' }}
                        onClick={onCancel}
                        title="Avbryt"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </>
    );
};
