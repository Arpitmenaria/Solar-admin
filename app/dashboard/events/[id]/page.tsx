"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TbCircleCheck, TbMapPin } from "react-icons/tb";
import { Search, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { BackButton } from "@/components/shared/back-button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { useEvent, useEventAttendees } from "@/hooks/use-events";
import { formatDate, formatNumberFull, getInitials, cn } from "@/lib/utils";
import { STATUS_STYLES } from "@/components/events/event-meta";
import { EventActionDialog, type PendingEventAction } from "@/components/events/event-action-dialog";
import type { EventAttendee } from "@/constants/mock-data";

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const RSVP_BADGE: Record<EventAttendee["status"], string> = {
  Host: "border-amber-500/30 text-amber-300 bg-amber-500/10",
  Going: "border-blue-500/30 text-blue-300 bg-blue-500/10",
  "Checked In": "border-emerald-500/30 text-emerald-300 bg-emerald-500/10",
  Interested: "border-white/[0.12] text-slate-300 bg-white/[0.03]",
};

const TABS = [
  { value: "about", label: "About" },
  { value: "attendees", label: "Attendees" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

/** Falls back to `fallback` on a missing src or a failed load (broken/unreachable URL). Remounts (and re-tries) whenever `src` changes. */
function ImgWithFallback({ src, className, fallback }: { src?: string; className: string; fallback: React.ReactNode }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <>{fallback}</>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className={className} onError={() => setFailed(true)} />;
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: event, isLoading } = useEvent(id);
  const [attendeePage, setAttendeePage] = useState(1);
  const { data: attendees, isLoading: attendeesLoading } = useEventAttendees(id, { page: attendeePage, limit: 50 });
  const [pendingAction, setPendingAction] = useState<PendingEventAction | null>(null);
  const [tab, setTab] = useState<TabValue>("about");
  const [attendeeSearch, setAttendeeSearch] = useState("");

  const attendeeList = attendees?.data ?? [];
  const filteredAttendees = useMemo(() => {
    const q = attendeeSearch.trim().toLowerCase();
    if (!q) return attendeeList;
    return attendeeList.filter((a) => a.name.toLowerCase().includes(q));
  }, [attendeeList, attendeeSearch]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-5 p-4 md:p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center text-muted-foreground">Event not found</div>
      </div>
    );
  }

  const st = STATUS_STYLES[event.status];

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1 space-y-5 p-4 md:p-6">
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <BackButton href="/dashboard/events" />
        </motion.div>

        {/* Cover image + overlapping avatar */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="relative">
          <div className="relative h-32 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d1321] sm:h-40">
            <ImgWithFallback
              key={event.id}
              src={event.coverUrl}
              className="h-full w-full object-cover"
              fallback={
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#141d33] to-[#0a0f1a]">
                  <CalendarDays size={28} className="text-white/[0.12]" />
                </div>
              }
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
          <div className="absolute -bottom-8 left-6 h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-[#080c16] sm:h-24 sm:w-24">
            <ImgWithFallback
              key={event.id}
              src={event.avatarUrl}
              className="h-full w-full object-cover"
              fallback={
                <div className="flex h-full w-full items-center justify-center bg-[#1a2744] text-lg font-bold text-blue-400">
                  {getInitials(event.name)}
                </div>
              }
            />
          </div>
        </motion.div>

        {/* Title row + manage actions */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4 pl-0 pt-8 sm:flex-row sm:items-start sm:justify-between sm:pl-[136px] sm:pt-0"
        >
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{event.name}</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] px-2.5 py-1 text-[11px] font-semibold">
                <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                <span className={st.text}>{st.label}</span>
              </span>
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              {formatNumberFull(event.attendees)} attending
              <span className="flex items-center gap-1"><TbMapPin size={13} /> {event.location}</span>
              <span className="flex items-center gap-1"><CalendarDays size={13} /> {formatDate(event.eventDate)}</span>
            </p>
          </div>

          {event.status === "CANCELLED" && (
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => setPendingAction({ action: "REINSTATE", eventId: event.id, eventName: event.name })}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-[12px] font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
              >
                <TbCircleCheck size={14} /> Reinstate
              </button>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="relative border-b border-white/[0.08]">
          <div className="flex gap-6">
            {TABS.map((t) => {
              const active = tab === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  className={cn(
                    "relative pb-3 text-xs font-semibold uppercase tracking-wider transition-colors",
                    active ? "text-blue-400" : "text-caption hover:text-white"
                  )}
                >
                  {t.label}
                  {active && <span className="absolute -bottom-px left-0 h-[2px] w-full bg-blue-500" />}
                </button>
              );
            })}
          </div>
        </motion.div>

        {tab === "about" && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-4 md:p-6">
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays size={16} className="text-blue-400" />
              <h2 className="text-sm font-semibold text-white">About this Event</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              {event.description ?? "No description has been provided for this event yet."}
            </p>
          </motion.div>
        )}

        {tab === "attendees" && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="rounded-xl border border-white/[0.08] bg-[#0d1321] overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/[0.06] p-4">
              <div className="relative w-full max-w-[280px]">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3a4d6a]" />
                <input
                  type="text"
                  value={attendeeSearch}
                  onChange={(e) => setAttendeeSearch(e.target.value)}
                  placeholder="Search attendees..."
                  aria-label="Search attendees"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] py-2 pl-9 pr-3 text-[12px] text-slate-200 placeholder:text-[#2e3d57] transition-all focus:border-blue-500/40 focus:bg-white/[0.05] focus:outline-none"
                />
              </div>
              <span className="ml-auto text-[11px] text-caption">
                {attendeesLoading ? "Loading…" : `${filteredAttendees.length} shown`}
              </span>
            </div>

            {attendeesLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
              </div>
            ) : filteredAttendees.length === 0 ? (
              <div className="py-12 text-center text-sm text-caption">No attendees match your search.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Age</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ticket Type</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendees.map((attendee, i) => (
                      <motion.tr
                        key={attendee.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors last:border-b-0"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <UserAvatar name={attendee.name} src={attendee.avatarUrl} size="sm" />
                            <span className="text-white font-medium">{attendee.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{attendee.age ? `${attendee.age} yrs` : "—"}</td>
                        <td className="px-4 py-3 text-slate-300 text-[11px] break-all">{attendee.email || "—"}</td>
                        <td className="px-4 py-3 text-slate-300">{attendee.ticketType || "—"}</td>
                        <td className="px-4 py-3 text-slate-300 font-medium">${attendee.ticketPrice?.toFixed(2) || "0.00"}</td>
                        <td className="px-4 py-3 text-slate-300">{attendee.quantity || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                            attendee.paymentStatus === "paid" ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10" :
                            attendee.paymentStatus === "pending" ? "border-yellow-500/30 text-yellow-300 bg-yellow-500/10" :
                            "border-white/[0.12] text-slate-300 bg-white/[0.03]"
                          )}>
                            {attendee.paymentStatus ? attendee.paymentStatus.charAt(0).toUpperCase() + attendee.paymentStatus.slice(1) : "—"}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!attendeesLoading && filteredAttendees.length > 0 && (
              <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
                <span className="text-[11px] text-slate-400">
                  Showing {((attendeePage - 1) * 50) + 1} to {Math.min(attendeePage * 50, attendees?.total || 0)} of {attendees?.total || 0} attendees
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAttendeePage((p) => Math.max(1, p - 1))}
                    disabled={attendeePage === 1}
                    className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-slate-300 transition-all hover:bg-white/[0.06] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <span className="text-[11px] text-slate-400 min-w-[60px] text-center">
                    Page {attendeePage} of {attendees ? Math.ceil((attendees?.total || 0) / 50) : 1}
                  </span>
                  <button
                    onClick={() => setAttendeePage((p) => p + 1)}
                    disabled={attendeePage >= Math.ceil((attendees?.total || 0) / 50)}
                    className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-slate-300 transition-all hover:bg-white/[0.06] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>

      <EventActionDialog
        pending={pendingAction}
        onClose={() => setPendingAction(null)}
        onSuccess={(action) => { if (action === "DELETE") router.push("/dashboard/events"); }}
      />
    </div>
  );
}
