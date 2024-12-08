import prisma from "../../../utils/prisma";
import EventsClient from "./EventsClient";

export default async function EventsPage() {
    // Fetch events from the database
    const events = await prisma.event.findMany({
        include: { attendee: true },
    });

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
            <h1 className="text-4xl font-bold mb-6">Events</h1>
            <EventsClient events={events} />
        </div>
    );
}
