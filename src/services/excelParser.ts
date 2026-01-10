import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system/legacy';
import { ShiftType, MonthlyShiftData } from '../types';

/**
 * Parsed employee data from Excel
 */
export interface ParsedEmployee {
  sicil: string;
  name: string;
  team: string;
  position: string;
  shifts: MonthlyShiftData; // { "2026-01": { 1: "morning", 2: "evening", ... } }
}

/**
 * Parse result with metadata
 */
export interface ParseResult {
  success: boolean;
  employees: ParsedEmployee[];
  month: string; // "2026-01" format
  error?: string;
}

/**
 * Map Excel shift code to app ShiftType
 */
export function mapShiftCode(code: string | null | undefined): ShiftType {
  if (!code) return 'off';

  const normalized = code.toString().trim().toUpperCase();

  // Empty or whitespace
  if (normalized === '') return 'off';

  // Combined shifts (S/E, A/E, N/E) - take first part
  if (normalized.includes('/')) {
    return mapShiftCode(normalized.split('/')[0]);
  }

  // Morning: S, SB
  if (normalized === 'S' || normalized === 'SB') {
    return 'morning';
  }

  // Evening: A, AB
  if (normalized === 'A' || normalized === 'AB') {
    return 'evening';
  }

  // Night: G
  if (normalized === 'G') {
    return 'night';
  }

  // Off (basic): I
  if (normalized === 'I') {
    return 'off';
  }

  // Annual Leave: Y
  if (normalized === 'Y') {
    return 'annual';
  }

  // Training: E
  if (normalized === 'E') {
    return 'training';
  }

  // Normal: N
  if (normalized === 'N') {
    return 'normal';
  }

  // Sick Leave: R
  if (normalized === 'R') {
    return 'sick';
  }

  // Excuse: M
  if (normalized === 'M') {
    return 'excuse';
  }

  // Default fallback for unknown codes
  return 'off';
}

/**
 * Extract month/year from filename like "OCAK 2026 ÇALIŞMA PROGRAMI.xlsx"
 */
function extractMonthFromFilename(filename: string): string {
  const monthMap: Record<string, string> = {
    'OCAK': '01',
    'ŞUBAT': '02',
    'MART': '03',
    'NİSAN': '04',
    'MAYIS': '05',
    'HAZİRAN': '06',
    'TEMMUZ': '07',
    'AĞUSTOS': '08',
    'EYLÜL': '09',
    'EKİM': '10',
    'KASIM': '11',
    'ARALIK': '12',
  };

  const upper = filename.toUpperCase();

  for (const [monthName, monthNum] of Object.entries(monthMap)) {
    if (upper.includes(monthName)) {
      // Extract year (4 digits)
      const yearMatch = filename.match(/20\d{2}/);
      const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
      return `${year}-${monthNum}`;
    }
  }

  // Default to current month
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Parse Excel file and extract employee shift data
 */
export async function parseExcelFile(fileUri: string, filename: string): Promise<ParseResult> {
  try {
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: 'base64',
    });

    // Parse workbook
    const workbook = XLSX.read(base64, { type: 'base64' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to array of arrays
    const data: (string | number | null)[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
    });

    if (data.length < 3) {
      return { success: false, employees: [], month: '', error: 'Dosya formatı geçersiz' };
    }

    // Extract month from filename
    const month = extractMonthFromFilename(filename);
    const [year, monthNum] = month.split('-');

    // Get days in month
    const daysInMonth = new Date(parseInt(year), parseInt(monthNum), 0).getDate();

    const employees: ParsedEmployee[] = [];

    // Start from row 3 (index 2) - employee data
    for (let rowIdx = 2; rowIdx < data.length; rowIdx++) {
      const row = data[rowIdx];
      if (!row || row.length < 10) continue;

      // Column B (index 1): Sicil
      const sicil = row[1]?.toString().trim();
      if (!sicil || sicil === '') continue;

      // Column C (index 2): Name
      const name = row[2]?.toString().trim() || '';

      // Column D (index 3): Position
      const position = row[3]?.toString().trim() || '';

      // Column E (index 4): Team
      const team = row[4]?.toString().trim() || '';

      // Columns H-AL (index 7-37): Days 01-31
      const monthKey = `${year}-${monthNum}`;
      const shifts: MonthlyShiftData = {
        [monthKey]: {},
      };

      for (let day = 1; day <= daysInMonth; day++) {
        const colIdx = 6 + day; // Column H is index 7, so day 1 = index 7
        const shiftCode = row[colIdx];
        shifts[monthKey][day] = mapShiftCode(shiftCode?.toString());
      }

      employees.push({
        sicil,
        name,
        team,
        position,
        shifts,
      });
    }

    return {
      success: true,
      employees,
      month,
    };
  } catch (error) {
    console.error('Excel parse error:', error);
    return {
      success: false,
      employees: [],
      month: '',
      error: 'Dosya okunamadı',
    };
  }
}

/**
 * Find employee by sicil number
 */
export function findEmployeeBySicil(
  employees: ParsedEmployee[],
  sicil: string
): ParsedEmployee | null {
  const normalizedSicil = sicil.trim();
  return employees.find((e) => e.sicil === normalizedSicil) || null;
}
