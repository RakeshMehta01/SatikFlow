import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  UploadCloud,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Table,
  Check
} from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

interface UploadHistoryItem {
  _id: string;
  fileName: string;
  sourceType: string;
  totalRows: number;
  importedRows: number;
  incompleteRows: number;
  duplicateRows: number;
  createdAt: string;
  uploadedBy: {
    name: string;
    email: string;
  };
}

export const UploadLeadsPage: React.FC = () => {
  usePageTitle('Upload Leads');
  // Wizard steps: 1: File selection, 2: Column mapping, 3: Import processing/results
  const [step, setStep] = useState(1);
  const [sourceType, setSourceType] = useState<'GMB' | 'EXCEL' | 'CSV' | 'NUMBERS' | 'MANUAL'>('GMB');
  const [file, setFile] = useState<File | null>(null);
  
  // Parsed spreadsheet details from backend
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [allRows, setAllRows] = useState<any[]>([]);
  
  // Selected mappings: Record<originalHeader, targetCrmField>
  const [mappings, setMappings] = useState<Record<string, string>>({});
  
  // Status and results
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    total: number;
    imported: number;
    incomplete: number;
    duplicate: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // History logs
  const [history, setHistory] = useState<UploadHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const crmTargetFields = [
    { value: 'businessName', label: 'Business Name' },
    { value: 'customerName', label: 'Customer Name' },
    { value: 'mobile', label: 'Phone/Mobile (Incomplete if missing)' },
    { value: 'alternatePhone', label: 'Alternate Phone' },
    { value: 'whatsappNumber', label: 'WhatsApp Number' },
    { value: 'email', label: 'Email Address' },
    { value: 'website', label: 'Website URL' },
    { value: 'googleMapsUrl', label: 'Google Maps Link' },
    { value: 'gmbCategory', label: 'Category' },
    { value: 'rating', label: 'Rating' },
    { value: 'reviewCount', label: 'Review Count' },
    { value: 'address', label: 'Address' },
    { value: 'city', label: 'City' },
    { value: 'state', label: 'State' },
    { value: 'pincode', label: 'Pincode/Zipcode' },
    { value: 'requirement', label: 'Requirement' },
    { value: 'remarks', label: 'Remarks/Note' },
    { value: 'custom_fields', label: 'Save as Custom Field' }
  ];

  useEffect(() => {
    fetchUploadHistory();
  }, []);

  const fetchUploadHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get('/uploads');
      setHistory(res.data);
    } catch (error) {
      console.error('Error fetching uploads history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const handleParse = async () => {
    if (!file) {
      setErrorMessage('Please select a CSV, Excel, or Numbers file first');
      return;
    }

    setIsParsing(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/uploads/parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { fileName, headers: fileHeaders, previewRows, totalRows, allRows } = res.data;
      
      setFileName(fileName);
      setHeaders(fileHeaders);
      setPreviewRows(previewRows);
      setTotalRows(totalRows);
      setAllRows(allRows);

      // Auto-detect matching fields to save manager time
      const initialMappings: Record<string, string> = {};
      fileHeaders.forEach((header: string) => {
        const lowerHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Find best match in CRM fields
        const match = crmTargetFields.find(field => {
          const lowerField = field.value.toLowerCase();
          const lowerLabel = field.label.toLowerCase().replace(/[^a-z0-9]/g, '');
          return (
            lowerHeader === lowerField ||
            lowerHeader.includes(lowerField) ||
            lowerHeader === lowerLabel ||
            lowerLabel.includes(lowerHeader)
          );
        });

        if (match) {
          initialMappings[header] = match.value;
        } else {
          // Default to custom_fields
          initialMappings[header] = 'custom_fields';
        }
      });
      setMappings(initialMappings);
      
      // Advance to step 2
      setStep(2);
    } catch (error: any) {
      console.error('Error parsing file:', error);
      setErrorMessage(error.response?.data?.message || 'Could not parse the file. Verify that the format is valid.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleMappingChange = (header: string, field: string) => {
    setMappings(prev => ({
      ...prev,
      [header]: field
    }));
  };

  const handleImport = async () => {
    setIsImporting(true);
    setErrorMessage(null);

    try {
      const res = await api.post('/uploads/import', {
        fileName,
        sourceType,
        fieldMappings: mappings,
        rows: allRows
      });

      setImportSummary(res.data.summary);
      setStep(3);
      fetchUploadHistory(); // Refresh history log
    } catch (error: any) {
      console.error('Error importing leads:', error);
      setErrorMessage(error.response?.data?.message || 'Server error during lead import');
    } finally {
      setIsImporting(false);
    }
  };

  const resetWizard = () => {
    setFile(null);
    setHeaders([]);
    setPreviewRows([]);
    setTotalRows(0);
    setAllRows([]);
    setMappings({});
    setImportSummary(null);
    setErrorMessage(null);
    setStep(1);
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">Import Lead Spreadsheets</h2>
        <p className="text-xs text-slate-500 mt-0.5">Upload, map and parse Excel, CSV, or other files directly into active lead pools.</p>
      </div>

      {/* Main Error */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-[12px] flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-xs font-semibold">{errorMessage}</p>
        </div>
      )}

      {/* Step Progress Bar */}
      <div className="bg-white p-4 rounded-[12px] border border-slate-200 shadow-sm flex items-center justify-between text-xs sm:text-sm font-semibold max-w-xl">
        <div className="flex items-center space-x-2">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-brand-purple text-white' : 'bg-slate-100 text-slate-400'}`}>1</span>
          <span className={step >= 1 ? 'text-slate-900 font-bold' : 'text-slate-400'}>Select File</span>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300" />
        <div className="flex items-center space-x-2">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-brand-purple text-white' : 'bg-slate-100 text-slate-400'}`}>2</span>
          <span className={step >= 2 ? 'text-slate-900 font-bold' : 'text-slate-400'}>Map Columns</span>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300" />
        <div className="flex items-center space-x-2">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-brand-purple text-white' : 'bg-slate-100 text-slate-400'}`}>3</span>
          <span className={step >= 3 ? 'text-slate-900 font-bold' : 'text-slate-400'}>Summary</span>
        </div>
      </div>

      {/* WIZARD CONTAINER */}
      <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-6">
        {/* STEP 1: Select File */}
        {step === 1 && (
          <div className="space-y-6 max-w-lg">
            {/* File Source Type */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Lead Data Source</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(['GMB', 'EXCEL', 'CSV', 'NUMBERS', 'MANUAL'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSourceType(type)}
                    className={`py-2 px-3 text-xs font-semibold border rounded-[8px] transition-colors ${
                      sourceType === type
                        ? 'bg-brand-purple/10 text-brand-purple border-brand-purple'
                        : 'border-slate-300 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {type === 'GMB' ? 'Lead Import' : type === 'EXCEL' ? 'Excel' : type === 'CSV' ? 'CSV' : type === 'NUMBERS' ? 'Numbers' : 'Manual'}
                  </button>
                ))}
              </div>
            </div>

            {/* Dropzone Area */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Upload Spreadsheet</label>
              <div className="border-2 border-dashed border-slate-300 rounded-[12px] p-8 flex flex-col items-center justify-center hover:border-brand-purple/40 hover:bg-slate-50/50 transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.numbers"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <UploadCloud className="w-12 h-12 text-slate-400 mb-3" />
                <p className="text-sm font-semibold text-slate-700">
                  {file ? file.name : 'Choose a file or drag it here'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Accepts CSV, XLSX, XLS or Numbers formats (Max 5MB)</p>
              </div>
            </div>

            {/* Parse Button */}
            <button
              onClick={handleParse}
              disabled={isParsing || !file}
              className="bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold py-2.5 px-6 rounded-[8px] transition-all disabled:opacity-50 min-h-[40px] flex items-center justify-center"
            >
              {isParsing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Next: Parse Columns</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 2: Map Columns */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Configure Column Mapping</h3>
                <p className="text-xs text-slate-500">Associate your spreadsheet headers with standard CRM properties. Unmapped fields automatically save to custom metadata.</p>
              </div>
              <div className="text-xs font-semibold text-slate-600 bg-slate-100 py-1 px-3 rounded-full">
                Total Rows Detected: {totalRows}
              </div>
            </div>

            {/* Mapping Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mapping table */}
              <div className="space-y-4 border border-slate-200 rounded-[12px] p-4 bg-slate-50">
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Field Configuration</h4>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {headers.map(header => (
                    <div key={header} className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center p-2.5 bg-white border border-slate-200 rounded-lg text-xs shadow-sm">
                      <span className="font-bold text-slate-800 truncate" title={header}>{header}</span>
                      <select
                        value={mappings[header] || 'custom_fields'}
                        onChange={(e) => handleMappingChange(header, e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-[6px] py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-brand-purple focus:border-brand-purple"
                      >
                        {crmTargetFields.map(field => (
                          <option key={field.value} value={field.value}>{field.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview sample */}
              <div className="space-y-4 border border-slate-200 rounded-[12px] p-4 flex flex-col">
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center">
                  <Table className="w-4 h-4 mr-1.5 text-slate-400" />
                  First Row File Preview
                </h4>
                {previewRows.length > 0 ? (
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                          <th className="p-2">Header Name</th>
                          <th className="p-2">Sample Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {Object.entries(previewRows[0]).map(([key, val]) => (
                          <tr key={key}>
                            <td className="p-2 font-mono text-slate-700 font-medium">{key}</td>
                            <td className="p-2 text-slate-500 truncate max-w-[200px]" title={String(val)}>{String(val) || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">No preview row available</div>
                )}
              </div>
            </div>

            {/* Back & Submit buttons */}
            <div className="flex space-x-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setStep(1)}
                className="border border-slate-350 hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 px-5 rounded-[8px] min-h-[40px] flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={isImporting}
                className="bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold py-2.5 px-6 rounded-[8px] transition-all disabled:opacity-50 min-h-[40px] flex items-center justify-center"
              >
                {isImporting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Import {totalRows} Leads</span>
                    <Check className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Summary Results */}
        {step === 3 && importSummary && (
          <div className="space-y-6 text-center max-w-md mx-auto py-4">
            <div className="w-16 h-16 bg-green-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle className="w-8 h-8" />
            </div>
            
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Leads Imported Successfully</h3>
              <p className="text-xs text-slate-500 mt-1">lead records parsed, validated & loaded into database.</p>
            </div>

            {/* Summary statistics */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-[12px] border border-slate-200 text-xs">
              <div className="p-3 bg-white border border-slate-100 rounded-lg">
                <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[9px] mb-0.5">Total Rows</span>
                <span className="text-lg font-bold text-slate-900">{importSummary.total}</span>
              </div>
              <div className="p-3 bg-white border border-slate-100 rounded-lg">
                <span className="text-emerald-500 block font-semibold uppercase tracking-wider text-[9px] mb-0.5">Imported (New)</span>
                <span className="text-lg font-bold text-emerald-600">{importSummary.imported}</span>
              </div>
              <div className="p-3 bg-white border border-slate-100 rounded-lg">
                <span className="text-red-500 block font-semibold uppercase tracking-wider text-[9px] mb-0.5">Incomplete</span>
                <span className="text-lg font-bold text-red-600">{importSummary.incomplete}</span>
              </div>
              <div className="p-3 bg-white border border-slate-100 rounded-lg">
                <span className="text-amber-600 block font-semibold uppercase tracking-wider text-[9px] mb-0.5">Duplicates Skipped</span>
                <span className="text-lg font-bold text-amber-600">{importSummary.duplicate}</span>
              </div>
            </div>

            <button
              onClick={resetWizard}
              className="bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold py-2.5 px-6 rounded-[8px] transition-all min-h-[40px]"
            >
              Import Another File
            </button>
          </div>
        )}
      </div>

      {/* UPLOAD HISTORY LOG */}
      <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900">Upload History Logs</h4>
            <p className="text-xs text-slate-500 mt-0.5">Historical list of spreadsheet ingestion events.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loadingHistory ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">Loading history logs...</div>
          ) : history.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                  <th className="p-4">File Name</th>
                  <th className="p-4">Source</th>
                  <th className="p-4 text-center">Total Rows</th>
                  <th className="p-4 text-center text-emerald-600">Imported</th>
                  <th className="p-4 text-center text-red-500">Incomplete</th>
                  <th className="p-4 text-center text-amber-600">Duplicates</th>
                  <th className="p-4">Uploaded By</th>
                  <th className="p-4">Date Uploaded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {history.map(item => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900 flex items-center">
                      <FileSpreadsheet className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                      {item.fileName}
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-800 text-[10px] px-2 py-0.5 rounded font-bold">{item.sourceType}</span>
                    </td>
                    <td className="p-4 text-center font-semibold">{item.totalRows}</td>
                    <td className="p-4 text-center font-bold text-emerald-600">{item.importedRows}</td>
                    <td className="p-4 text-center font-bold text-red-500">{item.incompleteRows}</td>
                    <td className="p-4 text-center font-bold text-amber-500">{item.duplicateRows}</td>
                    <td className="p-4 text-slate-500">{item.uploadedBy?.name || 'Manager'}</td>
                    <td className="p-4 text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">No upload logs found. Choose a file above to begin.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadLeadsPage;
