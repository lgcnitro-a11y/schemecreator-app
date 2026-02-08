import type { Pattern } from '../types';

export const savePattern = (pattern: Pattern) => {
    const json = JSON.stringify(pattern, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${pattern.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
};

export const loadPattern = (file: File): Promise<Pattern> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = event.target?.result as string;
                const pattern = JSON.parse(json) as Pattern;
                // Basic validation
                if (!pattern.cells || !pattern.width || !pattern.height) {
                    reject(new Error('Invalid pattern file format'));
                }
                resolve(pattern);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};
