"use client";

import { toast } from "sonner";
import { motion } from "framer-motion";
import { UserPlus, FileWarning, MessageSquareWarning, MailWarning, ShieldAlert, type LucideIcon } from "lucide-react";
import { Switch, Skeleton } from "@/components/ui";
import { useNotificationSettings, useUpdateNotificationSettings } from "@/hooks/use-notification-settings";
import type { NotificationSettings } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const SETTING_ROWS: { key: keyof NotificationSettings; label: string; desc: string; icon: LucideIcon }[] = [
  { key: "newUser",       label: "New User Signups",  desc: "Alert when a new user registers on the platform.", icon: UserPlus },
  { key: "postReport",    label: "Post Reports",      desc: "Alert when a post is reported by a user.",         icon: FileWarning },
  { key: "commentReport", label: "Comment Reports",   desc: "Alert when a comment is reported by a user.",      icon: MessageSquareWarning },
  { key: "messageReport", label: "Message Reports",   desc: "Alert when a direct message is reported.",         icon: MailWarning },
  { key: "groupReport",   label: "Group Reports",     desc: "Alert when a group is reported by a user.",        icon: ShieldAlert },
];

export default function NotificationSettingsPage() {
  const { data: settings, isLoading } = useNotificationSettings();
  const { mutate: save } = useUpdateNotificationSettings();

  function handleToggle(key: keyof NotificationSettings, checked: boolean) {
    if (!settings) return;
    save(
      { ...settings, [key]: checked },
      { onError: (err) => toast.error(err.message || "Couldn't save notification settings. Please try again.") }
    );
  }

  return (
    <main className="flex-1 space-y-5 p-4 md:p-6">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="text-[26px] font-bold text-white leading-snug">Notification Settings</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-caption">
          Choose which platform events trigger an alert for admins. Changes save automatically.
        </p>
      </motion.div>

      <motion.div
        variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.08 }}
        className="rounded-xl border border-white/[0.07] bg-card p-2"
      >
        {isLoading || !settings ? (
          <div className="space-y-1 p-3">
            {SETTING_ROWS.map((row) => (
              <div key={row.key} className="flex items-center gap-4 py-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-5 w-9 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          SETTING_ROWS.map((row, i) => {
            const Icon = row.icon;
            return (
              <div
                key={row.key}
                className={
                  "flex items-center gap-4 px-3 py-4" +
                  (i !== SETTING_ROWS.length - 1 ? " border-b border-white/[0.05]" : "")
                }
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-blue-400">
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-white">{row.label}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-caption">{row.desc}</p>
                </div>
                <Switch
                  checked={settings[row.key]}
                  onCheckedChange={(checked) => handleToggle(row.key, checked)}
                  aria-label={row.label}
                />
              </div>
            );
          })
        )}
      </motion.div>
    </main>
  );
}
