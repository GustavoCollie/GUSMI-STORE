export const getImageUrl = (path) => {
    if (!path) return null;
    // If path already starts with http, return it
    if (path.startsWith('http')) return path;

    // Clean up path - remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    return `http://localhost:8000/${cleanPath}`;
};
