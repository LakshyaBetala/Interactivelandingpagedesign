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

  // Auth Protection redirect
  useEffect(() => {
    if (!loading && isSupabaseConfigured && !userProfile) {
      router.push("/portal/auth");
    }
  }, [userProfile, loading, isSupabaseConfigured, router]);

  // Sync active view with user profile role once loaded
  useEffect(() => {
    if (userProfile) {
      setActiveView(userProfile.category === "admin" ? "admin" : "client");
    }
  }, [userProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-mono flex flex-col items-center justify-center p-6 select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="w-12 h-12 border-2 border-[#1F1F1F] border-t-[#06B6D4] rounded-full animate-spin mb-4" />
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#8E8E8E] animate-pulse">
          Connecting to Almmatix OS Sync Matrix...
        </p>
      </div>
    );
  }

  // Determine if we should show the portal switcher widget
  // (Show only if Supabase is unconfigured, OR if logged in as an Admin simulating client portals)
  const showSwitcher = !isSupabaseConfigured || (userProfile && userProfile.category === "admin");

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-sans">
      {/* Dynamic Header Auth Controls */}
      {userProfile && (
        <div className="fixed top-4 right-4 z-[99] flex items-center gap-3 bg-[#121212]/80 backdrop-blur-md border border-[#1F1F1F] px-4 py-2 rounded-xl shadow-2xl font-mono text-[0.625rem]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-pulse" />
          <span className="text-[#8E8E8E] uppercase tracking-wider">
            User: <strong className="text-[#FAF9F6] font-bold">{userProfile.name}</strong> ({userProfile.role})
          </span>
          <button
            onClick={signOut}
            className="text-[#EF4444] hover:underline font-bold uppercase tracking-wider border-l border-[#1F1F1F] pl-3 ml-1"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Floating Switcher Widget */}
      {showSwitcher && (
        <div className="fixed bottom-5 right-5 z-[999] flex gap-1 bg-[#121212] border border-[#1F1F1F] p-1 rounded-xl shadow-2xl">
          {(["admin", "client"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setActiveView(r)}
              className={`px-3 py-1.5 rounded-lg text-[0.55rem] uppercase tracking-[0.15em] font-mono font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#06B6D4] ${
                activeView === r ? "bg-[#06B6D4] text-[#0A0A0A]" : "text-[#8E8E8E] hover:text-[#F5F5F5]"
              }`}
            >
              {r === "admin" ? "Admin CRM" : "Client Portal"}
            </button>
          ))}
        </div>
      )}

      {/* View Switcher Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
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
