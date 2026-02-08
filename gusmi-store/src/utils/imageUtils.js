export const getImageUrl = (path) => {
    if (!path) return null;
    // If path already starts with http, return it
    if (path.startsWith('http')) return path;

    // Clean up path - remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace('/api/v1/public', '');
    return `${baseUrl.replace(/\/$/, '')}/${encodeURI(cleanPath)}`;
};
