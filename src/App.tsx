import { useState, useEffect, useRef, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Grid } from './components/Grid';
import { Toolbar } from './components/Toolbar';
import { ColorPalette } from './components/ColorPalette';
import type { CellData, ColorOption, Pattern } from './types';
import { savePattern, loadPattern } from './utils/storage';
import { exportToPDF } from './utils/pdfExport';

// Define palette based on requirements
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

function App() {
  const [gridSize, setGridSize] = useState<number>(40);
  const [cells, setCells] = useState<CellData[][]>([]);
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(PALETTE[5]); // Default to Black 'X'
  const [patternName, setPatternName] = useState('Mitt Mönster');

  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);

  // Initialize grid
  useEffect(() => {
    if (cells.length === 0) {
      initializeGrid(gridSize);
    }
  }, []);

  const initializeGrid = (size: number) => {
    const newCells: CellData[][] = [];
    for (let r = 0; r < size; r++) {
      const row: CellData[] = [];
      for (let c = 0; c < size; c++) {
        row.push({ color: null, symbol: null });
      }
      newCells.push(row);
    }
    setCells(newCells);
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
        // Eraser logic
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
          // Reset zoom when loading new?
          transformComponentRef.current?.resetTransform();
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

  return (
    <div className="app-container">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1>SchemeCreator</h1>
          <input
            type="text"
            value={patternName}
            onChange={(e) => setPatternName(e.target.value)}
            style={{
              fontSize: '1.2rem',
              padding: '0.25rem',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>
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
          />
          <ColorPalette
            colors={PALETTE}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
          />
        </div>

        <div className="canvas-area">
          <TransformWrapper
            ref={transformComponentRef}
            initialScale={1}
            minScale={0.5}
            maxScale={4}
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
      </div>
    </div>
  );
}

export default App;
