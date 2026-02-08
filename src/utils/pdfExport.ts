import jsPDF from 'jspdf';
import type { Pattern, ColorOption } from '../types';

export const exportToPDF = (pattern: Pattern, colorPalette: ColorOption[]) => {
    // Determine orientation based on aspect ratio
    const orientation = pattern.width > pattern.height ? 'landscape' : 'portrait';
    const doc = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;

    // Title
    doc.setFontSize(16);
    doc.text(pattern.name, pageWidth / 2, margin, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Created: ${new Date().toLocaleDateString()}`, pageWidth - margin, margin, { align: 'right' });

    // Calculate grid size
    const contentWidth = pageWidth - (margin * 2);
    // Leave space for legend at bottom (approx 40mm) and title at top (20mm)
    const availableHeight = pageHeight - (margin * 2) - 60;

    const cellSizeByWidth = contentWidth / pattern.width;
    const cellSizeByHeight = availableHeight / pattern.height;
    const cellSize = Math.min(cellSizeByWidth, cellSizeByHeight);

    const gridWidth = cellSize * pattern.width;
    const gridHeight = cellSize * pattern.height;

    const startX = (pageWidth - gridWidth) / 2;
    const startY = 20;

    // Draw Grid and Symbols
    doc.setLineWidth(0.1);
    doc.setDrawColor(150); // Light grey lines

    doc.setFontSize(cellSize * 0.7); // Scale font to cell size

    pattern.cells.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const x = startX + (colIndex * cellSize);
            const y = startY + (rowIndex * cellSize);

            // Fill background if colored (optional, usually patterns are B&W symbols, but we can add light background)
            // For this specific request, the user wants symbols. Let's stick to symbols on white for clarity in printing,
            // or maybe very light background color if it matches the palette. 
            // The requirement says "export to pdf to share and print". 
            // Usually for cross-stitch, it's black symbols on white grid.
            // However, if the user filled it with color, we might want to show that? 
            // Let's stick to Symbols primarily as per the "symboler i rutorna" requirement.

            // Draw cell border
            doc.rect(x, y, cellSize, cellSize);

            // Draw symbol
            if (cell.symbol) {
                doc.setTextColor(0);
                doc.text(cell.symbol, x + cellSize / 2, y + cellSize / 1.5, { align: 'center', baseline: 'middle' });
            }

            // Thicker lines every 10 cells (standard for cross-stitch)
            if (colIndex % 10 === 0 && colIndex !== 0) {
                doc.setLineWidth(0.3);
                doc.line(x, startY, x, startY + gridHeight);
                doc.setLineWidth(0.1);
            }
            if (rowIndex % 10 === 0 && rowIndex !== 0) {
                doc.setLineWidth(0.3);
                doc.line(startX, y, startX + gridWidth, y);
                doc.setLineWidth(0.1);
            }
        });
    });

    // Draw border around the whole grid
    doc.setLineWidth(0.5);
    doc.rect(startX, startY, gridWidth, gridHeight);

    // Draw Legend
    const legendStartY = startY + gridHeight + 10;
    doc.setFontSize(12);
    doc.text("Legend:", margin, legendStartY);

    const legendItemWidth = 40;
    const legendItemHeight = 8;
    let legendX = margin;
    let legendY = legendStartY + 5;

    colorPalette.forEach((option) => {
        // Check if symbol is used in pattern
        const isUsed = pattern.cells.some(row => row.some(cell => cell.symbol === option.symbol));
        if (isUsed || option.symbol !== '□') { // Always show non-empty options or checks
            // We only show if it's not the "empty" symbol usually, but let's show all valid colors
            if (option.symbol === '□') return;

            // Draw symbol box
            doc.setLineWidth(0.1);
            doc.rect(legendX, legendY, 6, 6);
            doc.setFontSize(9);
            doc.text(option.symbol, legendX + 3, legendY + 4, { align: 'center', baseline: 'middle' });

            // Draw color name/code
            doc.text(`${option.name}`, legendX + 8, legendY + 4);

            legendX += legendItemWidth;
            if (legendX > pageWidth - margin - legendItemWidth) {
                legendX = margin;
                legendY += legendItemHeight;
            }
        }
    });

    doc.save(`${pattern.name}.pdf`);
};
