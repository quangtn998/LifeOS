import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CalendarEvent {
  summary: string;
  start: string;
  end: string;
  description?: string;
}

function parseICalDate(dateStr: string): Date {
  // Handle both DATE and DATETIME formats
  // DATETIME: 20240315T100000Z or 20240315T100000
  // DATE: 20240315
  const cleanStr = dateStr.replace(/[:\-]/g, '');
  
  if (cleanStr.includes('T')) {
    // DateTime format
    const year = parseInt(cleanStr.substring(0, 4));
    const month = parseInt(cleanStr.substring(4, 6)) - 1;
    const day = parseInt(cleanStr.substring(6, 8));
    const hour = parseInt(cleanStr.substring(9, 11));
    const minute = parseInt(cleanStr.substring(11, 13));
    const second = parseInt(cleanStr.substring(13, 15)) || 0;
    
    if (cleanStr.endsWith('Z')) {
      return new Date(Date.UTC(year, month, day, hour, minute, second));
    }
    return new Date(year, month, day, hour, minute, second);
  } else {
    // Date only format
    const year = parseInt(cleanStr.substring(0, 4));
    const month = parseInt(cleanStr.substring(4, 6)) - 1;
    const day = parseInt(cleanStr.substring(6, 8));
    return new Date(year, month, day);
  }
}

function parseICalData(icalText: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const lines = icalText.split(/\r?\n/);
  
  let currentEvent: Partial<CalendarEvent> | null = null;
  let currentField = '';
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Handle line folding (lines starting with space or tab)
    while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
      line += lines[i + 1].substring(1);
      i++;
    }
    
    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = {};
    } else if (line.startsWith('END:VEVENT') && currentEvent) {
      if (currentEvent.summary && currentEvent.start && currentEvent.end) {
        events.push(currentEvent as CalendarEvent);
      }
      currentEvent = null;
    } else if (currentEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.summary = line.substring(8);
      } else if (line.startsWith('DTSTART')) {
        const value = line.split(':')[1];
        if (value) {
          currentEvent.start = parseICalDate(value).toISOString();
        }
      } else if (line.startsWith('DTEND')) {
        const value = line.split(':')[1];
        if (value) {
          currentEvent.end = parseICalDate(value).toISOString();
        }
      } else if (line.startsWith('DESCRIPTION:')) {
        currentEvent.description = line.substring(12);
      }
    }
  }
  
  return events;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { icalUrl } = await req.json();
    
    if (!icalUrl) {
      return new Response(
        JSON.stringify({ error: 'iCalUrl is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Fetch iCal data
    const response = await fetch(icalUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch iCal: ${response.statusText}`);
    }
    
    const icalText = await response.text();
    const events = parseICalData(icalText);

    return new Response(
      JSON.stringify({ events }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching iCal:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});