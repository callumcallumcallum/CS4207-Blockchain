import prisma from '../../../../utils/prisma';


export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Request body:", body);

    const { name, eventID } = body;

    if (!name || !eventID) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const eventExists = await prisma.event.findUnique({
      where: { id: eventID },
    });

    if (!eventExists) {
      console.error("Event does not exist for attendee:", eventID);
      return new Response(
        JSON.stringify({ error: "Event does not exist" }),
        { status: 404 }
      );
    }

    const newAttendee = await prisma.attendee.create({
      data: {
        name,
        eventID,
      },
    });

    return new Response(JSON.stringify(newAttendee), { status: 201 });
  } catch (error) {
    console.error("Error adding attendee:", error);
    return new Response(
      JSON.stringify({ error: "Failed to add attendee" }),
      { status: 500 }
    );
  }
}
