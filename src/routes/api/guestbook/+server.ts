import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// In-memory storage for local development
let entries: Array<{
  id: string;
  name: string;
  comment: string;
  location: string;
  timestamp: string;
}> = [];

export const GET: RequestHandler = async () => {
  // Sort by timestamp (newest first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return json(sortedEntries);
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, comment } = body;

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

    if (!sanitizedName || !sanitizedComment) {
      return json(
        { error: 'Name and comment cannot be empty' },
        { status: 400 }
      );
    }

    // Create new entry (with mock location for local dev)
    const newEntry = {
      id: crypto.randomUUID(),
      name: sanitizedName,
      comment: sanitizedComment,
      location: 'Local Development', // Mock location
      timestamp: new Date().toISOString(),
    };

    // Add to entries
    entries.push(newEntry);

    // Keep only last 100 entries for local dev
    if (entries.length > 100) {
      entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      entries = entries.slice(0, 100);
    }

    return json(newEntry, { status: 201 });
  } catch (error) {
    console.error('Guestbook error:', error);
    return json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};