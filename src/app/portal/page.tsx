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
    if (!loading && !userProfile) {
      router.push("/portal/auth");
    }
  }, [userProfile, loading, router]);

  // Sync view with role
  useEffect(() => {
    if (userProfile) {
      setActiveView(userProfile.category === "admin" ? "admin" : "client");
    }
  }, [userProfile]);

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-[var(--color-accent)] rounded-full animate-spin" />
          <p className="text-[12px] text-[var(--color-text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  const isAdmin = userProfile?.category === "admin";
  const showSwitcher = userProfile && userProfile.category === "admin";

  return (
    <div className="min-h-screen relative">
      {showSwitcher && (
        <div className="fixed bottom-4 right-4 z-[9999] bg-[var(--color-surface)] border border-[var(--color-border-card)] shadow-lg rounded-full p-1 flex gap-1">
          <button onClick={() => setActiveView("admin")} className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-colors ${activeView === "admin" ? "bg-[var(--color-ember)] text-white" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}>Admin View</button>
          <button onClick={() => setActiveView("client")} className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-colors ${activeView === "client" ? "bg-[var(--color-ember)] text-white" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}>Client View</button>
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
