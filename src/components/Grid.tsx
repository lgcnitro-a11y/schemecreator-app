import React, { useRef } from 'react';
import type { CellData } from '../types';
import { Cell } from './Cell';

interface GridProps {
    cells: CellData[][];
    zoom: number; // Controlled by wrapper, but maybe we need scale for internal rendering logic? 
    // Actually transform is handled by parent, so Grid just renders full size.
    onCellClick: (row: number, col: number) => void;
}

export const Grid: React.FC<GridProps> = ({ cells, onCellClick }) => {
    const isDrawing = useRef(false);

    // We handle mouse down/up/enter to allow "painting" by dragging
    const handleMouseDown = (row: number, col: number) => {
        isDrawing.current = true;
        onCellClick(row, col);
    };

    const handleMouseEnter = (row: number, col: number) => {
        if (isDrawing.current) {
            onCellClick(row, col);
        }
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
    };

    // Also handle mouse leave on the grid to stop drawing
    const handleMouseLeave = () => {
        isDrawing.current = false;
    };

    const cellSize = 20; // Base cell size in pixels

    return (
        <div
            className="grid-container"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cells[0].length}, ${cellSize}px)`,
                borderTop: '1px solid #ccc',
                borderLeft: '1px solid #ccc',
                backgroundColor: 'white',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)'
            }}
        >
            {cells.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                    {row.map((cell, colIndex) => (
                        <Cell
                            key={`${rowIndex}-${colIndex}`}
                            data={cell}
                            size={cellSize}
                            onClick={() => handleMouseDown(rowIndex, colIndex)}
                            onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                        />
                    ))}
                </React.Fragment>
            ))}
        </div>
    );
};
