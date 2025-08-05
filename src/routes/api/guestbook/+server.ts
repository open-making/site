import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStore } from '@netlify/blobs';
import { dev } from '$app/environment';

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

// In-memory fallback for local development
let localEntries: GuestbookEntry[] = [];

// Use SvelteKit's dev flag
const isProduction = !dev;

export const GET: RequestHandler = async () => {
  try {
    let entries: GuestbookEntry[];
    
    if (isProduction) {
      // Use Netlify Blobs in production
      const store = getStore("guestbook");
      const entriesData = await store.get(ENTRIES_KEY, { type: "json" });
      entries = entriesData || [];
    } else {
      // Use in-memory storage for local development
      entries = localEntries;
    }
    
    // Sort by timestamp (newest first) and remove IP addresses
    const publicEntries = entries
      .map(entry => {
        const { ip, ...publicEntry } = entry;
        return publicEntry;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return json(publicEntries);
  } catch (error) {
    console.error('GET error:', error);
    return json([], { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, getClientAddress, platform }) => {
  try {
    const body = await request.json();
    const { name, comment, course } = body;

    // Validate input
    if (!name || !comment) {
      return json(
        { error: 'Name and comment are required' },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedName = String(name).trim().substring(0, 100);
    const sanitizedComment = String(comment).trim().substring(0, 500);
    const sanitizedCourse = course ? String(course).trim().substring(0, 50) : undefined;

    if (!sanitizedName || !sanitizedComment) {
      return json(
        { error: 'Name and comment cannot be empty' },
        { status: 400 }
      );
    }

    // Get client IP and location
    const clientIP = getClientAddress();
    let location = 'Unknown';
    
    if (isProduction && platform?.context?.geo) {
      // Use Netlify's geolocation data in production
      const { city, country } = platform.context.geo;
      if (city && country?.name) {
        location = `${city}, ${country.name}`;
      } else if (country?.name) {
        location = country.name;
      }
    } else if (dev) {
      // Mock location for local development only
      location = 'Local Development';
    }

    // Rate limiting (only in production)
    if (isProduction) {
      const store = getStore("guestbook");
      const rateLimitKey = `${RATE_LIMIT_PREFIX}${clientIP}`;
      const lastSubmission = await store.getMetadata(rateLimitKey);
      
      if (lastSubmission && lastSubmission.metadata?.timestamp) {
        const lastTime = new Date(lastSubmission.metadata.timestamp).getTime();
        const now = Date.now();
        const timeDiff = now - lastTime;
        const rateLimit = 60 * 1000; // 1 minute
        
        if (timeDiff < rateLimit) {
          return json(
            { error: "Rate limited. Please wait before submitting again." },
            { status: 429 }
          );
        }
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

    if (isProduction) {
      // Use Netlify Blobs in production
      const store = getStore("guestbook");
      
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
      const rateLimitKey = `${RATE_LIMIT_PREFIX}${clientIP}`;
      await store.set(rateLimitKey, "1", {
        metadata: { timestamp: new Date().toISOString() }
      });
    } else {
      // Use in-memory storage for local development
      localEntries.push(newEntry);
      
      // Keep only last 100 entries for local dev
      if (localEntries.length > 100) {
        localEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        localEntries = localEntries.slice(0, 100);
      }
    }

    // Return the new entry (without IP)
    const { ip, ...publicEntry } = newEntry;
    return json(publicEntry, { status: 201 });
    
  } catch (error) {
    console.error('POST error:', error);
    return json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};

export const DELETE: RequestHandler = async ({ request, url }) => {
  try {
    // Simple authentication check
    const authHeader = request.headers.get('Authorization');
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entryId = url.searchParams.get('id');
    if (!entryId) {
      return json({ error: 'Entry ID is required' }, { status: 400 });
    }

    if (isProduction) {
      // Use Netlify Blobs in production
      const store = getStore("guestbook");
      const existingEntriesData = await store.get(ENTRIES_KEY, { type: "json" });
      const existingEntries: GuestbookEntry[] = existingEntriesData || [];

      const filteredEntries = existingEntries.filter(entry => entry.id !== entryId);
      
      if (filteredEntries.length === existingEntries.length) {
        return json({ error: 'Entry not found' }, { status: 404 });
      }

      await store.setJSON(ENTRIES_KEY, filteredEntries);
    } else {
      // Use in-memory storage for local development
      const initialLength = localEntries.length;
      localEntries = localEntries.filter(entry => entry.id !== entryId);
      
      if (localEntries.length === initialLength) {
        return json({ error: 'Entry not found' }, { status: 404 });
      }
    }

    return json({ success: true, message: 'Entry deleted successfully' });
    
  } catch (error) {
    console.error('DELETE error:', error);
    return json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};