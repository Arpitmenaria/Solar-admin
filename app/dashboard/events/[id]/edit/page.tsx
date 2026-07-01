"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { EventForm, type EventFormValues } from "@/components/events/event-form";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { useEvent, useUpdateEvent } from "@/hooks/use-events";

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: event, isLoading } = useEvent(id);
  const updateEvent = useUpdateEvent(id);

  const handleSubmit = (values: EventFormValues) => {
    updateEvent.mutate(
      {
        name: values.name,
        category: values.category,
        location: values.location,
        eventDate: values.eventDate,
        capacity: values.capacity,
        status: values.status,
        hostName: values.hostName,
        hostAvatarUrl: values.hostAvatarUrl,
        description: values.description,
      },
      {
        onSuccess: (updated) => {
          toast.success(`"${updated.name}" event updated.`);
          router.push("/dashboard/events");
        },
        onError: () => toast.error("Couldn't update the event. Please try again."),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-5 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!event) {
    return <div className="flex flex-1 items-center justify-center text-muted-foreground">Event not found</div>;
  }

  return (
    <EventForm
      defaultValues={event}
      submitLabel="Save Changes"
      showStatus
      onSubmit={handleSubmit}
      isSubmitting={updateEvent.isPending}
    />
  );
}
