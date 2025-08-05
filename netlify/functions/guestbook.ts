import { getStore } from '@netlify/blobs';

interface GuestbookEntry {
  id: string;
  name: string;
  comment: string;
  course?: string;
  location: string;
  timestamp: string;
  ip?: string;
}

const ENTRIES_KEY = "entries";
const RATE_LIMIT_PREFIX = "rate_limit_";

export default async function handler(req, context) {
  const { method } = req;
  const url = new URL(req.url);

  try {
    if (method === 'GET') {
      return await handleGet();
    } else if (method === 'POST') {
      return await handlePost(req, context);
    } else if (method === 'DELETE') {
      return await handleDelete(req);
    } else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Handler error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleGet() {
  const store = getStore("guestbook");
  const entriesData = await store.get(ENTRIES_KEY, { type: "json" });
  const entries: GuestbookEntry[] = entriesData || [];
  
  // Sort by timestamp (newest first) and remove IP addresses
  const publicEntries = entries
    .map(entry => {
      const { ip, ...publicEntry } = entry;
      return publicEntry;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return new Response(JSON.stringify(publicEntries), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handlePost(req, context) {
  const body = await req.json();
  const { name, comment, course } = body;

  // Validate input
  if (!name || !comment) {
    return new Response(JSON.stringify({ error: 'Name and comment are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Sanitize input
  const sanitizedName = String(name).trim().substring(0, 100);
  const sanitizedComment = String(comment).trim().substring(0, 500);
  const sanitizedCourse = course ? String(course).trim().substring(0, 50) : undefined;

  if (!sanitizedName || !sanitizedComment) {
    return new Response(JSON.stringify({ error: 'Name and comment cannot be empty' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Get client IP and location
  const clientIP = context.ip;
  let location = 'Unknown';
  
  if (context.geo) {
    const { city, country } = context.geo;
    if (city && country?.name) {
      location = `${city}, ${country.name}`;
    } else if (country?.name) {
      location = country.name;
    }
  }

  const store = getStore("guestbook");

  // Rate limiting
  const rateLimitKey = `${RATE_LIMIT_PREFIX}${clientIP}`;
  const lastSubmission = await store.getMetadata(rateLimitKey);
  
  if (lastSubmission && lastSubmission.metadata?.timestamp) {
    const lastTime = new Date(lastSubmission.metadata.timestamp).getTime();
    const now = Date.now();
    const timeDiff = now - lastTime;
    const rateLimit = 60 * 1000; // 1 minute
    
    if (timeDiff < rateLimit) {
      return new Response(JSON.stringify({ error: "Rate limited. Please wait before submitting again." }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Create new entry
  const newEntry: GuestbookEntry = {
    id: crypto.randomUUID(),
    name: sanitizedName,
    comment: sanitizedComment,
    course: sanitizedCourse,
    location,
    timestamp: new Date().toISOString(),
    ip: clientIP,
  };

  // Get existing entries
  const existingEntriesData = await store.get(ENTRIES_KEY, { type: "json" });
  const existingEntries: GuestbookEntry[] = existingEntriesData || [];

  // Add new entry
  existingEntries.push(newEntry);

  // Keep only last 1000 entries
  if (existingEntries.length > 1000) {
    existingEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    existingEntries.splice(1000);
  }

  // Save back to store
  await store.setJSON(ENTRIES_KEY, existingEntries);

  // Update rate limit
  await store.set(rateLimitKey, "1", {
    metadata: { timestamp: new Date().toISOString() }
  });

  // Return the new entry (without IP)
  const { ip, ...publicEntry } = newEntry;
  return new Response(JSON.stringify(publicEntry), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleDelete(req) {
  // Simple authentication check
  const authHeader = req.headers.get('Authorization');
  const adminPassword = process.env.ADMIN_PASSWORD || 'timmy8828';
  
  if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const url = new URL(req.url);
  const entryId = url.searchParams.get('id');
  if (!entryId) {
    return new Response(JSON.stringify({ error: 'Entry ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const store = getStore("guestbook");
  const existingEntriesData = await store.get(ENTRIES_KEY, { type: "json" });
  const existingEntries: GuestbookEntry[] = existingEntriesData || [];

  const filteredEntries = existingEntries.filter(entry => entry.id !== entryId);
  
  if (filteredEntries.length === existingEntries.length) {
    return new Response(JSON.stringify({ error: 'Entry not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  await store.setJSON(ENTRIES_KEY, filteredEntries);

  return new Response(JSON.stringify({ success: true, message: 'Entry deleted successfully' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}