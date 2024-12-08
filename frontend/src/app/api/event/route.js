import prisma from '../../../../utils/prisma';

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Request body:", body);

    const { title, description, capacity, price } = body;

    // Validate required fields
    if (!title || !description || !capacity || !price) {
      console.error("Missing required fields:", body);
      return new Response(
        JSON.stringify({ error: "Missing required fields: title, description, capacity, and price are required." }),
        { status: 400 }
      );
    }

    // Create a new event
    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        capacity: parseInt(capacity, 10),
        price: parseFloat(price),
      },
      include: {
        attendee: true,
      },
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
    // Fetch all events with attendees
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
