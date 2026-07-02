"use client";

import { motion } from "framer-motion";
import { BackButton } from "@/components/shared/back-button";
import { TagManagerPanel } from "@/components/education/tag-manager-panel";

export default function LibraryTagsPage() {
  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 space-y-5 p-4 md:p-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <BackButton href="/dashboard/education/library" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <h1 className="text-2xl font-bold text-white">Manage Tags</h1>
          <p className="mt-1 text-sm text-muted-foreground">Rename or remove tags used across the library.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <TagManagerPanel />
        </motion.div>
      </main>
    </div>
  );
}
