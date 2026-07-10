"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreatePlanButton } from "@/components/plans/create-plan-button";
import { BackButton } from "@/components/shared/back-button";
import type { CreatePlanInput } from "@/services/plans.service";
import type { Plan, PlanTier, PlanBillingType } from "@/types";

const DURATION_OPTIONS: { value: PlanBillingType; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

const TIER_OPTIONS: { value: PlanTier; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "gold", label: "Gold" },
  { value: "platinum", label: "Platinum" },
];

function tierLabel(tier: PlanTier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

interface PlanFormProps {
  defaultValues?: Plan;
  submitLabel: string;
  onSubmit: (input: CreatePlanInput) => void;
  isSubmitting?: boolean;
}

export function PlanForm({ defaultValues, submitLabel, onSubmit, isSubmitting }: PlanFormProps) {
  const [price, setPrice] = useState(defaultValues ? String(defaultValues.price) : "");
  const [featuresText, setFeaturesText] = useState(defaultValues?.features.join("\n") ?? "");
  const [duration, setDuration] = useState<PlanBillingType>(defaultValues?.type ?? "monthly");
  const [tier, setTier] = useState<PlanTier>(defaultValues?.tier ?? "free");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const parsedPrice = Number(price);

    if (price === "" || Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Enter a valid, non-negative price.");
      return;
    }

    const features = featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    if (features.length === 0) {
      setError("Add at least one feature.");
      return;
    }

    setError("");
    onSubmit({
      tier,
      type: duration,
      price: parsedPrice,
      features,
    });
  };

  return (
    <>
      <div className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#0a0f1a]/90 backdrop-blur-md">
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <BackButton href="/dashboard/plans" />
            <h1 className="mt-3 text-[20px] font-bold text-white sm:text-[26px]">
              {defaultValues ? "Edit Plan" : "Create Plan"}
            </h1>
            <p className="mt-1 text-[12.5px] text-caption sm:text-[13px]">
              {defaultValues ? `Update the "${tierLabel(defaultValues.tier)}" subscription tier.` : "Define a new subscription tier for your platform."}
            </p>
          </motion.div>

          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
            <CreatePlanButton
              label={isSubmitting ? "Saving…" : submitLabel}
              onClick={isSubmitting ? undefined : handleSubmit}
              showIcon={false}
            />
          </div>
        </div>
      </div>

      <main className="relative flex-1 px-4 py-6 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="mx-auto max-w-3xl rounded-xl border border-white/[0.08] bg-card p-5 sm:p-7 md:p-8"
        >
          <div className="flex flex-col gap-7">
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-[12px] font-medium text-red-300">
                {error}
              </div>
            )}

            <Field label="Price (USD)">
              <input
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="49"
                className="w-full rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
              />
            </Field>

            <Field label="Tier">
              <SelectGroup options={TIER_OPTIONS} value={tier} onChange={(v) => setTier(v)} layout="row" />
            </Field>

            <Field label="Core Features">
              <textarea
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                placeholder={"Unlimited API Access\nDedicated Node Support\n99.9% SLA Guarantee"}
                rows={4}
                className="w-full resize-none rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
              />
              <p className="mt-1.5 text-[11px] text-slate-500">
                One feature per line. These will be displayed as a checklist to subscribers.
              </p>
            </Field>

            <Field label="Duration Cycle">
              <SelectGroup options={DURATION_OPTIONS} value={duration} onChange={(v) => setDuration(v)} layout="grid" />
            </Field>
          </div>
        </motion.div>

        <div className="pointer-events-none sticky bottom-0 left-0 right-0 mt-6 flex justify-center sm:hidden">
          <div className="pointer-events-auto flex w-full max-w-3xl rounded-xl border border-white/[0.08] bg-[#0a0f1a]/95 p-3 backdrop-blur-md">
            <CreatePlanButton label={isSubmitting ? "Saving…" : submitLabel} onClick={isSubmitting ? undefined : handleSubmit} className="w-full justify-center" showIcon={false} />
          </div>
        </div>
      </main>
    </>
  );
}

/* ── Field wrapper ─────────────────────────── */
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

/* ── Reusable selectable option group ─────────
   layout="grid": stacked rows on mobile, 2x2 grid on larger (used for Duration)
   layout="row":  stacked rows always (compact, used for Tier)
*/
function SelectGroup<T extends string>({
  options,
  value,
  onChange,
  layout,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  layout: "grid" | "row";
}) {
  if (layout === "grid") {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={[
                "flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wide transition-all active:scale-[0.97]",
                active
                  ? "border-blue-500 bg-blue-600 text-white shadow-[0_0_0_1px_rgba(59,130,246,0.4)]"
                  : "border-white/[0.10] bg-[#0d1320] text-slate-400 hover:border-white/[0.18] hover:bg-white/[0.04] hover:text-slate-200",
              ].join(" ")}
            >
              <span className="truncate">{opt.label}</span>
              <Dot active={active} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.10]">
      {options.map((opt, i) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              "flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[12px] font-medium uppercase tracking-wide transition-colors",
              i !== 0 ? "border-t border-white/[0.08]" : "",
              active
                ? "bg-blue-600 text-white"
                : "bg-[#0d1320] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
            ].join(" ")}
          >
            <span className="truncate">{opt.label}</span>
            <Dot active={active} />
          </button>
        );
      })}
    </div>
  );
}

function Dot({ active }: { active: boolean }) {
  return (
    <span
      className={[
        "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-colors",
        active ? "border-white bg-white" : "border-slate-600 bg-transparent",
      ].join(" ")}
    >
      {active && <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
    </span>
  );
}
