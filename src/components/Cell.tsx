import React from 'react';
import type { CellData } from '../types';
import { isDark } from '../utils/color';

interface CellProps {
    data: CellData;
    size: number;
    onClick: () => void;
    onMouseEnter: () => void;
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
