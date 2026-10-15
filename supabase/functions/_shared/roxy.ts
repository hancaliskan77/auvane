// The ONLY file that talks to RoxyAPI (spec: single gateway). Swap the service by changing this file only.
// TODO(step 2, blocked): endpoint paths and response shapes are unconfirmed (no API key / docs access yet).
// Fill ENDPOINTS and the mapping functions from roxyapi.com docs; nothing else in the codebase may call Roxy.

export interface RoxyBirth { date: string; time: string; lat: number; lon: number; tz: string }

const ENDPOINTS = { natal: '', humanDesign: '', bazi: '' } as const; // TODO: fill from docs

async function call<T>(path: string, body: unknown): Promise<T> {
  if (!path) throw new Error('RoxyAPI endpoint not configured yet');
  const base = Deno.env.get('ROXY_API_BASE')!, key = Deno.env.get('ROXY_API_KEY')!;
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {        // spec: 3 tries, growing backoff
    try {
      const res = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': key },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Roxy ${res.status}`);
      return (await res.json()) as T;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
    }
  }
  throw lastErr;
}

export const roxy = {
  natal: (b: RoxyBirth) => call<unknown>(ENDPOINTS.natal, b),
  humanDesign: (b: RoxyBirth) => call<unknown>(ENDPOINTS.humanDesign, b),
  bazi: (b: RoxyBirth) => call<unknown>(ENDPOINTS.bazi, b),
};
