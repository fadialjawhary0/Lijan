import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const getPages = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const { i18n } = useTranslation();

  if (totalPages <= 1) return null;
  const pages = getPages(currentPage, totalPages);

  return (
    <nav className="flex items-center gap-1 select-none">
      <button
        className="p-1 rounded hover:bg-surface-elevated disabled:opacity-50 cursor-pointer"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous"
      >
        {i18n.language === 'ar' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {pages?.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-text-muted">
            ...
          </span>
        ) : (
          <button
            key={`page-${page}-${idx}`}
            className={`px-2 py-1 rounded text-xs font-medium cursor-pointer text-text ${
              page === currentPage ? 'border-b-2 border-primary text-primary' : 'hover:text-primary'
            }`}
            onClick={() => onPageChange(page)}
            disabled={page === currentPage}
          >
            {page}
          </button>
        )
      )}

      <button
        className="p-1 rounded hover:bg-surface-elevated disabled:opacity-50 cursor-pointer"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next"
      >
        {i18n.language === 'ar' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>
    </nav>
  );
};

export default Pagination;
