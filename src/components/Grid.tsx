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

    const colIndices = Array.from({ length: cells[0].length }, (_, i) => i + 1);
    const rowIndices = Array.from({ length: cells.length }, (_, i) => i + 1);

    return (
        <div style={{ display: 'inline-block', padding: '20px' }}>
            <div style={{ display: 'flex' }}>
                {/* Top Headers */}
                <div style={{ width: '30px', flexShrink: 0 }}></div>
                <div style={{ display: 'flex' }}>
                    {colIndices.map(i => (
                        <div key={`col-${i}`} style={{
                            width: `${cellSize}px`,
                            textAlign: 'center',
                            fontSize: '10px',
                            color: '#666',
                            paddingBottom: '2px',
                            fontWeight: i % 10 === 0 ? 'bold' : 'normal',
                            userSelect: 'none'
                        }}>
                            {i}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex' }}>
                {/* Left Headers */}
                <div style={{
                    width: '30px',
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0,
                    paddingRight: '5px'
                }}>
                    {rowIndices.map(i => (
                        <div key={`row-${i}`} style={{
                            height: `${cellSize}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            fontSize: '10px',
                            color: '#666',
                            fontWeight: i % 10 === 0 ? 'bold' : 'normal',
                            userSelect: 'none'
                        }}>
                            {i}
                        </div>
                    ))}
                </div>

                {/* Main Grid Content */}
                <div style={{ position: 'relative' }}>
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
            </div>
        </div>
    );
};
