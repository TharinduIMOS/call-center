import * as XLSX from 'xlsx';
import type { Lead } from '../types';

export function exportLeadsToExcel(leads: Lead[], batchName?: string) {
  const exportData = leads.map((lead) => ({
    'Lead ID': lead.id,
    'Campaign / Batch': lead.batchName,
    'Customer Name': lead.customerName,
    'WhatsApp Number': lead.phoneNumber,
    'Category / Topic': lead.category || 'General',
    'Call Status': formatStatusLabel(lead.status),
    'Follow-up / Next Date': lead.followUpDate || lead.willPayDate || '',
    'Calling Agent': lead.agentName || lead.assignedAgent || 'Unassigned',
    'Call Attempts': lead.callAttempts,
    'Call Duration (Sec)': lead.callDurationSeconds || 0,
    'Has WhatsApp Screenshot Proof': lead.screenshotUrl ? 'YES' : 'NO',
    'Last Call Time': lead.lastCallTimestamp ? new Date(lead.lastCallTimestamp).toLocaleString() : 'Never Called',
    'Notes / Conversation Log': lead.notes || '',
    'Activity Count': lead.history?.length || 0,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'WhatsApp Outreach Report');

  // Auto column widths
  worksheet['!cols'] = [
    { wch: 18 },
    { wch: 22 },
    { wch: 20 },
    { wch: 20 },
    { wch: 22 },
    { wch: 18 },
    { wch: 22 },
    { wch: 18 },
    { wch: 14 },
    { wch: 18 },
    { wch: 28 },
    { wch: 22 },
    { wch: 45 },
    { wch: 14 },
  ];

  const dateStr = new Date().toISOString().slice(0, 10);
  const safeName = (batchName || 'All_WhatsApp_Leads').replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(workbook, `WhatsApp_Call_Center_Report_${safeName}_${dateStr}.xlsx`);
}

function formatStatusLabel(status: string): string {
  switch (status) {
    case 'interested':
    case 'will_pay':
      return 'INTERESTED';
    case 'answered':
      return 'ANSWERED';
    case 'not_answered':
      return 'NOT ANSWERED';
    case 'callback':
      return 'CALL BACK';
    case 'wrong_number':
      return 'WRONG NUMBER';
    case 'pending':
    default:
      return 'PENDING';
  }
}
