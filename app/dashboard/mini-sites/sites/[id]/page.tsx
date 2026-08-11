"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Globe, ExternalLink, Lock, KeyRound, Eye, Calendar, Clock, User, Link2, Copy,
} from "lucide-react";
import { toast } from "sonner";

import { BackButton } from "@/components/shared/back-button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { useMiniSite } from "@/hooks/use-mini-sites";
import { formatNumberFull, formatDate, na, cn } from "@/lib/utils";
import { siteLiveUrl } from "@/app/dashboard/mini-sites/sites/page";
import type { SiteStatus, SiteVisibility } from "@/constants/mini-sites-mock-data";

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const STATUS_STYLE: Record<SiteStatus, { label: string; dot: string; text: string }> = {
  LIVE:      { label: "Live",      dot: "bg-emerald-400", text: "text-emerald-300" },
  DRAFT:     { label: "Draft",     dot: "bg-slate-400",   text: "text-slate-300"   },
  SUSPENDED: { label: "Suspended", dot: "bg-red-400",     text: "text-red-300"     },
};

const VIS_STYLE: Record<SiteVisibility, { label: string; icon: typeof Lock }> = {
  PUBLIC:   { label: "Public",   icon: Globe },
  PRIVATE:  { label: "Private",  icon: Lock },
  PASSWORD: { label: "Password protected", icon: KeyRound },
};

export default function MiniSiteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: site, isLoading } = useMiniSite(id);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-5 p-4 md:p-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!site) {
    return <div className="flex flex-1 items-center justify-center text-muted-foreground">Site not found</div>;
  }

  const st = STATUS_STYLE[site.status];
  const vis = VIS_STYLE[site.visibility];
  const VisIcon = vis.icon;
  const liveUrl = site.url || siteLiveUrl(site.slug);

  const copyUrl = () => {
    navigator.clipboard?.writeText(liveUrl).then(
      () => toast.success("Live link copied."),
      () => toast.error("Couldn't copy the link."),
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1 space-y-5 p-4 md:p-6">
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <BackButton href="/dashboard/mini-sites/sites" />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05]">
              <Globe size={20} strokeWidth={1.8} className="text-stat-icon" />
            </div>
            <h1 className="text-2xl font-bold text-white">{na(site.name)}</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] px-2.5 py-1 text-[11px] font-semibold">
              <span className={cn("h-1.5 w-1.5 rounded-full", st.dot)} />
              <span className={st.text}>{st.label}</span>
            </span>
          </div>
        </motion.div>

        {/* Live link card */}
        <motion.div variants={fadeUp} initial="hidden" animate="show"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#0d1321] p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.05]">
              <Link2 size={16} className="text-[#3b82f6]" />
            </div>
            <div className="min-w-0">
              <p className="text-label">LIVE LINK</p>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer"
                className="block truncate text-[13px] font-medium text-[#99CBFF] hover:text-white">
                {liveUrl}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyUrl}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.12] px-3 py-2 text-[12px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06]">
              <Copy size={13} /> Copy
            </button>
            <a href={liveUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-blue-500">
              <ExternalLink size={13} /> Open Site
            </a>
          </div>
        </motion.div>

        {/* Info grid */}
        <motion.div variants={fadeUp} initial="hidden" animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <InfoCard label="CREATOR" icon={User}>
            <div className="flex items-center gap-2">
              <UserAvatar src={site.creator.avatarUrl} name={site.creator.name} size="sm" />
              <span className="text-sm text-slate-200">{na(site.creator.name)}</span>
            </div>
          </InfoCard>

          <InfoCard label="VISIBILITY" icon={VisIcon}>
            <span className="text-sm text-slate-200">{vis.label}</span>
          </InfoCard>

          <InfoCard label="TOTAL VIEWS" icon={Eye}>
            <span className="text-sm font-semibold text-white">{formatNumberFull(site.views)}</span>
          </InfoCard>

          <InfoCard label="SLUG" icon={Globe}>
            <span className="text-sm text-slate-200">/{site.slug}</span>
          </InfoCard>

          <InfoCard label="CREATED" icon={Calendar}>
            <span className="text-sm text-slate-200">{formatDate(site.createdAt)}</span>
          </InfoCard>

          <InfoCard label="LAST UPDATED" icon={Clock}>
            <span className="text-sm text-slate-200">{formatDate(site.updatedAt)}</span>
          </InfoCard>
        </motion.div>
      </main>
    </div>
  );
}

function InfoCard({ label, icon: Icon, children }: { label: string; icon: typeof Globe; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-4">
      <p className="text-label mb-2 flex items-center gap-1.5">
        <Icon size={12} className="text-caption" /> {label}
      </p>
      {children}
    </div>
  );
}
