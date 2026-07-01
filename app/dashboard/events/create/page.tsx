"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EventForm, type EventFormValues } from "@/components/events/event-form";
import { useCreateEvent } from "@/hooks/use-events";

export default function CreateEventPage() {
  const router = useRouter();
  const createEvent = useCreateEvent();

  const handleSubmit = (values: EventFormValues) => {
    createEvent.mutate(
      {
        name: values.name,
        category: values.category,
        location: values.location,
        eventDate: values.eventDate,
        capacity: values.capacity,
        hostName: values.hostName,
        hostAvatarUrl: values.hostAvatarUrl || undefined,
        description: values.description || undefined,
      },
      {
        onSuccess: (event) => {
          toast.success(`"${event.name}" event created.`);
          router.push("/dashboard/events");
        },
        onError: () => toast.error("Couldn't create the event. Please try again."),
      }
    );
  };

  return <EventForm submitLabel="Create Event" onSubmit={handleSubmit} isSubmitting={createEvent.isPending} />;
}
