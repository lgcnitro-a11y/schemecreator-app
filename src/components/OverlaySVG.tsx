import React, { useCallback, useRef, useState } from 'react';
import type { OverlayData, OverlayTool, DrawingState, GridPoint, ArrowMarker } from '../types';
import { snapToGrid, directionToAngle } from '../utils/grid';

interface OverlaySVGProps {
    overlay: OverlayData;
    gridWidth: number;
    gridHeight: number;
    cellSize: number;
    activeTool: OverlayTool;
    drawingState: DrawingState | null;
    hoveredPoint: GridPoint | null;
    onGridPointClick: (point: GridPoint) => void;
    onGridPointHover: (point: GridPoint | null) => void;
    onDeleteLine: (id: string) => void;
    onDeleteArrow: (id: string) => void;
    onDeleteAnnotation: (id: string) => void;
}

function renderArrow(arrow: ArrowMarker, cellSize: number) {
    const px = arrow.position.x * cellSize;
    const py = arrow.position.y * cellSize;
    const angle = directionToAngle(arrow.direction);
    const size = cellSize * 0.4;

    const tipX = px + Math.cos(angle) * size;
    const tipY = py + Math.sin(angle) * size;
    const leftX = px + Math.cos(angle + 2.5) * size * 0.5;
    const leftY = py + Math.sin(angle + 2.5) * size * 0.5;
    const rightX = px + Math.cos(angle - 2.5) * size * 0.5;
    const rightY = py + Math.sin(angle - 2.5) * size * 0.5;

    return (
        <polygon
            key={arrow.id}
            points={`${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`}
            fill={arrow.color}
            stroke={arrow.color}
            strokeWidth={1}
            strokeLinejoin="round"
            style={{ cursor: 'pointer' }}
            data-type="arrow"
            data-id={arrow.id}
        />
    );
}

