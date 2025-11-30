import React, { useState, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';
// import { useSearchAttachmentQuery } from '../../../queries/attachements';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../hooks/useLanguage';

const AttachmentSearch = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search query
  // const { data: searchResults, isLoading } = useSearchAttachmentQuery(debouncedQuery ? debouncedQuery : null, { enabled: !!debouncedQuery });
  const { data: searchResults } = { data: [] };
  const isLoading = false;

  const handleSearchChange = useCallback(e => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(!!value);
    setIsSearching(!!value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setShowResults(false);
    setIsSearching(false);
  }, []);

  const handleResultClick = attachment => {
    clearSearch();
  };

  return (
    <div className="relative w-full -z-1">
      {/* Search Input */}
      <div className="relative ">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="relative w-full">
            <Search size={16} className={`absolute top-1/2 transform -translate-y-1/2 text-text ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t('searchAttachments')}
              className={`w-full px-10 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                isRTL ? 'text-right pr-10 pl-3' : 'text-left pl-10 pr-3'
              }`}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className={`absolute top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text ${isRTL ? 'left-3' : 'right-3'}`}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div
          className={`absolute top-full mt-1 w-full bg-surface-elevated border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto ${
            isRTL ? 'right-0' : 'left-0'
          }`}
        >
          {isLoading ? (
            <div className="p-4 text-center text-text-muted">{t('searching')}...</div>
          ) : searchResults?.data?.length > 0 ? (
            <div className="py-1 bg-surface-elevated">
              {searchResults.data.map((attachment, index) => (
                <button
                  key={attachment.id || index}
                  onClick={() => handleResultClick(attachment)}
                  className={`w-full px-4 py-2 text-left hover:bg-surface-elevated-hover transition-colors  border-b border-border ${
                    isRTL ? 'text-right' : 'text-left'
                  }`}
                >
                  <div className="text-sm font-medium text-text">{attachment.name || attachment.fileName || t('unnamedAttachment')}</div>
                  {attachment.description && <div className="text-xs text-text-muted mt-1">{attachment.description}</div>}
                </button>
              ))}
            </div>
          ) : debouncedQuery ? (
            <div className="p-4 text-center text-text-muted">{t('noAttachmentsFound')}</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AttachmentSearch;
