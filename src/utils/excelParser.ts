import * as XLSX from 'xlsx';

export interface ParsedLeadRow {
  phoneNumber: string;
  customerName: string;
  category?: string;
  notes?: string;
  customFields?: Record<string, string | number>;
  [key: string]: any;
}

export interface ExcelParseResult {
  headers: string[];
  rows: any[];
  fileName: string;
  suggestedMapping: {
    phoneColumn: string;
    nameColumn: string;
    categoryColumn?: string;
    notesColumn?: string;
  };
}

// Automatically detect best matching column header
export function detectColumnMapping(headers: string[]) {
  const normalized = headers.map((h) => ({
    original: h,
    lower: h.toLowerCase().replace(/[^a-z0-9]/g, ''),
  }));

  // Phone column match
  const phoneCandidates = [
    'whatsapp',
    'whatsappnumber',
    'phone',
    'phonenumber',
    'mobile',
    'cell',
    'contactnumber',
    'telephone',
    'number',
    'tel',
    'callnumber',
  ];
  const phoneMatch = normalized.find((h) => phoneCandidates.some((c) => h.lower.includes(c))) || normalized[0];

  // Name column match
  const nameCandidates = ['name', 'customername', 'fullname', 'clientname', 'leadname', 'customer', 'contact', 'client'];
  const nameMatch = normalized.find((h) => nameCandidates.some((c) => h.lower.includes(c)));

  // Category / Purpose column match
  const categoryCandidates = ['category', 'topic', 'purpose', 'service', 'inquiry', 'product', 'type', 'department', 'city', 'region'];
  const categoryMatch = normalized.find((h) => categoryCandidates.some((c) => h.lower.includes(c)));

  // Notes column match
  const notesCandidates = ['notes', 'remarks', 'comment', 'description', 'detail', 'account', 'address'];
  const notesMatch = normalized.find((h) => notesCandidates.some((c) => h.lower.includes(c)));

  return {
    phoneColumn: phoneMatch ? phoneMatch.original : headers[0] || '',
    nameColumn: nameMatch ? nameMatch.original : headers[1] || headers[0] || '',
    categoryColumn: categoryMatch ? categoryMatch.original : '',
    notesColumn: notesMatch ? notesMatch.original : '',
  };
}

export async function parseExcelFile(file: File): Promise<ExcelParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonRows.length === 0) {
          throw new Error('The selected sheet contains no rows.');
        }

        const headers = Object.keys(jsonRows[0]);
        const suggestedMapping = detectColumnMapping(headers);

        resolve({
          headers,
          rows: jsonRows,
          fileName: file.name,
          suggestedMapping,
        });
      } catch (err: any) {
        reject(new Error(err.message || 'Failed to parse Excel file'));
      }
    };

    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsArrayBuffer(file);
  });
}

// Generate downloadable sample Excel template for WhatsApp calling
export function downloadSampleExcel() {
  const sampleData = [
    {
      'Customer Name': 'David Warner',
      'WhatsApp Number': '+1 555-432-8765',
      'Topic / Purpose': 'Product Demo Inquiry',
      'City / Region': 'Dallas, TX',
      'Account Notes': 'Preferred WhatsApp call in the afternoon',
    },
    {
      'Customer Name': 'Elena Rostova',
      'WhatsApp Number': '+1 555-876-1234',
      'Topic / Purpose': 'VIP Membership Follow-up',
      'City / Region': 'Chicago, IL',
      'Account Notes': 'Interested in onboarding workshop',
    },
    {
      'Customer Name': 'Kwame Mensah',
      'WhatsApp Number': '+1 555-654-9870',
      'Topic / Purpose': 'Service Consultation',
      'City / Region': 'Atlanta, GA',
      'Account Notes': 'Requested brochure sent via WhatsApp',
    },
    {
      'Customer Name': 'Jessica Taylor',
      'WhatsApp Number': '+1 555-321-4567',
      'Topic / Purpose': 'Account Activation',
      'City / Region': 'Seattle, WA',
      'Account Notes': 'Sent WhatsApp catalog link',
    },
    {
      'Customer Name': 'Carlos Santos',
      'WhatsApp Number': '+1 555-901-2345',
      'Topic / Purpose': 'General Support',
      'City / Region': 'Miami, FL',
      'Account Notes': 'Callback requested on WhatsApp',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'WhatsApp Call Leads');

  // Auto-fit column widths
  worksheet['!cols'] = [
    { wch: 20 },
    { wch: 22 },
    { wch: 26 },
    { wch: 18 },
    { wch: 45 },
  ];

  XLSX.writeFile(workbook, 'Sample_WhatsApp_Call_Leads.xlsx');
}
