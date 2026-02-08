import React from 'react';
import type { ColorOption, OverlayTool } from '../types';

type PanelType = 'color' | 'grid' | 'file' | 'tools' | null;

interface BottomBarProps {
    activePanel: PanelType;
    onTogglePanel: (panel: PanelType) => void;
    selectedColor: ColorOption | null;
    activeTool: OverlayTool;
    zoomIn: () => void;
    zoomOut: () => void;
    resetTransform: () => void;
    onUndo?: () => void;
    canUndo?: boolean;
}

const toolIcons: Record<OverlayTool, React.ReactNode> = {
    paint: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        </svg>
    ),
    backstitch: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="4" y1="20" x2="20" y2="4" />
            <circle cx="4" cy="20" r="2" fill="currentColor" />
            <circle cx="20" cy="4" r="2" fill="currentColor" />
        </svg>
    ),
    arrow: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    ),
    text: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="9.5" y1="20" x2="14.5" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
    ),
    'eraser-overlay': (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 20H7L3 16 13 6l8 8-4 4" />
            <line x1="6" y1="20" x2="20" y2="20" />
        </svg>
    ),
};

export const BottomBar: React.FC<BottomBarProps> = ({
    activePanel,
    onTogglePanel,
    selectedColor,
    activeTool,
    zoomIn,
    zoomOut,
    // resetTransform,
    onUndo,
    canUndo
}) => {
    return (
        <div className="bottom-bar">
            <button
                className={`bottom-bar-btn ${activePanel === 'color' ? 'active' : ''}`}
                onClick={() => onTogglePanel('color')}
                title="Färgval"
            >
                <div className="bottom-bar-icon">
                    <div
                        className="color-indicator"
                        style={{
                            backgroundColor: selectedColor?.color || 'transparent',
                            border: selectedColor ? '2px solid #fff' : '2px dashed #999',
                        }}
                    >
                        {selectedColor ? '' : '✕'}
                    </div>
                </div>
                <span className="bottom-bar-label">Färg</span>
            </button>

            <button
                className={`bottom-bar-btn ${activePanel === 'tools' ? 'active' : ''}`}
                onClick={() => onTogglePanel('tools')}
                title="Verktyg"
            >
                <div className="bottom-bar-icon">
                    {toolIcons[activeTool]}
                </div>
                <span className="bottom-bar-label">Verktyg</span>
            </button>

            <div className="bottom-bar-zoom">
                <button className="zoom-btn" onClick={zoomOut} title="Zooma ut">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </button>
                <button
                    className="zoom-btn"
                    onClick={onUndo}
                    title="Ångra"
                    disabled={!canUndo}
                    style={{ opacity: canUndo ? 1 : 0.5, cursor: canUndo ? 'pointer' : 'default' }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 14L4 9l5-5" />
                        <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
                    </svg>
                </button>
                <button className="zoom-btn" onClick={zoomIn} title="Zooma in">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </button>
            </div>

            <button
                className={`bottom-bar-btn ${activePanel === 'grid' ? 'active' : ''}`}
                onClick={() => onTogglePanel('grid')}
                title="Rutnät"
            >
                <div className="bottom-bar-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                    </svg>
                </div>
                <span className="bottom-bar-label">Rutnät</span>
            </button>

            <button
                className={`bottom-bar-btn ${activePanel === 'file' ? 'active' : ''}`}
                onClick={() => onTogglePanel('file')}
                title="Arkiv"
            >
                <div className="bottom-bar-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                    </svg>
                </div>
                <span className="bottom-bar-label">Arkiv</span>
            </button>
        </div>
    );
};
