import React from 'react';

const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  const makePages = () => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Paginación">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className={`px-3 py-2 rounded-lg border ${page === 1 ? 'text-gray-300 border-gray-100' : 'text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
        Prev
      </button>

      {makePages().map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`px-3 py-2 rounded-lg border ${p === page ? 'bg-primary-600 text-white border-primary-600' : 'text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
          {p}
        </button>
      ))}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className={`px-3 py-2 rounded-lg border ${page === totalPages ? 'text-gray-300 border-gray-100' : 'text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
        Next
      </button>
    </nav>
  );
};

export default Pagination;
