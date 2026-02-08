import jsPDF from 'jspdf';
import type { Pattern, ColorOption } from '../types';
import { hexToRgb, directionToAngle } from './grid';

export const exportToPDF = (pattern: Pattern, colorPalette: ColorOption[]) => {
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
    doc.setDrawColor(150);
    doc.setFontSize(cellSize * 0.7);

    pattern.cells.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const x = startX + (colIndex * cellSize);
            const y = startY + (rowIndex * cellSize);

            doc.rect(x, y, cellSize, cellSize);

            if (cell.symbol) {
                doc.setTextColor(0);
                doc.text(cell.symbol, x + cellSize / 2, y + cellSize / 1.5, { align: 'center', baseline: 'middle' });
            }

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
    doc.setDrawColor(0);
    doc.rect(startX, startY, gridWidth, gridHeight);

    // Draw overlay elements
    const overlay = pattern.overlay;
    if (overlay) {
        // Backstitch lines
        if (overlay.backstitchLines.length > 0) {
            overlay.backstitchLines.forEach(line => {
                const x1 = startX + (line.start.x * cellSize);
                const y1 = startY + (line.start.y * cellSize);
                const x2 = startX + (line.end.x * cellSize);
                const y2 = startY + (line.end.y * cellSize);

                const rgb = hexToRgb(line.color);
                doc.setDrawColor(rgb.r, rgb.g, rgb.b);

                const pdfLineWidth = (line.lineWidth / 20) * cellSize;
                doc.setLineWidth(Math.max(pdfLineWidth, 0.3));
                doc.line(x1, y1, x2, y2);
            });
            doc.setDrawColor(0);
            doc.setLineWidth(0.1);
        }

        // Arrows
        if (overlay.arrows.length > 0) {
            overlay.arrows.forEach(arrow => {
                const px = startX + (arrow.position.x * cellSize);
                const py = startY + (arrow.position.y * cellSize);

                const rgb = hexToRgb(arrow.color);
                doc.setDrawColor(rgb.r, rgb.g, rgb.b);
                doc.setFillColor(rgb.r, rgb.g, rgb.b);

                const arrowSize = cellSize * 0.35;
                const angle = directionToAngle(arrow.direction);

                const tipX = px + Math.cos(angle) * arrowSize;
                const tipY = py + Math.sin(angle) * arrowSize;
                const leftX = px + Math.cos(angle + 2.5) * arrowSize * 0.5;
                const leftY = py + Math.sin(angle + 2.5) * arrowSize * 0.5;
                const rightX = px + Math.cos(angle - 2.5) * arrowSize * 0.5;
                const rightY = py + Math.sin(angle - 2.5) * arrowSize * 0.5;

                doc.triangle(leftX, leftY, tipX, tipY, rightX, rightY, 'F');
            });
            doc.setDrawColor(0);
            doc.setFillColor(0, 0, 0);
        }

        // Text annotations
        if (overlay.annotations.length > 0) {
            overlay.annotations.forEach(ann => {
                const px = startX + (ann.position.x * cellSize);
                const py = startY + (ann.position.y * cellSize);

                const rgb = hexToRgb(ann.color);
                doc.setTextColor(rgb.r, rgb.g, rgb.b);
                doc.setFontSize(ann.fontSize * cellSize * 2);
                doc.setFont('helvetica', 'bold');
                doc.text(ann.text, px, py, { align: 'center', baseline: 'middle' });
            });
            doc.setTextColor(0);
            doc.setFont('helvetica', 'normal');
        }
    }

    // Draw Legend
    const legendStartY = startY + gridHeight + 10;
    doc.setFontSize(12);
    doc.text("Legend:", margin, legendStartY);

    const legendItemWidth = 40;
    const legendItemHeight = 8;
    let legendX = margin;
    let legendY = legendStartY + 5;

    colorPalette.forEach((option) => {
        const isUsed = pattern.cells.some(row => row.some(cell => cell.symbol === option.symbol));
        if (isUsed || option.symbol !== '□') {
            if (option.symbol === '□') return;

            doc.setLineWidth(0.1);
            doc.setDrawColor(150);
            doc.rect(legendX, legendY, 6, 6);
            doc.setFontSize(9);
            doc.setTextColor(0);
            doc.text(option.symbol, legendX + 3, legendY + 4, { align: 'center', baseline: 'middle' });
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
