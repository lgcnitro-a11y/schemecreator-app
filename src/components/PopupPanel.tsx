import React from 'react';

interface PopupPanelProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export const PopupPanel: React.FC<PopupPanelProps> = ({ title, onClose, children }) => {
    return (
        <>
            <div className="popup-overlay" onClick={onClose} />
            <div className="popup-panel">
                <div className="popup-header">
                    <span className="popup-title">{title}</span>
                    <button className="popup-close" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <div className="popup-content">
                    {children}
                </div>
            </div>
        </>
    );
};
