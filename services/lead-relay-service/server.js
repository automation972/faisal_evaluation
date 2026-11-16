/**
 * Y10 CRM — Lead Relay Service
 * ---------------------------------------------------------------------------
 * A standalone Node.js backend service (zero dependencies — pure node:http).
 *
 * Purpose:
 *   External lead providers (landing-page builders, ad platforms, form tools
 *   such as Typeform / HubSpot / Zapier) cannot always POST directly to the
 *   CRM intake API with the correct shape and headers. This relay sits in
 *   front of the CRM and:
 *
 *     1. Accepts lead payloads as JSON **or** urlencoded form bodies
 *     2. Normalizes provider-specific field names (firstName / first_name /
 *        fname, phone / tel, etc.) into the CRM intake contract
 *     3. Stamps relay metadata (source service, received-at, dedupe id)
 *     4. Forwards the lead to the CRM intake endpoint with the x-api-key
 *     5. Retries transient failures with exponential backoff
 *
 * Configuration (environment variables):
 *   RELAY_PORT        — port to listen on                 (default 4050)
 *   INGEST_URL        — CRM intake endpoint               (default http://localhost:3000/api/v1/leads/ingest)
 *   INGEST_API_KEY    — CRM intake API key                (required for forwarding)
 *   RELAY_SECRET      — shared secret providers must send (optional)
 *
 * Endpoints:
 *   POST /webhook   — receive + forward a lead
 *   GET  /health    — liveness probe
 * ---------------------------------------------------------------------------
 */

import http from 'node:http';
import crypto from 'node:crypto';

const PORT = Number(process.env.RELAY_PORT || 4050);
const INGEST_URL = process.env.INGEST_URL || 'http://localhost:3000/api/v1/leads/ingest';
const INGEST_API_KEY = process.env.INGEST_API_KEY || '';
const RELAY_SECRET = process.env.RELAY_SECRET || '';

const MAX_BODY_BYTES = 32 * 1024;
const FORWARD_RETRIES = 3;

/** Provider field aliases → CRM intake contract. */
const FIELD_ALIASES = {
  firstname: 'firstName', first_name: 'firstName', fname: 'firstName', given_name: 'firstName',
  lastname: 'lastName', last_name: 'lastName', lname: 'lastName', surname: 'lastName',
  mail: 'email', email_address: 'email', emailaddress: 'email',
  tel: 'phone', telephone: 'phone', mobile: 'phone', phone_number: 'phone',
  organization: 'company', org: 'company', company_name: 'company',
  jobtitle: 'jobTitle', job_title: 'jobTitle', title: 'jobTitle', role: 'jobTitle',
  lead_source: 'source', form_source: 'source',
  estimated_value: 'value', deal_value: 'value', budget: 'value',
  message: 'notes', comment: 'notes', comments: 'notes', details: 'notes',
};

/** Normalize any provider payload into the CRM intake contract. */
function normalizeLead(raw) {
  const lead = {};
  for (const [key, value] of Object.entries(raw)) {
    const canonical = FIELD_ALIASES[key.toLowerCase().trim()] || key;
    if (lead[canonical] === undefined && value !== '' && value !== null) {
      lead[canonical] = typeof value === 'string' ? value.trim() : value;
    }
  }
  if (typeof lead.value === 'string') {
    const parsed = Number(lead.value.replace(/[^0-9.]/g, ''));
    lead.value = Number.isFinite(parsed) ? parsed : 0;
  }
  if (lead.source) lead.source = String(lead.source).toUpperCase().replace(/[\s-]+/g, '_');
  return lead;
}

/** Parse a request body as JSON or urlencoded, whichever matches. */
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('Payload too large'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8');
      const contentType = String(req.headers['content-type'] || '');
      try {
        if (contentType.includes('application/json')) {
          resolve(text ? JSON.parse(text) : {});
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          resolve(Object.fromEntries(new URLSearchParams(text)));
        } else {
          // Best-effort: try JSON first, fall back to urlencoded.
          try { resolve(JSON.parse(text)); }
          catch { resolve(Object.fromEntries(new URLSearchParams(text))); }
        }
      } catch (err) {
        reject(Object.assign(new Error('Malformed request body'), { statusCode: 400 }));
      }
    });
    req.on('error', reject);
  });
}

/** Forward the normalized lead to the CRM intake API with retries. */
async function forwardToCrm(lead, dedupeId) {
  if (!INGEST_API_KEY) {
    throw Object.assign(new Error('Relay is not configured: missing INGEST_API_KEY'), { statusCode: 503 });
  }

  let lastError = null;
  for (let attempt = 1; attempt <= FORWARD_RETRIES; attempt += 1) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      const res = await fetch(INGEST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': INGEST_API_KEY,
          'x-relay-dedupe-id': dedupeId,
        },
        body: JSON.stringify(lead),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const payload = await res.json().catch(() => ({}));
      if (res.ok) return { status: res.status, payload };

      // 4xx (except 429) are permanent — do not retry.
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        return { status: res.status, payload };
      }
      lastError = new Error(`CRM responded ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    if (attempt < FORWARD_RETRIES) {
      await new Promise((r) => setTimeout(r, 400 * 2 ** (attempt - 1)));
    }
  }
  throw Object.assign(lastError || new Error('CRM unreachable'), { statusCode: 502 });
}

function sendJson(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) });
  res.end(data);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    return sendJson(res, 200, {
      service: 'y10-lead-relay',
      runtime: `node ${process.version}`,
      status: 'ok',
      ingestConfigured: Boolean(INGEST_API_KEY),
      uptimeSec: Math.round(process.uptime()),
    });
  }

  if (req.method === 'POST' && url.pathname === '/webhook') {
    try {
      if (RELAY_SECRET) {
        const provided = req.headers['x-relay-secret'];
        if (provided !== RELAY_SECRET) {
          return sendJson(res, 401, { success: false, error: 'Invalid relay secret' });
        }
      }

      const raw = await parseBody(req);
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return sendJson(res, 400, { success: false, error: 'Request body must be a JSON object or form payload' });
      }

      const lead = normalizeLead(raw);
      if (!lead.firstName || !lead.lastName) {
        return sendJson(res, 422, { success: false, error: 'firstName and lastName are required after normalization' });
      }

      const dedupeId = crypto.createHash('sha256')
        .update(`${lead.firstName}|${lead.lastName}|${lead.email || ''}|${lead.phone || ''}`)
        .digest('hex')
        .slice(0, 24);

      const result = await forwardToCrm(lead, dedupeId);
      return sendJson(res, result.status === 201 ? 201 : result.status, {
        success: true,
        relayed: true,
        dedupeId,
        crm: result.payload,
      });
    } catch (err) {
      const status = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
      return sendJson(res, status, { success: false, error: err.message || 'Relay failure' });
    }
  }

  return sendJson(res, 404, { success: false, error: 'Not found. Use POST /webhook or GET /health' });
});

server.listen(PORT, () => {
  console.log(`[lead-relay] Node.js ${process.version} listening on :${PORT}`);
  console.log(`[lead-relay] forwarding to ${INGEST_URL} (${INGEST_API_KEY ? 'api key configured' : 'NO API KEY'})`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`[lead-relay] ${signal} received — shutting down`);
    server.close(() => process.exit(0));
  });
}
