export type LeadStatus =
  | 'pending'
  | 'answered'
  | 'not_answered'
  | 'interested'
  | 'callback'
  | 'wrong_number'
  | 'will_pay'; // legacy mapped to interested

export type UserRole = 'admin' | 'user' | 'agent';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'user';
  createdAt?: string;
}

export interface CallLogEntry {
  id: string;
  timestamp: string;
  agentName: string;
  status: LeadStatus;
  notes?: string;
  screenshotUrl?: string;
  callDurationSeconds?: number;
  followUpDate?: string;
  callType?: 'whatsapp_call' | 'whatsapp_chat' | 'phone';
}

export interface Lead {
  id: string;
  batchId: string;
  batchName: string;
  phoneNumber: string;
  customerName: string;
  category?: string;
  notes?: string;
  customFields?: Record<string, string | number>;
  status: LeadStatus;
  agentName?: string;
  assignedAgent?: string;
  callAttempts: number;
  lastCallTimestamp?: string;
  callDurationSeconds?: number;
  screenshotUrl?: string;
  screenshotTimestamp?: string;
  followUpDate?: string;
  history: CallLogEntry[];
  createdAt: string;
  updatedAt: string;
  // Legacy optional properties for backward compatibility
  amountDue?: number;
  willPayAmount?: number;
  willPayDate?: string;
}

export interface Batch {
  id: string;
  name: string;
  fileName: string;
  totalLeads: number;
  createdAt: string;
  uploadedBy: string;
  stats: {
    pending: number;
    answered: number;
    not_answered: number;
    interested: number;
    callback: number;
    wrong_number: number;
    withScreenshot: number;
  };
}

export interface AgentPerformance {
  agentName: string;
  totalCalls: number;
  answered: number;
  notAnswered: number;
  interested: number;
  callback: number;
  wrongNumber: number;
  screenshotsUploaded: number;
  lastActive: string;
}

export interface OverallStats {
  totalLeads: number;
  pending: number;
  answered: number;
  notAnswered: number;
  interested: number;
  callback: number;
  wrongNumber: number;
  screenshotsUploaded: number;
  completionRate: number;
}
