/**
 * Safe fetch wrapper that intercepts HTML/SPA fallback errors 
 * (common when deploying full-stack apps to Vercel/Netlify without serverless routing).
 */
export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; status: number; data: T; error?: string }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      const text = await res.text();
      if (text.includes('<!DOCTYPE') || text.includes('<html') || text.includes('<!doctype')) {
        return {
          ok: false,
          status: res.status,
          data: null as any,
          error:
            'Backend API returned HTML instead of JSON. If hosted on Vercel, ensure vercel.json and api/index.ts are deployed to your repository.',
        };
      }
      return {
        ok: false,
        status: res.status,
        data: null as any,
        error: `Unexpected server response: ${text.slice(0, 150)}`,
      };
    }

    const data = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data,
        error: data?.error || `Server returned error status (${res.status})`,
      };
    }

    return {
      ok: true,
      status: res.status,
      data,
    };
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (msg.includes('Unexpected token') && (msg.includes('JSON') || msg.includes('<'))) {
      return {
        ok: false,
        status: 500,
        data: null as any,
        error:
          'Backend returned an HTML webpage instead of JSON data. Please verify your hosting provider has backend API routing enabled.',
      };
    }
    return {
      ok: false,
      status: 0,
      data: null as any,
      error: msg || 'Network connection failed',
    };
  }
}
