"use client";

import { motion } from "framer-motion";
import { ActivityLogList } from "@/components/education/activity-log-list";

export default function EducationActivityPage() {
  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 space-y-5 p-4 md:p-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">Education Activity Log</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every course and library change made by admins, most recent first.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <ActivityLogList />
        </motion.div>
      </main>
    </div>
  );
}
