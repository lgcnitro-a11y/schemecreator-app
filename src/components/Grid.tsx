import React, { useRef } from 'react';
import type { CellData, OverlayData, OverlayTool, DrawingState, GridPoint } from '../types';
import { Cell } from './Cell';
import { OverlaySVG } from './OverlaySVG';

interface GridProps {
    cells: CellData[][];
    zoom: number;
    onCellClick: (row: number, col: number) => void;
    overlay: OverlayData;
    activeTool: OverlayTool;
    drawingState: DrawingState | null;
    hoveredPoint: GridPoint | null;
    onGridPointClick: (point: GridPoint) => void;
    onGridPointHover: (point: GridPoint | null) => void;
    onDeleteLine: (id: string) => void;
    onDeleteArrow: (id: string) => void;
    onDeleteAnnotation: (id: string) => void;
    onStrokeStart?: () => void;
}

export const Grid: React.FC<GridProps> = ({
    cells,
    onCellClick,
    overlay,
    activeTool,
    drawingState,
    hoveredPoint,
    onGridPointClick,
    onGridPointHover,
    onDeleteLine,
    onDeleteArrow,
    onDeleteAnnotation,
    onStrokeStart,
}) => {
    const isDrawing = useRef(false);

    if (!cells || cells.length === 0) return null;

    const handleMouseDown = (row: number, col: number) => {
        if (activeTool !== 'paint') return;
        isDrawing.current = true;
        onStrokeStart?.();
        onCellClick(row, col);
    };

    const handleMouseEnter = (row: number, col: number) => {
        if (activeTool !== 'paint') return;
        if (isDrawing.current) {
            onCellClick(row, col);
        }
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
    };

    const handleMouseLeave = () => {
        isDrawing.current = false;
    };

    const cellSize = 20;

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
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
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    pointerEvents: activeTool === 'paint' ? 'auto' : 'none',
                    userSelect: 'none'
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
            <OverlaySVG
                overlay={overlay}
                gridWidth={cells[0].length}
                gridHeight={cells.length}
                cellSize={cellSize}
                activeTool={activeTool}
                drawingState={drawingState}
                hoveredPoint={hoveredPoint}
                onGridPointClick={onGridPointClick}
                onGridPointHover={onGridPointHover}
                onDeleteLine={onDeleteLine}
                onDeleteArrow={onDeleteArrow}
                onDeleteAnnotation={onDeleteAnnotation}
            />
        </div>
    );
};
