import { useState, useRef, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Grid } from './components/Grid';
import { BottomBar } from './components/BottomBar';
import { Toolbar } from './components/Toolbar';
import { PopupPanel } from './components/PopupPanel';
import { ColorPalette } from './components/ColorPalette';
import { ToolsPanel } from './components/ToolsPanel';
import { ArrowDirectionPicker } from './components/ArrowDirectionPicker';
import type {
  CellData, ColorOption, Pattern, OverlayData, OverlayTool,
  DrawingState, GridPoint, ArrowDirection, BackstitchLine, ArrowMarker, TextAnnotation
} from './types';
import { savePattern, loadPattern } from './utils/storage';
import { exportToPDF } from './utils/pdfExport';
import { isAdjacentPoint } from './utils/grid';

// @ts-ignore
import { useRegisterSW } from 'virtual:pwa-register/react';

const PALETTE: ColorOption[] = [
  { symbol: 'H', color: '#555555', name: 'Mörkgrå' },
  { symbol: 'V', color: '#aaaaaa', name: 'Ljusgrå' },
  { symbol: 'U', color: '#4169e1', name: 'Blå' },
  { symbol: 'K', color: '#ff0000', name: 'Röd' },
  { symbol: 'I', color: '#228b22', name: 'Grön' },
  { symbol: 'X', color: '#000000', name: 'Svart' },
  { symbol: 'O', color: '#ffd700', name: 'Gul', textColor: 'black' },
  { symbol: '+', color: '#ff69b4', name: 'Rosa' },
  { symbol: '▪', color: '#8b4513', name: 'Brun' },
  { symbol: '□', color: '#ffffff', name: 'Vit' },
];

const emptyOverlay: OverlayData = {
  backstitchLines: [],
  arrows: [],
  annotations: [],
};

type PanelType = 'color' | 'grid' | 'file' | 'tools' | null;

