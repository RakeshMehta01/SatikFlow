import { Response } from 'express';
import multer from 'multer';
import * as xlsx from 'xlsx';
import Papa from 'papaparse';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import Lead, { LeadStatus } from '../models/Lead';
import Upload from '../models/Upload';
import { AuthRequest } from '../middlewares/auth';

// Configure Multer in-memory storage
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('file');

// Helper to parse .numbers files using Python script
const parseNumbersFile = (fileBuffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const tempDir = path.join(process.cwd(), 'src/utils/temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempFilePath = path.join(tempDir, `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.numbers`);

    fs.writeFile(tempFilePath, fileBuffer, (writeErr) => {
      if (writeErr) {
        return reject(writeErr);
      }

      const scriptPath = path.join(process.cwd(), 'src/utils/numbers_to_csv.py');
      exec(`python3 "${scriptPath}" "${tempFilePath}"`, (execErr, stdout, stderr) => {
        // Clean up temp file
        fs.unlink(tempFilePath, () => {});

        if (execErr) {
          console.error('Python numbers conversion error:', stderr);
          return reject(new Error(stderr || execErr.message));
        }
        resolve(stdout);
      });
    });
  });
};

export const parseFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const fileName = req.file.originalname.toLowerCase();
    const isCsv = fileName.endsWith('.csv');
    const isXlsx = fileName.endsWith('.xlsx');
    const isXls = fileName.endsWith('.xls');
    const isNumbers = fileName.endsWith('.numbers');

    if (!isCsv && !isXlsx && !isXls && !isNumbers) {
      res.status(400).json({ message: 'Unsupported file format. Please upload a CSV, XLSX, XLS, or Apple Numbers spreadsheet.' });
      return;
    }

    let headers: string[] = [];
    let rows: any[] = [];

    if (isCsv) {
      const csvData = req.file.buffer.toString('utf-8');
      const parsed = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
      });
      rows = parsed.data;
      if (rows.length > 0) {
        headers = Object.keys(rows[0]);
      }
    } else if (isNumbers) {
      if (process.env.NODE_ENV === 'production') {
        res.status(400).json({
          message: 'Please export Apple Numbers file as CSV or Excel before uploading.'
        });
        return;
      }
      const csvData = await parseNumbersFile(req.file.buffer);
      const parsed = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
      });
      rows = parsed.data;
      if (rows.length > 0) {
        headers = Object.keys(rows[0]);
      }
    } else {
      // Excel parsing
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      rows = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
      if (rows.length > 0) {
        headers = Object.keys(rows[0]);
      }
    }

    // Limit rows returned for preview to 5
    const previewRows = rows.slice(0, 5);

    res.status(200).json({
      fileName,
      headers,
      previewRows,
      totalRows: rows.length,
      // Temporarily store all parsed rows in the response so the frontend can send them back for import,
      // avoiding server disk state for simplicity in Render free tier
      allRows: rows
    });
  } catch (error: any) {
    console.error('parseFile error:', error);
    res.status(500).json({ message: error.message || 'Error parsing file. Please ensure it is a valid CSV, Excel, or Numbers file.' });
  }
};

export const importLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileName, sourceType, fieldMappings, rows } = req.body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      res.status(400).json({ message: 'No row data to import' });
      return;
    }

    if (!fieldMappings) {
      res.status(400).json({ message: 'Field mappings are required' });
      return;
    }

    let importedCount = 0;
    let incompleteCount = 0;
    let duplicateCount = 0;

    const leadsToInsert: any[] = [];

    // Pre-load all existing active mobiles to check duplicates locally and optimize performance
    const activeMobiles = await Lead.find({ mobile: { $exists: true, $ne: '' } }).select('mobile');
    const existingMobileSet = new Set(activeMobiles.map(l => l.mobile?.trim()));

    // Keep track of mobiles in the current import batch to prevent internal duplicates
    const batchMobileSet = new Set<string>();

    for (const rawRow of rows) {
      const mappedLead: any = {
        customFields: {},
        uploadedBy: req.user?._id,
        source: sourceType || 'EXCEL'
      };

      // Apply mapping
      Object.entries(fieldMappings).forEach(([originalCol, mappedField]) => {
        const val = rawRow[originalCol];
        if (val === undefined || val === null || val === '') return;

        if (mappedField === 'custom_fields') {
          mappedLead.customFields[originalCol] = val;
        } else {
          mappedLead[mappedField as string] = val;
        }
      });

      // Populate customFields with any unmapped columns
      Object.keys(rawRow).forEach(key => {
        if (!fieldMappings[key]) {
          mappedLead.customFields[key] = rawRow[key];
        }
      });

      // If mobile number is clean, normalize it
      let mobile = mappedLead.mobile ? String(mappedLead.mobile).trim() : '';
      // Strip spaces or special characters if needed, but let's keep it simple
      if (mobile) {
        mappedLead.mobile = mobile;
      }

      // Business logic: Name calculation
      const name = mappedLead.customerName || '';
      const bizName = mappedLead.businessName || '';
      mappedLead.displayName = name.trim() || bizName.trim() || mobile || 'Unnamed GMB Lead';

      // Check lead status
      if (!mobile) {
        mappedLead.status = 'INCOMPLETE';
        incompleteCount++;
        leadsToInsert.push(mappedLead);
      } else {
        // Check for duplicates
        if (existingMobileSet.has(mobile) || batchMobileSet.has(mobile)) {
          duplicateCount++;
          // Skip duplicates
          continue;
        }
        
        mappedLead.status = 'NEW';
        importedCount++;
        batchMobileSet.add(mobile);
        leadsToInsert.push(mappedLead);
      }
    }

    // Bulk insert leads into MongoDB
    if (leadsToInsert.length > 0) {
      await Lead.insertMany(leadsToInsert);
    }

    // Save Upload history
    const uploadRecord = await Upload.create({
      fileName,
      uploadedBy: req.user?._id,
      sourceType: sourceType || 'EXCEL',
      totalRows: rows.length,
      importedRows: importedCount,
      incompleteRows: incompleteCount,
      duplicateRows: duplicateCount,
      fieldMappings
    });

    res.status(201).json({
      message: 'Import completed successfully',
      summary: {
        total: rows.length,
        imported: importedCount,
        incomplete: incompleteCount,
        duplicate: duplicateCount
      },
      upload: uploadRecord
    });
  } catch (error) {
    console.error('importLeads error:', error);
    res.status(500).json({ message: 'Server error during lead import' });
  }
};

export const getUploadHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uploads = await Upload.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(uploads);
  } catch (error) {
    console.error('getUploadHistory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
