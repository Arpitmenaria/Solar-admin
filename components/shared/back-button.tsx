"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TbArrowLeft } from "react-icons/tb";

interface BackButtonProps {
  href?: string;
}

export function BackButton({ href }: BackButtonProps) {
  const router = useRouter();

  return (
    <motion.button
      type="button"
      onClick={() => (href ? router.push(href) : router.back())}
      whileHover={{ scale: 1.03, x: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className="inline-flex items-center gap-2 rounded-full border border-white/[0.16] bg-white/[0.05] px-3.5 py-1.5 text-[12px] font-semibold text-slate-300 backdrop-blur-sm transition-colors hover:border-white/[0.28] hover:bg-white/[0.09] hover:text-white"
    >
      <TbArrowLeft size={13} />
      Back
    </motion.button>
  );
}
