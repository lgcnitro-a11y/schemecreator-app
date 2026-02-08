import React from 'react';

interface ToolbarProps {
    gridSize: number;
    onGridSizeChange: (size: number) => void;
    onSave: () => void;
    onLoad: () => void;
    onExport: () => void;
    onClear: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetTransform: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
    gridSize,
    onGridSizeChange,
    onSave,
    onLoad,
    onExport,
    onClear,
    zoomIn,
    zoomOut,
    resetTransform
}) => {
    return (
        <div className="card flex-col">
            <span className="label">Inställningar</span>

            <div className="flex-col">
                <span className="label">Rutnätsstorlek</span>
                <select
                    value={gridSize}
                    onChange={(e) => onGridSizeChange(Number(e.target.value))}
                >
                    <option value={20}>20 x 20</option>
                    <option value={30}>30 x 30</option>
                    <option value={40}>40 x 40</option>
                    <option value={50}>50 x 50</option>
                    <option value={60}>60 x 60</option>
                    <option value={80}>80 x 80</option>
                    <option value={100}>100 x 100</option>
                </select>
            </div>

            <div className="flex-col" style={{ marginTop: '1rem' }}>
                <span className="label">Zoom</span>
                <div className="flex-row">
                    <button onClick={() => zoomOut()} style={{ flex: 1 }}>-</button>
                    <button onClick={() => resetTransform()} style={{ flex: 1 }}>100%</button>
                    <button onClick={() => zoomIn()} style={{ flex: 1 }}>+</button>
                </div>
            </div>

            <div className="flex-col" style={{ marginTop: '1rem' }}>
                <span className="label">Mönster</span>
                <button onClick={onSave}>💾 Spara JSON</button>
                <button onClick={onLoad}>📂 Ladda JSON</button>
                <button onClick={onExport} style={{ backgroundColor: '#e6f7ff', borderColor: '#1890ff', color: '#0050b3' }}>
                    📄 Exportera PDF
                </button>
                <button onClick={onClear} style={{ marginTop: '0.5rem', borderColor: '#ff4d4f', color: '#ff4d4f' }}>
                    ❌ Rensa Allt
                </button>
            </div>
        </div>
    );
};
