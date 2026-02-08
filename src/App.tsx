import { useState, useRef, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Grid } from './components/Grid';
import { BottomBar } from './components/BottomBar';
import { PopupPanel } from './components/PopupPanel';
import { ColorPalette } from './components/ColorPalette';
import type { CellData, ColorOption, Pattern } from './types';
import { savePattern, loadPattern } from './utils/storage';
import { exportToPDF } from './utils/pdfExport';

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

type PanelType = 'color' | 'grid' | 'file' | null;

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

  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);

  const initializeGrid = (size: number) => {
    setCells(createGrid(size));
  };

  const handleCellClick = useCallback((row: number, col: number) => {
    setCells(prev => {
      const newCells = [...prev];
      const newRow = [...newCells[row]];

      if (selectedColor) {
        newRow[col] = {
          color: selectedColor.color,
          symbol: selectedColor.symbol
        };
      } else {
        newRow[col] = { color: null, symbol: null };
      }

      newCells[row] = newRow;
      return newCells;
    });
  }, [selectedColor]);

  const handleGridSizeChange = (newSize: number) => {
    if (window.confirm('Att byta storlek kommer att rensa nuvarande mönster. Vill du fortsätta?')) {
      setGridSize(newSize);
      initializeGrid(newSize);
    }
  };

  const handleSave = () => {
    const pattern: Pattern = {
      name: patternName,
      width: gridSize,
      height: gridSize,
      cells: cells,
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
      createdAt: new Date().toISOString()
    };
    exportToPDF(pattern, PALETTE);
  };

  const handleClear = () => {
    if (window.confirm('Är du säker på att du vill rensa allt?')) {
      initializeGrid(gridSize);
    }
  };

  const togglePanel = (panel: PanelType) => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  const handleSelectColor = (color: ColorOption | null) => {
    setSelectedColor(color);
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
      </header>

      <div className="canvas-area">
        <TransformWrapper
          ref={transformComponentRef}
          initialScale={1}
          minScale={0.3}
          maxScale={5}
          centerOnInit
          wheel={{ step: 0.1 }}
        >
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <Grid
              cells={cells}
              zoom={1}
              onCellClick={handleCellClick}
            />
          </TransformComponent>
        </TransformWrapper>
      </div>

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
        zoomIn={() => transformComponentRef.current?.zoomIn()}
        zoomOut={() => transformComponentRef.current?.zoomOut()}
        resetTransform={() => transformComponentRef.current?.resetTransform()}
      />
    </div>
  );
}

export default App;
