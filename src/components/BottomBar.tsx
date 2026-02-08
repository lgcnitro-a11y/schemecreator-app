import React from 'react';
import type { ColorOption } from '../types';

type PanelType = 'color' | 'grid' | 'file' | null;

interface BottomBarProps {
    activePanel: PanelType;
    onTogglePanel: (panel: PanelType) => void;
    selectedColor: ColorOption | null;
    zoomIn: () => void;
    zoomOut: () => void;
    resetTransform: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({
    activePanel,
    onTogglePanel,
    selectedColor,
    zoomIn,
    zoomOut,
    resetTransform
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

            <div className="bottom-bar-zoom">
                <button className="zoom-btn" onClick={zoomOut} title="Zooma ut">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </button>
                <button className="zoom-btn" onClick={resetTransform} title="Återställ zoom">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
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
