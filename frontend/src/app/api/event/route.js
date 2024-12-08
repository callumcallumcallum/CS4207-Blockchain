import prisma from '../../../../utils/prisma';

export async function POST(req) {
    try {
      const body = await req.json();
      console.log("Request body:", body);
  
      const { title, description, capacity, name, eventID } = body;
  
      
      if (!title || !description || !capacity) {
        console.error("Could not add event:", body);
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400 }
        );
      }
      
      const newEvent = await prisma.event.create({
        data: {
          title,
          description,
          capacity: parseInt(capacity),
        },
        include: {
          attendee: true
        }
      });
      return new Response(JSON.stringify(newEvent), { status: 201 });
  
    } catch (error) {
      console.error("Error creating event:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create event" }),
        { status: 500 }
      );
    }
  }

  export async function GET(req) {
    try {
      const events = await prisma.event.findMany({
        include: {
          attendee: true,
        },
      });
  
      return new Response(JSON.stringify(events), { status: 200 });
    } catch (error) {
      console.error('Error fetching events with attendees:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch events with attendees' }),
        { status: 500 }
      );
    }
  }
  