function App() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error);
    },
  });

  const createGrid = (size: number) => {
    const newCells: CellData[][] = [];
    for (let r = 0; r < size; r++) {
      const row: CellData[] = [];
      for (let c = 0; c < size; c++) {
        row.push({ color: null, symbol: null });
      }
      newCells.push(row);
    }
    return newCells;
  };

  const [gridSize, setGridSize] = useState<number>(40);
  const [cells, setCells] = useState<CellData[][]>(() => createGrid(40));
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(PALETTE[5]);
  const [patternName, setPatternName] = useState('Mitt Mönster');
  const [activePanel, setActivePanel] = useState<PanelType>(null);

  // Overlay state
  const [overlay, setOverlay] = useState<OverlayData>({ ...emptyOverlay });
  const [activeTool, setActiveTool] = useState<OverlayTool>('paint');
  const [drawingState, setDrawingState] = useState<DrawingState | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<GridPoint | null>(null);
  const [lineColor, setLineColor] = useState<string>('#000000');
  const [lineWidth, setLineWidth] = useState<number>(3);

  // Arrow direction picker state
  const [arrowPickerState, setArrowPickerState] = useState<{
    point: GridPoint;
    screenPos: { x: number; y: number };
  } | null>(null);

  // Text input state
  const [textInputState, setTextInputState] = useState<{
    point: GridPoint;
    text: string;
  } | null>(null);

  /* History State */
  const [history, setHistory] = useState<{ cells: CellData[][], overlay: OverlayData }[]>([]);

  const addToHistory = () => {
    setHistory(prev => [...prev, { cells: JSON.parse(JSON.stringify(cells)), overlay: JSON.parse(JSON.stringify(overlay)) }]);
  };

  const handleUndo = () => {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      const newHistory = [...prev];
      const previousState = newHistory.pop();
      if (previousState) {
        setCells(previousState.cells);
        setOverlay(previousState.overlay);
      }
      return newHistory;
    });
  };

  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);

  const initializeGrid = (size: number) => {
    setCells(createGrid(size));
  };

  const handleCellClick = useCallback((row: number, col: number) => {
    // Note: History is handled via onStrokeStart for painting
    setCells(prev => {
      const newCells = [...prev];
      const newRow = [...newCells[row]];
      if (selectedColor) {
        newRow[col] = { color: selectedColor.color, symbol: selectedColor.symbol };
      } else {
        newRow[col] = { color: null, symbol: null };
      }
      newCells[row] = newRow;
      return newCells;
    });
  }, [selectedColor]);

  // Overlay callbacks
  const handleGridPointClick = useCallback((point: GridPoint) => {
    if (activeTool === 'backstitch') {
      setDrawingState(prev => {
        if (!prev || !prev.startPoint) {
          return { startPoint: point, previewEndPoint: null };
        }
        // Second click - create line if adjacent
        if (isAdjacentPoint(prev.startPoint, point)) {
          addToHistory(); // Save before adding line
          const newLine: BackstitchLine = {
            id: crypto.randomUUID(),
            start: prev.startPoint,
            end: point,
            color: lineColor,
            lineWidth: lineWidth,
          };
          setOverlay(o => ({
            ...o,
            backstitchLines: [...o.backstitchLines, newLine],
          }));
        }
        return { startPoint: null, previewEndPoint: null };
      });
    } else if (activeTool === 'arrow') {
      // Show direction picker at this point
      // Calculate screen position for the picker
      setArrowPickerState({
        point,
        screenPos: { x: window.innerWidth / 2, y: window.innerHeight / 2 - 80 },
      });
    } else if (activeTool === 'text') {
      setTextInputState({ point, text: '' });
    } else if (activeTool === 'eraser-overlay') {
      // Eraser handled in OverlaySVG click handler
    }
  }, [activeTool, lineColor, lineWidth, cells, overlay]); // Added cells/overlay dependency for history

  const handleGridPointHover = useCallback((point: GridPoint | null) => {
    setHoveredPoint(point);
    if (activeTool === 'backstitch' && point) {
      setDrawingState(prev => {
        if (prev?.startPoint) {
          return { ...prev, previewEndPoint: point };
        }
        return prev;
      });
    }
  }, [activeTool]);

  const handleDeleteLine = useCallback((id: string) => {
    addToHistory();
    setOverlay(o => ({ ...o, backstitchLines: o.backstitchLines.filter(l => l.id !== id) }));
  }, [cells, overlay]);

  const handleDeleteArrow = useCallback((id: string) => {
    addToHistory();
    setOverlay(o => ({ ...o, arrows: o.arrows.filter(a => a.id !== id) }));
  }, [cells, overlay]);

  const handleDeleteAnnotation = useCallback((id: string) => {
    addToHistory();
    setOverlay(o => ({ ...o, annotations: o.annotations.filter(a => a.id !== id) }));
  }, [cells, overlay]);

  const handleArrowDirection = useCallback((direction: ArrowDirection) => {
    if (!arrowPickerState) return;
    addToHistory();
    const newArrow: ArrowMarker = {
      id: crypto.randomUUID(),
      position: arrowPickerState.point,
      direction,
      color: lineColor,
    };
    setOverlay(o => ({ ...o, arrows: [...o.arrows, newArrow] }));
    setArrowPickerState(null);
  }, [arrowPickerState, lineColor, cells, overlay]);

  const handleTextSubmit = useCallback(() => {
    if (!textInputState || !textInputState.text.trim()) {
      setTextInputState(null);
      return;
    }
    addToHistory();
    const newAnnotation: TextAnnotation = {
      id: crypto.randomUUID(),
      position: textInputState.point,
      text: textInputState.text.trim(),
      fontSize: 0.8,
      color: lineColor,
    };
    setOverlay(o => ({ ...o, annotations: [...o.annotations, newAnnotation] }));
    setTextInputState(null);
  }, [textInputState, lineColor, cells, overlay]);

  const handleSelectTool = useCallback((tool: OverlayTool) => {
    setActiveTool(tool);
    setDrawingState(null);
    setArrowPickerState(null);
    setTextInputState(null);
    setActivePanel(null);
  }, []);

  const handleGridSizeChange = (newSize: number) => {
    if (window.confirm('Att byta storlek kommer att rensa nuvarande mönster. Vill du fortsätta?')) {
      // No history for size change as it clears everything
      setHistory([]);
      setGridSize(newSize);
      initializeGrid(newSize);
      setOverlay({ ...emptyOverlay });
    }
  };

  const handleSave = () => {
    const pattern: Pattern = {
      name: patternName,
      width: gridSize,
      height: gridSize,
      cells: cells,
      overlay: overlay,
      createdAt: new Date().toISOString()
    };
    savePattern(pattern);
  };

  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const pattern = await loadPattern(file);
          setPatternName(pattern.name);
          setGridSize(pattern.width);
          setCells(pattern.cells);
          setOverlay(pattern.overlay || { ...emptyOverlay });
          transformComponentRef.current?.resetTransform();
          setActivePanel(null);
        } catch (err) {
          alert('Kunde inte ladda filen: ' + err);
        }
      }
    };
    input.click();
  };

  const handleExport = () => {
    const pattern: Pattern = {
      name: patternName,
      width: gridSize,
      height: gridSize,
      cells: cells,
      overlay: overlay,
      createdAt: new Date().toISOString()
    };
    exportToPDF(pattern, PALETTE);
  };

  const handleClear = () => {
    if (window.confirm('Är du säker på att du vill rensa allt?')) {
      initializeGrid(gridSize);
      setOverlay({ ...emptyOverlay });
    }
  };

  const togglePanel = (panel: PanelType) => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  const handleSelectColor = (color: ColorOption | null) => {
    setSelectedColor(color);
    setActiveTool('paint');
    setActivePanel(null);
  };

  const gridSizes = [20, 30, 40, 50, 60, 80, 100];

  return (
    <div className="app-container">
      {needRefresh && (
        <div className="update-toast">
          <span>Ny version tillgänglig!</span>
          <button onClick={() => updateServiceWorker(true)} className="update-btn">
            Uppdatera
          </button>
          <button onClick={() => setNeedRefresh(false)} className="update-close-btn">
            Stäng
          </button>
        </div>
      )}

      <header className="header">
        <h1>SchemeCreator</h1>
        <input
          type="text"
          className="pattern-name-input"
          value={patternName}
          onChange={(e) => setPatternName(e.target.value)}
          placeholder="Mönsternamn..."
        />
        {activeTool !== 'paint' && (
          <span className="active-tool-badge">
            {activeTool === 'backstitch' ? 'Stygnlinje' :
              activeTool === 'arrow' ? 'Pil' :
                activeTool === 'text' ? 'Text' : 'Radera'}
          </span>
        )}
      </header>

      <div className="main-content">
        <div className="sidebar">
          <Toolbar
            gridSize={gridSize}
            onGridSizeChange={handleGridSizeChange}
            onSave={handleSave}
            onLoad={handleLoad}
            onExport={handleExport}
            onClear={handleClear}
            zoomIn={() => transformComponentRef.current?.zoomIn()}
            zoomOut={() => transformComponentRef.current?.zoomOut()}
            resetTransform={() => transformComponentRef.current?.resetTransform()}
            onUndo={handleUndo}
            canUndo={history.length > 0}
          />
        </div>

        <div className="canvas-area">
          <TransformWrapper
            ref={transformComponentRef}
            initialScale={1}
            minScale={0.3}
            maxScale={5}
            centerOnInit
            limitToBounds={false}
            wheel={{ step: 0.1 }}
            panning={{ disabled: false }}
          >
            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <Grid
                cells={cells}
                zoom={1}
                onCellClick={handleCellClick}
                overlay={overlay}
                activeTool={activeTool}
                drawingState={drawingState}
                hoveredPoint={hoveredPoint}
                onGridPointClick={handleGridPointClick}
                onGridPointHover={handleGridPointHover}
                onDeleteLine={handleDeleteLine}
                onDeleteArrow={handleDeleteArrow}
                onDeleteAnnotation={handleDeleteAnnotation}
                onStrokeStart={addToHistory}
              />
            </TransformComponent>
          </TransformWrapper>
        </div>
      </div>

      {/* Arrow direction picker */}
      {arrowPickerState && (
        <ArrowDirectionPicker
          position={arrowPickerState.screenPos}
          onSelect={handleArrowDirection}
          onCancel={() => setArrowPickerState(null)}
        />
      )}

      {/* Text input dialog */}
      {textInputState && (
        <>
          <div className="popup-overlay" onClick={() => setTextInputState(null)} />
          <div className="text-input-dialog">
            <span className="popup-title">Ange text/nummer</span>
            <input
              type="text"
              className="text-annotation-input"
              value={textInputState.text}
              onChange={(e) => setTextInputState(prev => prev ? { ...prev, text: e.target.value } : null)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleTextSubmit(); }}
              autoFocus
              placeholder="t.ex. 99, ABC..."
              maxLength={10}
            />
            <div className="text-input-actions">
              <button className="text-input-cancel" onClick={() => setTextInputState(null)}>
                Avbryt
              </button>
              <button className="text-input-confirm" onClick={handleTextSubmit}>
                Placera
              </button>
            </div>
          </div>
        </>
      )}

      {/* Popup panels */}
      {activePanel === 'color' && (
        <PopupPanel title="Välj färg" onClose={() => setActivePanel(null)}>
          <ColorPalette
            colors={PALETTE}
            selectedColor={selectedColor}
            onSelectColor={handleSelectColor}
          />
        </PopupPanel>
      )}

      {activePanel === 'tools' && (
        <PopupPanel title="Verktyg" onClose={() => setActivePanel(null)}>
          <ToolsPanel
            activeTool={activeTool}
            onSelectTool={handleSelectTool}
            lineColor={lineColor}
            onLineColorChange={setLineColor}
            lineWidth={lineWidth}
            onLineWidthChange={setLineWidth}
          />
        </PopupPanel>
      )}

      {activePanel === 'grid' && (
        <PopupPanel title="Rutnätsinställningar" onClose={() => setActivePanel(null)}>
          <div className="panel-section">
            <label className="panel-label">Storlek</label>
            <div className="grid-size-options">
              {gridSizes.map(size => (
                <button
                  key={size}
                  className={`grid-size-btn ${gridSize === size ? 'selected' : ''}`}
                  onClick={() => handleGridSizeChange(size)}
                >
                  {size}x{size}
                </button>
              ))}
            </div>
          </div>
          <div className="panel-section">
            <button className="clear-btn" onClick={handleClear}>
              Rensa allt
            </button>
          </div>
        </PopupPanel>
      )}

      {activePanel === 'file' && (
        <PopupPanel title="Arkiv" onClose={() => setActivePanel(null)}>
          <div className="file-actions">
            <button className="file-action-btn" onClick={handleSave}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Spara JSON
            </button>
            <button className="file-action-btn" onClick={handleLoad}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              Ladda JSON
            </button>
            <button className="file-action-btn export" onClick={handleExport}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Exportera PDF
            </button>
          </div>
        </PopupPanel>
      )}

      <BottomBar
        activePanel={activePanel}
        onTogglePanel={togglePanel}
        selectedColor={selectedColor}
        activeTool={activeTool}
        zoomIn={() => transformComponentRef.current?.zoomIn()}
        zoomOut={() => transformComponentRef.current?.zoomOut()}
        resetTransform={() => transformComponentRef.current?.resetTransform()}
        onUndo={handleUndo}
        canUndo={history.length > 0}
      />
    </div>
  );
}

export default App;
