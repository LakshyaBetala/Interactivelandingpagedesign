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
      <div className="min-h-screen bg-sand font-mono flex flex-col items-center justify-center p-6 select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(40,40,40,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(40,40,40,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="w-16 h-16 border-4 border-charcoal border-t-ember animate-spin mb-4" />
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-charcoal/60 animate-pulse">
          Connecting to Almmatix OS Sync Matrix...
        </p>
      </div>
    );
  }

  // Determine if we should show the portal switcher widget
  // (Show only if Supabase is unconfigured, OR if logged in as an Admin simulating client portals)
  const showSwitcher = !isSupabaseConfigured || (userProfile && userProfile.category === "admin");

  return (
    <div className="min-h-screen bg-sand font-sans">
      {/* Dynamic Header Auth Controls */}
      {userProfile && (
        <div className="fixed top-4 right-4 z-[99] flex items-center gap-3 bg-white border-2 border-charcoal px-3 py-1.5 shadow-[4px_4px_0px_0px_#282828] font-mono text-[0.65rem]">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-charcoal/60 uppercase tracking-wider">
            User: <strong className="text-charcoal font-bold">{userProfile.name}</strong> ({userProfile.role})
          </span>
          <button
            onClick={signOut}
            className="text-ember hover:underline font-bold uppercase tracking-wider border-l border-charcoal/20 pl-3 ml-1"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Floating Switcher Widget */}
      {showSwitcher && (
        <div className="fixed bottom-5 right-5 z-[999] flex gap-1 bg-charcoal p-1 rounded-lg shadow-2xl">
          {(["admin", "client"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setActiveView(r)}
              className={`px-4 py-2 rounded-md text-[0.6rem] uppercase tracking-[0.15em] font-mono font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember ${
                activeView === r ? "bg-ember text-white" : "text-taupe-light hover:text-sand"
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
