"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TbWorld, TbLock } from "react-icons/tb";
import { CustomSelect } from "@/components/shared/custom-select";
import type { Group, GroupCategory, GroupPrivacy, GroupStatus } from "@/constants/mock-data";
import { CATEGORY_OPTS, STATUS_OPTS } from "@/components/groups/group-meta";

export interface GroupFormValues {
  name: string;
  category: GroupCategory;
  privacy: GroupPrivacy;
  ownerName: string;
  ownerAvatarUrl: string;
  status: GroupStatus;
}

interface GroupFormProps {
  defaultValues?: Group;
  submitLabel: string;
  showStatus?: boolean;
  isSubmitting?: boolean;
  onSubmit: (values: GroupFormValues) => void;
}

export function GroupForm({ defaultValues, submitLabel, showStatus, isSubmitting, onSubmit }: GroupFormProps) {
  const router = useRouter();
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [category, setCategory] = useState<GroupCategory>(defaultValues?.category ?? "Tech");
  const [privacy, setPrivacy] = useState<GroupPrivacy>(defaultValues?.privacy ?? "Public");
  const [status, setStatus] = useState<GroupStatus>(defaultValues?.status ?? "ACTIVE");
  const [ownerName, setOwnerName] = useState(defaultValues?.owner.name ?? "");
  const [ownerAvatarUrl, setOwnerAvatarUrl] = useState(defaultValues?.owner.avatarUrl ?? "");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) { setError("Group name is required."); return; }
    if (!ownerName.trim()) { setError("Owner name is required."); return; }
    setError("");
    onSubmit({ name: name.trim(), category, privacy, status, ownerName: ownerName.trim(), ownerAvatarUrl: ownerAvatarUrl.trim() });
  };

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#0a0f1a]/90 backdrop-blur-md">
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-[20px] font-bold text-white sm:text-[26px]">
              {defaultValues ? "Edit Group" : "Create Group"}
            </h1>
            <p className="mt-1 text-[12.5px] text-caption sm:text-[13px]">
              {defaultValues ? `Update settings for "${defaultValues.name}".` : "Set up a new community group."}
            </p>
          </motion.div>

          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard/groups")}
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

            <Field label="Group Name">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dev_Infrastructure"
                className="w-full rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
              />
            </Field>

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              <Field label="Category">
                <CustomSelect
                  value={category}
                  onChange={(v) => setCategory(v as GroupCategory)}
                  options={CATEGORY_OPTS.map((c) => ({ value: c, label: c }))}
                />
              </Field>

              <Field label="Privacy">
                <div className="flex items-center overflow-hidden rounded-lg border border-white/[0.10]">
                  {(["Public", "Private"] as GroupPrivacy[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPrivacy(p)}
                      className={`flex flex-1 items-center justify-center gap-1.5 px-3.5 py-2.5 text-[12px] font-semibold uppercase tracking-wide transition-colors ${
                        privacy === p ? "bg-blue-600 text-white" : "bg-[#0d1320] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                      }`}
                    >
                      {p === "Public" ? <TbWorld size={13} /> : <TbLock size={13} />}
                      {p}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            {showStatus && (
              <Field label="Status">
                <CustomSelect
                  value={status}
                  onChange={(v) => setStatus(v as GroupStatus)}
                  options={STATUS_OPTS.map((s) => ({ value: s, label: s.charAt(0) + s.slice(1).toLowerCase() }))}
                />
              </Field>
            )}

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              <Field label="Owner Name">
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Marcus Thorne"
                  className="w-full rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
                />
              </Field>

              <Field label="Owner Avatar URL (optional)">
                <input
                  type="text"
                  value={ownerAvatarUrl}
                  onChange={(e) => setOwnerAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
                />
              </Field>
            </div>
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
