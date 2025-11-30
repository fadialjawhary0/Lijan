import React, { useState, useEffect, useRef } from 'react';
import { Search, User, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';

const UserAutocomplete = ({ users = [], value, onChange, placeholder, disabled = false, error, className = '', required = false }) => {
  console.log('🚀 ~ UserAutocomplete ~ users:', users);
  const { t } = useTranslation('common');
  const { isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (value && users?.length > 0) {
      const user = users?.find(u => String(u?.id) === String(value));
      setSelectedUser(user || null);
      setSearchTerm(user ? `${user?.fullName}` : '');
    } else {
      setSelectedUser(null);
      setSearchTerm('');
    }
  }, [value, users]);

  const filteredUsers = users?.filter(user => {
    if (!searchTerm) return true;
    const fullName = `${user?.fullName}`.toLowerCase();
    const email = (user?.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName?.includes(search) || email?.includes(search);
  });

  const handleUserSelect = user => {
    setSelectedUser(user);
    setSearchTerm(`${user?.fullName}`);
    onChange(user?.id);
    setIsOpen(false);
  };

  const handleInputChange = e => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setIsOpen(true);

    if (!newSearchTerm) {
      setSelectedUser(null);
      onChange('');
    }
  };

  const handleClear = () => {
    setSelectedUser(null);
    setSearchTerm('');
    onChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
        if (selectedUser) {
          setSearchTerm(`${selectedUser?.fullName}`);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedUser]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="relative flex-1">
            <Search size={16} className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={handleFocus}
              placeholder={placeholder || t('searchUsers')}
              disabled={disabled}
              className={`w-full px-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                error ? 'border-red-500' : 'border-gray-300'
              } ${isRTL ? 'text-right pr-10 pl-3' : 'text-left pl-10 pr-3'}`}
            />
            <div className={`absolute top-1/2 transform -translate-y-1/2 flex items-center gap-1 ${isRTL ? 'left-3' : 'right-3'}`}>
              {selectedUser && !disabled && (
                <button type="button" onClick={handleClear} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={16} />
                </button>
              )}
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div
          className={`absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto ${
            isRTL ? 'right-0' : 'left-0'
          }`}
        >
          {filteredUsers?.length ? (
            <div className="py-1">
              {filteredUsers?.map(user => (
                <button
                  key={user?.id}
                  type="button"
                  onClick={() => handleUserSelect(user)}
                  className={`cursor-pointer w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors flex items-center gap-3 ${
                    isRTL ? 'text-right flex-row-reverse' : 'text-left'
                  } ${selectedUser?.id === user?.id ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User size={16} className="text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</div>
                    {user?.email && <div className="text-xs text-gray-500 truncate">{user?.email}</div>}
                  </div>
                </button>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="p-4 text-center text-gray-500">{t('noUsersFound')}</div>
          ) : (
            <div className="p-4 text-center text-gray-500">{t('startTypingToSearch')}</div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default UserAutocomplete;
