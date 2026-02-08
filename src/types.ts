export interface CellData {
    color: string | null;
    symbol: string | null;
}

export interface Pattern {
    name: string;
    width: number;
    height: number;
    cells: CellData[][];
    createdAt: string;
}

export interface ColorOption {
    color: string;
    symbol: string;
    name: string;
    textColor?: string; // Optional text color for better contrast
}