export const OverlaySVG: React.FC<OverlaySVGProps> = ({
    overlay,
    gridWidth,
    gridHeight,
    cellSize,
    activeTool,
    drawingState,
    hoveredPoint,
    onGridPointClick,
    onGridPointHover,
    onDeleteLine,
    onDeleteArrow,
    onDeleteAnnotation,
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [nearestPoint, setNearestPoint] = useState<GridPoint | null>(null);

    const isOverlayTool = activeTool !== 'paint';

    const getSVGPoint = useCallback((e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
        if (!svgRef.current) return null;
        const rect = svgRef.current.getBoundingClientRect();
        const svgWidth = gridWidth * cellSize;
        const svgHeight = gridHeight * cellSize;
        let clientX: number, clientY: number;

        if ('touches' in e) {
            if (e.touches.length === 0) return null;
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const scaleX = svgWidth / rect.width;
        const scaleY = svgHeight / rect.height;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    }, [gridWidth, gridHeight, cellSize]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isOverlayTool) return;
        const pt = getSVGPoint(e);
        if (!pt) return;
        const snapped = snapToGrid(pt.x, pt.y, cellSize, gridWidth, gridHeight);
        setNearestPoint(snapped);
        onGridPointHover(snapped);
    }, [isOverlayTool, getSVGPoint, cellSize, gridWidth, gridHeight, onGridPointHover]);

    const handleMouseLeave = useCallback(() => {
        setNearestPoint(null);
        onGridPointHover(null);
    }, [onGridPointHover]);

    const handleClick = useCallback((e: React.MouseEvent) => {
        if (!isOverlayTool) return;

        const target = e.target as SVGElement;
        const type = target.getAttribute('data-type');
        const id = target.getAttribute('data-id');

        if (activeTool === 'eraser-overlay' && type && id) {
            if (type === 'line') onDeleteLine(id);
            else if (type === 'arrow') onDeleteArrow(id);
            else if (type === 'annotation') onDeleteAnnotation(id);
            return;
        }

        const pt = getSVGPoint(e);
        if (!pt) return;
        const snapped = snapToGrid(pt.x, pt.y, cellSize, gridWidth, gridHeight);
        onGridPointClick(snapped);
    }, [isOverlayTool, activeTool, getSVGPoint, cellSize, gridWidth, gridHeight, onGridPointClick, onDeleteLine, onDeleteArrow, onDeleteAnnotation]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (!isOverlayTool) return;
        e.preventDefault();
        if (e.changedTouches.length === 0) return;

        const touch = e.changedTouches[0];
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const svgWidth = gridWidth * cellSize;
        const svgHeight = gridHeight * cellSize;
        const scaleX = svgWidth / rect.width;
        const scaleY = svgHeight / rect.height;
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;

        const snapped = snapToGrid(x, y, cellSize, gridWidth, gridHeight);
        onGridPointClick(snapped);
    }, [isOverlayTool, gridWidth, gridHeight, cellSize, onGridPointClick]);

    const svgWidth = gridWidth * cellSize;
    const svgHeight = gridHeight * cellSize;

    return (
        <svg
            ref={svgRef}
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: isOverlayTool ? 'auto' : 'none',
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            onTouchEnd={handleTouchEnd}
        >
            {/* Backstitch lines */}
            {overlay.backstitchLines.map(line => (
                <line
                    key={line.id}
                    x1={line.start.x * cellSize}
                    y1={line.start.y * cellSize}
                    x2={line.end.x * cellSize}
                    y2={line.end.y * cellSize}
                    stroke={line.color}
                    strokeWidth={line.lineWidth}
                    strokeLinecap="round"
                    style={{ cursor: activeTool === 'eraser-overlay' ? 'pointer' : 'default' }}
                    data-type="line"
                    data-id={line.id}
                />
            ))}

            {/* Arrows */}
            {overlay.arrows.map(arrow => renderArrow(arrow, cellSize))}

            {/* Text annotations */}
            {overlay.annotations.map(ann => (
                <text
                    key={ann.id}
                    x={ann.position.x * cellSize}
                    y={ann.position.y * cellSize}
                    fontSize={ann.fontSize * cellSize}
                    fill={ann.color}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontWeight="bold"
                    style={{
                        cursor: activeTool === 'eraser-overlay' ? 'pointer' : 'default',
                        userSelect: 'none',
                    }}
                    data-type="annotation"
                    data-id={ann.id}
                >
                    {ann.text}
                </text>
            ))}

            {/* Preview line while drawing backstitch */}
            {drawingState?.startPoint && drawingState.previewEndPoint && (
                <line
                    x1={drawingState.startPoint.x * cellSize}
                    y1={drawingState.startPoint.y * cellSize}
                    x2={drawingState.previewEndPoint.x * cellSize}
                    y2={drawingState.previewEndPoint.y * cellSize}
                    stroke="#000"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeDasharray="4 3"
                    opacity={0.6}
                    pointerEvents="none"
                />
            )}

            {/* Start point indicator */}
            {drawingState?.startPoint && (
                <circle
                    cx={drawingState.startPoint.x * cellSize}
                    cy={drawingState.startPoint.y * cellSize}
                    r={5}
                    fill="#4f46e5"
                    stroke="#fff"
                    strokeWidth={2}
                    pointerEvents="none"
                    className="pulse-dot"
                />
            )}

            {/* Snap point indicator near cursor */}
            {isOverlayTool && nearestPoint && (
                <circle
                    cx={nearestPoint.x * cellSize}
                    cy={nearestPoint.y * cellSize}
                    r={4}
                    fill="rgba(79, 70, 229, 0.5)"
                    stroke="#4f46e5"
                    strokeWidth={1.5}
                    pointerEvents="none"
                />
            )}

            {/* Snap grid dots (visible when overlay tool active) */}
            {isOverlayTool && hoveredPoint && renderSnapDots(
                hoveredPoint, gridWidth, gridHeight, cellSize
            )}
        </svg>
    );
};

function renderSnapDots(
    center: GridPoint,
    gridWidth: number,
    gridHeight: number,
    cellSize: number
) {
    const dots: React.ReactNode[] = [];
    const range = 3;
    for (let y = Math.max(0, center.y - range); y <= Math.min(gridHeight, center.y + range); y++) {
        for (let x = Math.max(0, center.x - range); x <= Math.min(gridWidth, center.x + range); x++) {
            if (x === center.x && y === center.y) continue;
            dots.push(
                <circle
                    key={`snap-${x}-${y}`}
                    cx={x * cellSize}
                    cy={y * cellSize}
                    r={2}
                    fill="rgba(79, 70, 229, 0.25)"
                    pointerEvents="none"
                />
            );
        }
    }
    return dots;
}
