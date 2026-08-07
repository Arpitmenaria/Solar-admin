"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CustomSelect } from "@/components/shared/custom-select";
import type { EventItem, EventStatus } from "@/constants/mock-data";
import { STATUS_OPTS } from "@/components/events/event-meta";
import { useEventCategories } from "@/hooks/use-events";

export interface EventFormValues {
  name: string;
  category: string;
  location: string;
  eventDate: string;
  capacity: number;
  hostName: string;
  hostAvatarUrl: string;
  description: string;
  status: EventStatus;
}

interface EventFormProps {
  defaultValues?: EventItem;
  submitLabel: string;
  showStatus?: boolean;
  isSubmitting?: boolean;
  onSubmit: (values: EventFormValues) => void;
}

export function EventForm({ defaultValues, submitLabel, showStatus, isSubmitting, onSubmit }: EventFormProps) {
  const router = useRouter();
  const { data: categories } = useEventCategories();
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [category, setCategory] = useState(defaultValues?.category ?? "");
  const [location, setLocation] = useState(defaultValues?.location ?? "");
  const [eventDate, setEventDate] = useState(defaultValues?.eventDate ?? "");
  const [capacity, setCapacity] = useState(defaultValues ? String(defaultValues.capacity) : "");
  const [status, setStatus] = useState<EventStatus>(defaultValues?.status ?? "UPCOMING");
  const [hostName, setHostName] = useState(defaultValues?.host.name ?? "");
  const [hostAvatarUrl, setHostAvatarUrl] = useState(defaultValues?.host.avatarUrl ?? "");
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) { setError("Event name is required."); return; }
    if (!category.trim()) { setError("Category is required."); return; }
    if (!location.trim()) { setError("Location is required."); return; }
    if (!eventDate.trim()) { setError("Event date is required."); return; }
    if (!hostName.trim()) { setError("Host name is required."); return; }
    const parsedCapacity = Number(capacity);
    if (capacity === "" || Number.isNaN(parsedCapacity) || parsedCapacity < 0) { setError("Enter a valid, non-negative capacity."); return; }

    setError("");
    onSubmit({
      name: name.trim(),
      category,
      location: location.trim(),
      eventDate: eventDate.trim(),
      capacity: parsedCapacity,
      status,
      hostName: hostName.trim(),
      hostAvatarUrl: hostAvatarUrl.trim(),
      description: description.trim(),
    });
  };

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#0a0f1a]/90 backdrop-blur-md">
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-[20px] font-bold text-white sm:text-[26px]">
              {defaultValues ? "Edit Event" : "Create Event"}
            </h1>
            <p className="mt-1 text-[12.5px] text-caption sm:text-[13px]">
              {defaultValues ? `Update details for "${defaultValues.name}".` : "Set up a new platform event."}
            </p>
          </motion.div>

          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard/events")}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border border-white/[0.12] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:border-white/[0.22] hover:text-white active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 sm:flex-none sm:py-2"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-blue-700 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60 sm:flex-none sm:py-2"
            >
              {isSubmitting ? "Saving…" : submitLabel}
            </button>
          </div>
        </div>
      </div>

      <main className="relative flex-1 px-4 py-6 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="mx-auto max-w-2xl rounded-xl border border-white/[0.08] bg-card p-5 sm:p-7 md:p-8"
        >
          <div className="flex flex-col gap-7">
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-[12px] font-medium text-red-300">
                {error}
              </div>
            )}

            <Field label="Event Name">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Neon Beats: Electronic Night"
                className="w-full rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
              />
            </Field>

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              <Field label="Category">
                <CustomSelect
                  value={category}
                  onChange={setCategory}
                  options={(categories ?? []).map((c) => ({ value: c.name, label: c.name }))}
                />
              </Field>

              <Field label="Location">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Austin, TX"
                  className="w-full rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              <Field label="Event Date">
                <input
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="MM/DD/YYYY"
                  className="w-full rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
                />
              </Field>

              <Field label="Capacity">
                <input
                  type="number"
                  min={0}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="500"
                  className="w-full rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
                />
              </Field>
            </div>

            {showStatus && (
              <Field label="Status">
                <CustomSelect
                  value={status}
                  onChange={(v) => setStatus(v as EventStatus)}
                  options={STATUS_OPTS.map((s) => ({ value: s, label: s.charAt(0) + s.slice(1).toLowerCase() }))}
                />
              </Field>
            )}

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              <Field label="Host Name">
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="e.g. Marcus Thorne"
                  className="w-full rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
                />
              </Field>

              <Field label="Host Avatar URL (optional)">
                <input
                  type="text"
                  value={hostAvatarUrl}
                  onChange={(e) => setHostAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
                />
              </Field>
            </div>

            <Field label="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what attendees can expect..."
                rows={4}
                className="w-full resize-none rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
              />
            </Field>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      {children}
    </div>
  );
}
