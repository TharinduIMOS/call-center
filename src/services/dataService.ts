import type {
  Lead,
  Batch,
  OverallStats,
  AgentPerformance,
  UserAccount,
  LeadStatus,
  CallLogEntry,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'cc_users_data',
  ADMIN_PASS: 'cc_admin_pass',
  LEADS: 'cc_leads_data',
  BATCHES: 'cc_batches_data',
};

// Initial admin password default
const DEFAULT_ADMIN_PASSWORD = 'admin123';

// Helper to safely read JSON from localStorage
function getLocalJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setLocalJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write to localStorage (${key}):`, err);
  }
}

// Compute statistics from leads array
export function calculateStats(leads: Lead[]): { overall: OverallStats; agents: AgentPerformance[] } {
  const totalLeads = leads.length;
  let pending = 0;
  let answered = 0;
  let notAnswered = 0;
  let interested = 0;
  let callback = 0;
  let wrongNumber = 0;
  let screenshotsUploaded = 0;

  const agentMap: Record<
    string,
    {
      totalCalls: number;
      answered: number;
      notAnswered: number;
      interested: number;
      callback: number;
      wrongNumber: number;
      screenshotsUploaded: number;
      lastActive: string;
    }
  > = {};

  leads.forEach((lead) => {
    switch (lead.status) {
      case 'pending':
        pending++;
        break;
      case 'answered':
        answered++;
        break;
      case 'not_answered':
        notAnswered++;
        break;
      case 'interested':
      case 'will_pay':
        interested++;
        break;
      case 'callback':
        callback++;
        break;
      case 'wrong_number':
        wrongNumber++;
        break;
    }

    if (lead.screenshotUrl) {
      screenshotsUploaded++;
    }

    const agent = lead.agentName || lead.assignedAgent;
    if (agent) {
      if (!agentMap[agent]) {
        agentMap[agent] = {
          totalCalls: 0,
          answered: 0,
          notAnswered: 0,
          interested: 0,
          callback: 0,
          wrongNumber: 0,
          screenshotsUploaded: 0,
          lastActive: lead.lastCallTimestamp || lead.updatedAt || lead.createdAt,
        };
      }

      if (lead.history && lead.history.length > 0) {
        agentMap[agent].totalCalls += lead.history.length;
        const lastCall = lead.history[lead.history.length - 1];
        if (new Date(lastCall.timestamp) > new Date(agentMap[agent].lastActive)) {
          agentMap[agent].lastActive = lastCall.timestamp;
        }
      }

      if (lead.status === 'answered') agentMap[agent].answered++;
      if (lead.status === 'not_answered') agentMap[agent].notAnswered++;
      if (lead.status === 'interested' || lead.status === 'will_pay') agentMap[agent].interested++;
      if (lead.status === 'callback') agentMap[agent].callback++;
      if (lead.status === 'wrong_number') agentMap[agent].wrongNumber++;
      if (lead.screenshotUrl) agentMap[agent].screenshotsUploaded++;
    }
  });

  const completed = answered + notAnswered + interested + callback + wrongNumber;
  const completionRate = totalLeads > 0 ? Math.round((completed / totalLeads) * 100) : 0;

  const overall: OverallStats = {
    totalLeads,
    pending,
    answered,
    notAnswered,
    interested,
    callback,
    wrongNumber,
    screenshotsUploaded,
    completionRate,
  };

  const agents: AgentPerformance[] = Object.entries(agentMap).map(([agentName, data]) => ({
    agentName,
    totalCalls: data.totalCalls,
    answered: data.answered,
    notAnswered: data.notAnswered,
    interested: data.interested,
    callback: data.callback,
    wrongNumber: data.wrongNumber,
    screenshotsUploaded: data.screenshotsUploaded,
    lastActive: data.lastActive,
  }));

  return { overall, agents };
}

/**
 * Universal Data Service
 * Attempts to use the server API first.
 * If server is not present or returns HTML/404 (e.g. Vercel static hosting),
 * seamlessly falls back to local browser storage so the app NEVER crashes!
 */
export const DataService = {
  // Authentication: Login
  async login(username: string, password: string): Promise<{ user: UserAccount; token: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.user) {
          return { user: data.user, token: data.token || 'token-online' };
        }
        if (!res.ok) {
          throw new Error(data.error || 'Invalid credentials');
        }
      }
      return this.localLogin(username, password);
    } catch (err: any) {
      if (err.message === 'Invalid credentials' || err.message?.includes('Invalid username')) {
        throw err;
      }
      return this.localLogin(username, password);
    }
  },

  localLogin(username: string, password: string): { user: UserAccount; token: string } {
    const cleanUser = username.trim().toLowerCase();
    const storedAdminPass = localStorage.getItem(STORAGE_KEYS.ADMIN_PASS) || DEFAULT_ADMIN_PASSWORD;

    // Check admin
    if (cleanUser === 'admin') {
      if (password === storedAdminPass) {
        const adminUser: UserAccount = {
          id: 'user-admin-root',
          username: 'admin',
          name: 'System Admin',
          role: 'admin',
          createdAt: new Date().toISOString(),
        };
        return { user: adminUser, token: 'local-admin-token' };
      }
      throw new Error('Invalid username or password');
    }

    // Check regular users
    const users = getLocalJson<UserAccount[]>(STORAGE_KEYS.USERS, []);
    const found = users.find((u) => u.username.toLowerCase() === cleanUser);
    if (!found) {
      throw new Error('User not found. Please register first or verify your username.');
    }

    const passwords = getLocalJson<Record<string, string>>('cc_user_passwords', {});
    const expectedPass = passwords[found.id];
    if (expectedPass && expectedPass !== password) {
      throw new Error('Invalid username or password');
    }

    return { user: found, token: `local-token-${found.id}` };
  },

  // Authentication: Register
  async register(name: string, username: string, password: string): Promise<{ user: UserAccount }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.user) {
          return { user: data.user };
        }
        if (!res.ok) {
          throw new Error(data.error || 'Registration failed');
        }
      }
      return this.localRegister(name, username, password);
    } catch (err: any) {
      if (err.message && !err.message.includes('Unexpected') && !err.message.includes('fetch')) {
        throw err;
      }
      return this.localRegister(name, username, password);
    }
  },

  localRegister(name: string, username: string, password: string): { user: UserAccount } {
    const cleanUser = username.trim().toLowerCase();
    if (cleanUser === 'admin') {
      throw new Error('Username "admin" is reserved for Administrator access.');
    }

    const users = getLocalJson<UserAccount[]>(STORAGE_KEYS.USERS, []);
    if (users.some((u) => u.username.toLowerCase() === cleanUser)) {
      throw new Error('Username already exists. Please choose a different username.');
    }

    const newUser: UserAccount = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      username: cleanUser,
      name: name.trim(),
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setLocalJson(STORAGE_KEYS.USERS, users);

    const passwords = getLocalJson<Record<string, string>>('cc_user_passwords', {});
    passwords[newUser.id] = password;
    setLocalJson('cc_user_passwords', passwords);

    return { user: newUser };
  },

  // Change Password
  async changePassword(username: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, currentPassword, newPassword }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok) {
          return { message: data.message || 'Password updated successfully!' };
        }
        throw new Error(data.error || 'Password update failed');
      }
      return this.localChangePassword(username, currentPassword, newPassword);
    } catch (err: any) {
      if (err.message?.includes('incorrect') || err.message?.includes('failed')) {
        throw err;
      }
      return this.localChangePassword(username, currentPassword, newPassword);
    }
  },

  localChangePassword(username: string, currentPassword: string, newPassword: string): { message: string } {
    const cleanUser = username.trim().toLowerCase();
    if (cleanUser === 'admin') {
      const current = localStorage.getItem(STORAGE_KEYS.ADMIN_PASS) || DEFAULT_ADMIN_PASSWORD;
      if (current !== currentPassword) {
        throw new Error('Current password is incorrect');
      }
      localStorage.setItem(STORAGE_KEYS.ADMIN_PASS, newPassword);
      return { message: 'Admin password updated successfully in local storage!' };
    }

    const users = getLocalJson<UserAccount[]>(STORAGE_KEYS.USERS, []);
    const found = users.find((u) => u.username.toLowerCase() === cleanUser);
    if (!found) {
      throw new Error('User account not found');
    }

    const passwords = getLocalJson<Record<string, string>>('cc_user_passwords', {});
    if (passwords[found.id] && passwords[found.id] !== currentPassword) {
      throw new Error('Current password is incorrect');
    }

    passwords[found.id] = newPassword;
    setLocalJson('cc_user_passwords', passwords);
    return { message: 'Password updated successfully!' };
  },

  // Leads & Batches: Fetch
  async fetchAll(): Promise<{ leads: Lead[]; batches: Batch[]; overall: OverallStats; agents: AgentPerformance[] }> {
    try {
      const [leadsRes, batchesRes, statsRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/batches'),
        fetch('/api/stats'),
      ]);

      const isJson = (res: Response) => (res.headers.get('content-type') || '').includes('application/json');

      if (leadsRes.ok && batchesRes.ok && statsRes.ok && isJson(leadsRes)) {
        const leadsData = await leadsRes.json();
        const batchesData = await batchesRes.json();
        const statsData = await statsRes.json();

        // Also sync to local backup
        setLocalJson(STORAGE_KEYS.LEADS, leadsData.leads || []);
        setLocalJson(STORAGE_KEYS.BATCHES, batchesData.batches || []);

        return {
          leads: leadsData.leads || [],
          batches: batchesData.batches || [],
          overall: statsData.overall || {
            totalLeads: 0,
            pending: 0,
            answered: 0,
            notAnswered: 0,
            interested: 0,
            callback: 0,
            wrongNumber: 0,
            screenshotsUploaded: 0,
            completionRate: 0,
          },
          agents: statsData.agents || [],
        };
      }
    } catch {
      // ignore and use local
    }

    // Fallback to local storage
    const leads = getLocalJson<Lead[]>(STORAGE_KEYS.LEADS, []);
    const batches = getLocalJson<Batch[]>(STORAGE_KEYS.BATCHES, []);
    const { overall, agents } = calculateStats(leads);

    return { leads, batches, overall, agents };
  },

  // Save Lead Update
  async updateLead(
    leadId: string,
    update: {
      status: LeadStatus;
      notes: string;
      screenshotUrl?: string;
      callDurationSeconds?: number;
      willPayAmount?: number;
      willPayDate?: string;
    },
    agentName: string
  ): Promise<Lead> {
    try {
      const res = await fetch(`/api/leads/${leadId}/call-update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...update, agentName }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.lead) return data.lead;
      }
    } catch {
      // fallback to local
    }

    // Local update
    const leads = getLocalJson<Lead[]>(STORAGE_KEYS.LEADS, []);
    const index = leads.findIndex((l) => l.id === leadId);
    if (index === -1) {
      throw new Error('Lead not found in local records');
    }

    const existing = leads[index];
    const callEntry: CallLogEntry = {
      id: `call-${Date.now()}`,
      timestamp: new Date().toISOString(),
      agentName,
      status: update.status,
      callDurationSeconds: update.callDurationSeconds || 0,
      notes: update.notes,
      screenshotUrl: update.screenshotUrl || existing.screenshotUrl,
    };

    const updatedLead: Lead = {
      ...existing,
      status: update.status,
      notes: update.notes || existing.notes,
      agentName: agentName || existing.agentName,
      assignedAgent: agentName || existing.assignedAgent,
      lastCallTimestamp: new Date().toISOString(),
      callDurationSeconds: update.callDurationSeconds || existing.callDurationSeconds,
      callAttempts: (existing.callAttempts || 0) + 1,
      history: [...(existing.history || []), callEntry],
      screenshotUrl: update.screenshotUrl || existing.screenshotUrl,
      screenshotTimestamp: update.screenshotUrl ? new Date().toISOString() : existing.screenshotTimestamp,
      willPayAmount: update.willPayAmount !== undefined ? update.willPayAmount : existing.willPayAmount,
      willPayDate: update.willPayDate || existing.willPayDate,
      updatedAt: new Date().toISOString(),
    };

    leads[index] = updatedLead;
    setLocalJson(STORAGE_KEYS.LEADS, leads);
    return updatedLead;
  },

  // Import Batch
  async importBatch(
    batchName: string,
    fileName: string,
    leadsData: Array<{
      phoneNumber: string;
      customerName: string;
      category?: string;
      notes?: string;
      assignedAgent?: string;
      customFields?: Record<string, any>;
    }>,
    uploadedBy: string,
    currentUserRole?: string
  ): Promise<{ batch: Batch; leads: Lead[] }> {
    try {
      const res = await fetch('/api/leads/batch-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUserRole || 'admin',
        },
        body: JSON.stringify({ batchName, fileName, leads: leadsData, uploadedBy }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        return { batch: data.batch, leads: data.leads };
      }
    } catch {
      // fallback to local
    }

    // Local Import
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const nowIso = new Date().toISOString();

    const newLeads: Lead[] = leadsData.map((item, idx) => ({
      id: `lead-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
      batchId,
      batchName,
      phoneNumber: item.phoneNumber,
      customerName: item.customerName,
      category: item.category || 'General Outreach',
      status: 'pending',
      notes: item.notes || '',
      assignedAgent: item.assignedAgent,
      callAttempts: 0,
      history: [],
      customFields: item.customFields,
      createdAt: nowIso,
      updatedAt: nowIso,
    }));

    const newBatch: Batch = {
      id: batchId,
      name: batchName,
      fileName,
      totalLeads: leadsData.length,
      createdAt: nowIso,
      uploadedBy,
      stats: {
        pending: leadsData.length,
        answered: 0,
        not_answered: 0,
        interested: 0,
        callback: 0,
        wrong_number: 0,
        withScreenshot: 0,
      },
    };

    const existingBatches = getLocalJson<Batch[]>(STORAGE_KEYS.BATCHES, []);
    const existingLeads = getLocalJson<Lead[]>(STORAGE_KEYS.LEADS, []);

    setLocalJson(STORAGE_KEYS.BATCHES, [newBatch, ...existingBatches]);
    setLocalJson(STORAGE_KEYS.LEADS, [...newLeads, ...existingLeads]);

    return { batch: newBatch, leads: newLeads };
  },

  // Delete Batch
  async deleteBatch(batchId: string): Promise<void> {
    try {
      const res = await fetch(`/api/batches/${batchId}`, { method: 'DELETE' });
      if (res.ok) return;
    } catch {
      // fallback
    }

    const existingBatches = getLocalJson<Batch[]>(STORAGE_KEYS.BATCHES, []);
    const existingLeads = getLocalJson<Lead[]>(STORAGE_KEYS.LEADS, []);

    setLocalJson(
      STORAGE_KEYS.BATCHES,
      existingBatches.filter((b) => b.id !== batchId)
    );
    setLocalJson(
      STORAGE_KEYS.LEADS,
      existingLeads.filter((l) => l.batchId !== batchId)
    );
  },

  // Clear all call history
  async clearCallHistory(): Promise<void> {
    try {
      const res = await fetch('/api/admin/clear-all-call-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
      });
      if (res.ok) return;
    } catch {
      // fallback
    }

    const existingLeads = getLocalJson<Lead[]>(STORAGE_KEYS.LEADS, []);
    const nowIso = new Date().toISOString();
    const cleared = existingLeads.map((l) => ({
      ...l,
      status: 'pending' as const,
      callAttempts: 0,
      history: [],
      notes: '',
      screenshotUrl: undefined,
      lastCallTimestamp: undefined,
      updatedAt: nowIso,
    }));
    setLocalJson(STORAGE_KEYS.LEADS, cleared);
  },

  // Reset demo
  async resetDemo(): Promise<void> {
    try {
      const res = await fetch('/api/reset-demo', { method: 'POST' });
      if (res.ok) return;
    } catch {
      // fallback
    }

    const nowIso = new Date().toISOString();
    const sampleLeads: Lead[] = [
      {
        id: 'lead-s1',
        batchId: 'batch-demo-1',
        batchName: 'Initial Customer Ready Leads',
        phoneNumber: '+94771234567',
        customerName: 'Dinesh Perera',
        category: 'Inquiry - Enterprise',
        status: 'pending',
        notes: 'Requested WhatsApp demo for team',
        callAttempts: 0,
        history: [],
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        id: 'lead-s2',
        batchId: 'batch-demo-1',
        batchName: 'Initial Customer Ready Leads',
        phoneNumber: '+94719876543',
        customerName: 'Kavindi Silva',
        category: 'Subscription Renewal',
        status: 'pending',
        notes: 'Follow up on payment link',
        callAttempts: 0,
        history: [],
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        id: 'lead-s3',
        batchId: 'batch-demo-1',
        batchName: 'Initial Customer Ready Leads',
        phoneNumber: '+94703456789',
        customerName: 'Saman Fernando',
        category: 'VIP Client',
        status: 'pending',
        notes: 'Send quotation via WhatsApp',
        callAttempts: 0,
        history: [],
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    ];

    setLocalJson(STORAGE_KEYS.LEADS, sampleLeads);
    setLocalJson(STORAGE_KEYS.BATCHES, [
      {
        id: 'batch-demo-1',
        name: 'Initial Customer Ready Leads',
        fileName: 'sample_leads.xlsx',
        totalLeads: sampleLeads.length,
        createdAt: nowIso,
        uploadedBy: 'System Admin',
        stats: {
          pending: sampleLeads.length,
          answered: 0,
          not_answered: 0,
          interested: 0,
          callback: 0,
          wrong_number: 0,
          withScreenshot: 0,
        },
      },
    ]);
  },
};
