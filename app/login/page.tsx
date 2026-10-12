"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, ShieldCheck, Sun, Zap, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.3 } }),
};

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("admin@sparrowsolar.com");
  const [password, setPassword] = useState("sparrow2026");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function executeLogin(userEmail: string) {
    setLoading(true);
    setTimeout(() => {
      setAuth("mock-sparrow-solar-jwt-token", {
        id: "admin-sparrow-01",
        fullName: "Solar System Administrator",
        email: userEmail,
        role: "SUPER_ADMIN",
      });
      toast.success("Welcome back to Sparrow Solar Admin!");
      router.push("/dashboard");
    }, 350);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    executeLogin(email);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070b14] px-4">
      {/* Background solar grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,158,11,1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,1) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Solar radial glow accents */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/[0.08] blur-[140px]" />
      <div className="pointer-events-none absolute left-1/4 top-1/3 h-[300px] w-[300px] rounded-full bg-blue-600/[0.05] blur-[100px]" />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px] rounded-2xl border border-white/[0.08] bg-[#0c1220]/95 p-8 shadow-2xl shadow-black/80 backdrop-blur-xl"
      >
        {/* Brand header */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-8 flex flex-col items-center gap-3 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 shadow-xl shadow-amber-500/30">
            <Sun size={28} className="text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-[20px] font-bold tracking-tight text-white">
              Sparrow Solar Admin
            </h1>
            <p className="mt-1 text-[12px] text-slate-400">
              Solar Telemetry & Energy Management Portal
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sparrowsolar.com"
              autoComplete="email"
              className="w-full rounded-lg border border-white/[0.09] bg-white/[0.03] px-4 py-2.5 text-[13px] text-slate-100 placeholder:text-slate-600 transition-all focus:border-amber-500/50 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-amber-500/20"
            />
          </motion.div>

          {/* Password */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-lg border border-white/[0.09] bg-white/[0.03] px-4 py-2.5 pr-11 text-[13px] text-slate-100 placeholder:text-slate-600 transition-all focus:border-amber-500/50 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-amber-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show" className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-[13px] font-semibold text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                  Authenticating…
                </>
              ) : (
                <>
                  <LogIn size={15} />
                  Sign In to Dashboard
                </>
              )}
            </button>
          </motion.div>

          {/* Quick Demo Button */}
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show">
            <button
              type="button"
              disabled={loading}
              onClick={() => executeLogin("demo@sparrowsolar.com")}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.03] py-2 text-[12px] font-medium text-slate-300 transition-all hover:bg-white/[0.06] hover:text-white cursor-pointer"
            >
              <Sparkles size={13} className="text-amber-400" />
              1-Click Instant Demo Login
            </button>
          </motion.div>
        </form>

        {/* Footer info */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-500"
        >
          <ShieldCheck size={12} className="text-emerald-400" />
          Protected by Sparrow Solar Access Control
        </motion.div>
      </motion.div>

      {/* Version note */}
      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[11px] text-slate-600">
        Sparrow Solar Admin · Infrastructure Telemetry
      </p>
    </div>
  );
}
