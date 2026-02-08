export function isDark(color: string): boolean {
    if (color === 'transparent') return false;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    if (isNaN(r)) return false;
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq < 128;
}
