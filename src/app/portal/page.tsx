"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminDashboard from "@/components/crm/AdminDashboard";
import ClientPortalView from "@/components/crm/ClientPortalView";
import { CRMProvider } from "@/components/crm/CRMContext";

export default function PortalPage() {
  const [role, setRole] = useState<"admin" | "client">("admin");
  const handleSwitch = useCallback((r: "admin" | "client") => setRole(r), []);

  return (
    <CRMProvider>
      <div className="min-h-screen bg-sand font-sans">
        {/* Floating Role Switcher */}
        <div className="fixed bottom-5 right-5 z-[999] flex gap-1 bg-charcoal p-1 rounded-lg shadow-2xl">
          {(["admin", "client"] as const).map((r) => (
            <button
              key={r}
              onClick={() => handleSwitch(r)}
              className={`px-4 py-2 rounded-md text-[0.6rem] uppercase tracking-[0.15em] font-mono font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember ${
                role === r ? "bg-ember text-white" : "text-taupe-light hover:text-sand"
              }`}
            >
              {r === "admin" ? "Admin CRM" : "Client Portal"}
            </button>
          ))}
        </div>

        {/* View */}
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {role === "admin" ? <AdminDashboard /> : <ClientPortalView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </CRMProvider>
  );
}
