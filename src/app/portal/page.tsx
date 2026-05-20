"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AdminDashboard from "@/components/crm/AdminDashboard";
import ClientPortalView from "@/components/crm/ClientPortalView";
import { CRMProvider, useCRM } from "@/components/crm/CRMContext";

function PortalContent() {
  const router = useRouter();
  const { userProfile, loading, isSupabaseConfigured, signOut } = useCRM();
  const [activeView, setActiveView] = useState<"admin" | "client">("admin");

  // Auth protection
  useEffect(() => {
    if (!loading && isSupabaseConfigured && !userProfile) {
      router.push("/portal/auth");
    }
  }, [userProfile, loading, isSupabaseConfigured, router]);

  // Sync view with role
  useEffect(() => {
    if (userProfile) {
      setActiveView(userProfile.category === "admin" ? "admin" : "client");
    }
  }, [userProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-[var(--color-accent)] rounded-full animate-spin" />
          <p className="text-[12px] text-[var(--color-text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  const isAdmin = userProfile?.category === "admin" || !isSupabaseConfigured;
  const showSwitcher = !isSupabaseConfigured || (userProfile && userProfile.category === "admin");

  return (
    <div className="min-h-screen">
      {/* Floating switcher */}
      {showSwitcher && (
        <div className="fixed bottom-4 right-4 z-[999] flex gap-0.5 bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg shadow-2xl">
          {(["admin", "client"] as const).map(r => (
            <button
              key={r}
              onClick={() => setActiveView(r)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                activeView === r
                  ? "bg-[var(--color-accent)] text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {r === "admin" ? "Admin" : "Client View"}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeView === "admin" ? <AdminDashboard /> : <ClientPortalView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function PortalPage() {
  return (
    <CRMProvider>
      <PortalContent />
    </CRMProvider>
  );
}
