"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, Shield } from "lucide-react";
import { FaRegStar } from "react-icons/fa";
import { toast } from "sonner";
import { useAdminLogin } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth.store";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.3 } }),
};

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("admin@kickcatalyst.com");
  const [password, setPassword] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const login = useAdminLogin();
  const loading = login.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: (res) => {
          setAuth(res.token, res.admin);
          router.push("/dashboard");
        },
        onError: (err) => {
          toast.error(err?.message || "Invalid email or password.");
        },
      }
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080c16]">

      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,179,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/[0.06] blur-[120px]" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px] rounded-2xl border border-white/[0.08] bg-[#0d1321] p-8 shadow-2xl shadow-black/60"
      >

        {/* Brand */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
            <FaRegStar size={20} color="#fff" />
          </div>
          <div className="text-center">
            <h1 className="text-[18px] font-bold tracking-tight text-white">Kink Analyst Admin</h1>
            <p className="mt-1 text-[12px] text-[#4a5a7a]">Sign in to your admin account</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#4a5a7a]">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@platform.com"
              autoComplete="email"
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[13px] text-slate-200 placeholder:text-[#2e3d57] transition-all focus:border-blue-500/50 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-blue-500/20"
            />
          </motion.div>

          {/* Password */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#4a5a7a]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 pr-11 text-[13px] text-slate-200 placeholder:text-[#2e3d57] transition-all focus:border-blue-500/50 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3a4d6a] transition-colors hover:text-slate-400"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show" className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-blue-600 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 hover:shadow-blue-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn size={14} />
                  Sign In
                </>
              )}
            </button>
          </motion.div>
        </form>

        {/* Footer note */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show" className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-[#2e3d57]">
          <Shield size={11} />
          Secured admin access only
        </motion.div>
      </motion.div>

      {/* Version tag */}
      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-[#1e2d45]">
        v1.0.0 · Kink Analyst Admin
      </p>
    </div>
  );
}
