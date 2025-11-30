import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MoreVertical, FileSpreadsheet, FileText, Image, Download } from 'lucide-react';
import { useExport } from '../../hooks/useExport';
import { useTranslation } from 'react-i18next';

const ExportMenu = React.memo(({ exportConfig, getExportConfig, colorStyles = {} }) => {
  const { i18n } = useTranslation();

  const [showMenu, setShowMenu] = useState(false);
  const [showExportSubmenu, setShowExportSubmenu] = useState(false);
  const menuRef = useRef(null);
  const { handleExport, isExporting } = useExport();

  const defaultStyles = {
    iconColor: 'text-text',
    hoverBgColor: 'hover:bg-surface',
  };

  const styles = {
    iconColor: colorStyles.iconColor || defaultStyles.iconColor,
    hoverBgColor: colorStyles.hoverBgColor || defaultStyles.hoverBgColor,
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
        setShowExportSubmenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportClick = async format => {
    let configToUse = exportConfig;
    if (getExportConfig) {
      configToUse = await getExportConfig(format);
    }
    if (!configToUse) return;

    try {
      const configWithType = {
        type: configToUse.type,
        ...configToUse.config,
      };
      await handleExport(format, configToUse.data, configWithType);
      setShowMenu(false);
      setShowExportSubmenu(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const exportOptions = useMemo(() => {
    if (!exportConfig && !getExportConfig) return [];
    // Use exportConfig or getExportConfig('pdf') to determine type
    const type = exportConfig?.type || getExportConfig?.('pdf')?.type;
    switch (type) {
      case 'table':
        return [{ label: 'Excel', format: 'excel', icon: <FileSpreadsheet size={14} /> }];
      case 'chart':
        return [
          { label: 'Excel', format: 'excel', icon: <FileSpreadsheet size={14} /> },
          { label: 'Image', format: 'png', icon: <Image size={14} /> },
          { label: 'PDF', format: 'pdf', icon: <FileText size={14} /> },
        ];
      case 'text':
        return [
          { label: 'PDF', format: 'pdf', icon: <FileText size={14} /> },
          { label: 'Word', format: 'word', icon: <FileText size={14} /> },
        ];
      default:
        return [];
    }
  }, [exportConfig?.type, getExportConfig]);

  if (!exportConfig && !getExportConfig) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`p-1 rounded cursor-pointer transition-colors ${styles.iconColor} ${styles.hoverBgColor}`}
        title="More options"
      >
        <MoreVertical size={16} />
      </button>

      {showMenu && (
        <div
          className={`absolute ${
            i18n.language === 'ar' ? 'left-0' : 'right-0'
          } top-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[160px]`}
        >
          <div className="py-1">
            <div className="relative" onMouseEnter={() => setShowExportSubmenu(true)} onMouseLeave={() => setShowExportSubmenu(false)}>
              <button
                className="w-full px-3 py-2 cursor-pointer text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                disabled={isExporting}
              >
                <span className="flex items-center gap-2">
                  <Download size={14} />
                  Export
                </span>
                <span className="text-xs">▶</span>
              </button>

              {/* Export Submenu - No gap, positioned directly adjacent */}
              {showExportSubmenu && exportOptions?.length && (
                <div
                  className={`absolute ${
                    i18n.language === 'ar' ? 'left-full' : 'right-full'
                  } top-0 z-50 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[120px]`}
                >
                  {exportOptions?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleExportClick(option?.format)}
                      disabled={isExporting}
                      className="w-full px-3 py-2 cursor-pointer text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      {option?.icon}
                      {option?.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ExportMenu.displayName = 'ExportMenu';

export default ExportMenu;
