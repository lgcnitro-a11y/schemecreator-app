import React from 'react';
import type { OverlayTool } from '../types';

interface ToolsPanelProps {
    activeTool: OverlayTool;
    onSelectTool: (tool: OverlayTool) => void;
    lineColor: string;
    onLineColorChange: (color: string) => void;
    lineWidth: number;
    onLineWidthChange: (width: number) => void;
}

const LINE_COLORS = ['#000000', '#ff0000', '#4169e1', '#228b22', '#8b4513', '#555555', '#ff69b4'];

const tools: { tool: OverlayTool; label: string; icon: React.ReactNode }[] = [
    {
        tool: 'paint',
        label: 'Måla',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" />
                <circle cx="11" cy="11" r="2" />
            </svg>
        ),
    },
    {
        tool: 'backstitch',
        label: 'Stygnlinje',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="4" y1="20" x2="20" y2="4" />
                <circle cx="4" cy="20" r="2" fill="currentColor" />
                <circle cx="20" cy="4" r="2" fill="currentColor" />
            </svg>
        ),
    },
    {
        tool: 'arrow',
        label: 'Pil',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
            </svg>
        ),
    },
    {
        tool: 'text',
        label: 'Text',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="4 7 4 4 20 4 20 7" />
                <line x1="9.5" y1="20" x2="14.5" y2="20" />
                <line x1="12" y1="4" x2="12" y2="20" />
            </svg>
        ),
    },
    {
        tool: 'eraser-overlay',
        label: 'Radera',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 20H7L3 16 13 6l8 8-4 4" />
                <line x1="6" y1="20" x2="20" y2="20" />
            </svg>
        ),
    },
];

export const ToolsPanel: React.FC<ToolsPanelProps> = ({
    activeTool,
    onSelectTool,
    lineColor,
    onLineColorChange,
    lineWidth,
    onLineWidthChange,
}) => {
    return (
        <div className="tools-panel">
            <div className="tools-grid">
                {tools.map(({ tool, label, icon }) => (
                    <button
                        key={tool}
                        className={`tool-btn ${activeTool === tool ? 'selected' : ''}`}
                        onClick={() => onSelectTool(tool)}
                    >
                        <span className="tool-icon">{icon}</span>
                        <span className="tool-label">{label}</span>
                    </button>
                ))}
            </div>

            {activeTool !== 'paint' && activeTool !== 'eraser-overlay' && (
                <>
                    <div className="panel-section">
                        <label className="panel-label">Linjefärg</label>
                        <div className="line-color-options">
                            {LINE_COLORS.map(color => (
                                <button
                                    key={color}
                                    className={`line-color-btn ${lineColor === color ? 'selected' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => onLineColorChange(color)}
                                />
                            ))}
                        </div>
                    </div>

                    {activeTool === 'backstitch' && (
                        <div className="panel-section">
                            <label className="panel-label">Linjebredd</label>
                            <div className="line-width-options">
                                {[2, 3, 4].map(w => (
                                    <button
                                        key={w}
                                        className={`line-width-btn ${lineWidth === w ? 'selected' : ''}`}
                                        onClick={() => onLineWidthChange(w)}
                                    >
                                        <div style={{
                                            width: '24px',
                                            height: `${w}px`,
                                            backgroundColor: '#333',
                                            borderRadius: w / 2,
                                        }} />
                                        <span>{w === 2 ? 'Tunn' : w === 3 ? 'Medium' : 'Tjock'}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
