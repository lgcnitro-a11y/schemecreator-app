export interface CellData {
    color: string | null;
    symbol: string | null;
}

export interface GridPoint {
    x: number; // column intersection (0 to pattern.width)
    y: number; // row intersection (0 to pattern.height)
}

export interface BackstitchLine {
    id: string;
    start: GridPoint;
    end: GridPoint;
    color: string;
    lineWidth: number;
}

export type ArrowDirection = 'up' | 'down' | 'left' | 'right' |
    'up-left' | 'up-right' | 'down-left' | 'down-right';

export interface ArrowMarker {
    id: string;
    position: GridPoint;
    direction: ArrowDirection;
    color: string;
}

export interface TextAnnotation {
    id: string;
    position: GridPoint;
    text: string;
    fontSize: number;
    color: string;
}

export interface OverlayData {
    backstitchLines: BackstitchLine[];
    arrows: ArrowMarker[];
    annotations: TextAnnotation[];
}

export type OverlayTool = 'paint' | 'backstitch' | 'arrow' | 'text' | 'eraser-overlay';

export interface DrawingState {
    startPoint: GridPoint | null;
    previewEndPoint: GridPoint | null;
}

export interface Pattern {
    name: string;
    width: number;
    height: number;
    cells: CellData[][];
    overlay?: OverlayData;
    createdAt: string;
}

export interface ColorOption {
    color: string;
    symbol: string;
    name: string;
    textColor?: string;
}
