import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/edge-functions";

interface GuestbookEntry {
  id: string;
  name: string;
  comment: string;
  location: string;
  timestamp: string;
  ip?: string;
}

const ENTRIES_KEY = "entries";
const RATE_LIMIT_PREFIX = "rate_limit_";

export default async (request: Request, context: Context) => {
  const store = getStore("guestbook");

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (request.method === "GET") {
      // Get all guestbook entries
      const entriesData = await store.get(ENTRIES_KEY, { type: "json" });
      const entries: GuestbookEntry[] = entriesData || [];
      
      // Sort by timestamp (newest first)
      entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      return new Response(JSON.stringify(entries), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    if (request.method === "POST") {
      // Rate limiting check
      const clientIP = context.ip;
      const rateLimitKey = `${RATE_LIMIT_PREFIX}${clientIP}`;
      const lastSubmission = await store.getMetadata(rateLimitKey);
      
      if (lastSubmission && lastSubmission.metadata?.timestamp) {
        const lastTime = new Date(lastSubmission.metadata.timestamp).getTime();
        const now = Date.now();
        const timeDiff = now - lastTime;
        const rateLimit = 60 * 1000; // 1 minute
        
        if (timeDiff < rateLimit) {
          return new Response(
            JSON.stringify({ error: "Rate limited. Please wait before submitting again." }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }
      }

      // Parse request body
      let body: any;
      try {
        body = await request.json();
      } catch {
        return new Response(
          JSON.stringify({ error: "Invalid JSON in request body" }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }

      const { name, comment } = body;

      // Validate input
      if (!name || !comment) {
        return new Response(
          JSON.stringify({ error: "Name and comment are required" }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }

      // Sanitize input (basic)
      const sanitizedName = String(name).trim().substring(0, 100);
      const sanitizedComment = String(comment).trim().substring(0, 500);

      if (!sanitizedName || !sanitizedComment) {
        return new Response(
          JSON.stringify({ error: "Name and comment cannot be empty" }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }

      // Get location from geolocation context
      let location = "Unknown";
      if (context.geo) {
        const { city, country } = context.geo;
        if (city && country?.name) {
          location = `${city}, ${country.name}`;
        } else if (country?.name) {
          location = country.name;
        }
      }

      // Create new entry
      const newEntry: GuestbookEntry = {
        id: crypto.randomUUID(),
        name: sanitizedName,
        comment: sanitizedComment,
        location,
        timestamp: new Date().toISOString(),
        ip: clientIP, // Store for potential moderation, but don't expose in GET
      };

      // Get existing entries
      const existingEntriesData = await store.get(ENTRIES_KEY, { type: "json" });
      const existingEntries: GuestbookEntry[] = existingEntriesData || [];

      // Add new entry
      existingEntries.push(newEntry);

      // Keep only last 1000 entries to prevent unlimited growth
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
      const publicEntry = { ...newEntry };
      delete publicEntry.ip;

      return new Response(JSON.stringify(publicEntry), {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Method not allowed
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Guestbook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

export const config = {
  path: "/api/guestbook"
};