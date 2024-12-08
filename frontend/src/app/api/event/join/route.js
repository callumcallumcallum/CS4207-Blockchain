import prisma from '../../../../../utils/prisma';

export async function POST(req) {
    try {
        const body = await req.json();
        console.log("Request body:", body);

        const { blockchainAddress, eventId } = body;

        if (!blockchainAddress || !eventId) {
            console.error("Missing required fields:", body);
            return new Response(
                JSON.stringify({ error: "Missing required fields: blockchainAddress or eventId" }),
                { status: 400 }
            );
        }

        const event = await prisma.event.findUnique({
            where: { id: parseInt(eventId) },
            include: { attendee: true },
        });

        if (!event) {
            return new Response(
                JSON.stringify({ error: "Event not found" }),
                { status: 404 }
            );
        }

        if (event.attendee.length >= event.capacity) {
            return new Response(
                JSON.stringify({ error: "Event is at full capacity" }),
                { status: 400 }
            );
        }

        const newAttendee = await prisma.attendee.create({
            data: {
                blockchainAddress,
                eventID: event.id,
            },
            include: {
                event: true
            }
        });

        return new Response(JSON.stringify(newAttendee), { status: 201 });
    } catch (error) {
        console.error("Error joining event:", error);
        return new Response(
            JSON.stringify({ error: "Failed to join event" }),
            { status: 500 }
        );
    }
}