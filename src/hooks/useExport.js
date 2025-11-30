import {
  useExportToExcelMutation,
  useExportToPDFMutation,
  useExportToWordMutation,
  useExportToPNGMutation,
  prepareTableDataForExport,
  prepareChartDataForExport,
  prepareTextDataForExport,
} from '../queries/export';

export const useExport = () => {
  const excelMutation = useExportToExcelMutation();
  const pdfMutation = useExportToPDFMutation();
  const wordMutation = useExportToWordMutation();
  const pngMutation = useExportToPNGMutation();

  const handleExport = async (exportType, data, config) => {
    let exportData = data;

    if (data && data.contentItems) {
      exportData = data;
    } else if (config && config.type) {
      const { type, ...configData } = config;

      switch (type) {
        case 'table':
          exportData = prepareTableDataForExport(data, configData);
          break;
        case 'chart':
          exportData = prepareChartDataForExport(data, configData);
          break;
        case 'text':
          exportData = prepareTextDataForExport(data, configData);
          break;
        default:
          throw new Error(`Unsupported export type: ${type}`);
      }
    } else {
      throw new Error('Invalid export configuration: missing type or contentItems');
    }

    let mutation;
    switch (exportType.toLowerCase()) {
      case 'excel':
        mutation = excelMutation;
        break;
      case 'pdf':
        mutation = pdfMutation;
        break;
      case 'word':
        mutation = wordMutation;
        break;
      case 'png':
        mutation = pngMutation;
        break;
      default:
        throw new Error(`Unsupported export format: ${exportType}`);
    }

    return mutation.mutateAsync(exportData);
  };

  return {
    isExporting: excelMutation.isPending || pdfMutation.isPending || wordMutation.isPending || pngMutation.isPending,
    exportError: excelMutation.error || pdfMutation.error || wordMutation.error || pngMutation.error,
    handleExport,
    excelMutation,
    pdfMutation,
    wordMutation,
    pngMutation,
  };
};
