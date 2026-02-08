import type { GridPoint } from '../types';

export function snapToGrid(
    mouseX: number,
    mouseY: number,
    cellSize: number,
    gridW: number,
    gridH: number
): GridPoint {
    const x = Math.round(mouseX / cellSize);
    const y = Math.round(mouseY / cellSize);
    return {
        x: Math.max(0, Math.min(gridW, x)),
        y: Math.max(0, Math.min(gridH, y)),
    };
}

export function isAdjacentPoint(a: GridPoint, b: GridPoint): boolean {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return dx <= 1 && dy <= 1 && (dx + dy > 0);
}

export function gridPointsEqual(a: GridPoint, b: GridPoint): boolean {
    return a.x === b.x && a.y === b.y;
}

export function directionToAngle(direction: string): number {
    const angles: Record<string, number> = {
        'right': 0,
        'down-right': Math.PI / 4,
        'down': Math.PI / 2,
        'down-left': (3 * Math.PI) / 4,
        'left': Math.PI,
        'up-left': -(3 * Math.PI) / 4,
        'up': -Math.PI / 2,
        'up-right': -Math.PI / 4,
    };
    return angles[direction] ?? 0;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const clean = hex.replace('#', '');
    return {
        r: parseInt(clean.substr(0, 2), 16),
        g: parseInt(clean.substr(2, 2), 16),
        b: parseInt(clean.substr(4, 2), 16),
    };
}
