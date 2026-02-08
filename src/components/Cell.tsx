import React from 'react';
import type { CellData } from '../types';

interface CellProps {
    data: CellData;
    size: number;
    onClick: () => void;
    onMouseEnter: (e: React.MouseEvent) => void;
}

export const Cell: React.FC<CellProps> = React.memo(({ data, size, onClick, onMouseEnter }) => {
    return (
        <div
            style={{
                width: size,
                height: size,
                backgroundColor: data.color || 'white',
                borderRight: '1px solid #ddd',
                borderBottom: '1px solid #ddd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: `${size * 0.6}px`,
                color: data.color && isDark(data.color) ? 'white' : 'black',
                userSelect: 'none',
                boxSizing: 'border-box'
            }}
            onMouseDown={onClick}
            onMouseEnter={onMouseEnter}
        >
            {data.symbol}
        </div>
    );
});

// Helper to determine text color based on background
function isDark(color: string): boolean {
    // Simple heuristic for hex codes
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    if (isNaN(r)) return false; // Fallback for named colors if any
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq < 128;
}
