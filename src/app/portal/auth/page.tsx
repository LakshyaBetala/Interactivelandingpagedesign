"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Connection state
  const [supabaseStatus, setSupabaseStatus] = useState<"connecting" | "online" | "offline">("connecting");

  // Check if already authenticated on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/portal");
      }
    });
  }, [router]);

  // Real-time Supabase connectivity health check pinger
  useEffect(() => {
    const checkConnectivity = async () => {
      const isConfigured = 
        process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder-project.supabase.co" &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== undefined &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key-for-build";
      
      if (!isConfigured) {
        setSupabaseStatus("offline");
        return;
      }

      try {
        const { error } = await supabase.from("profiles").select("count", { count: "exact", head: true });
        if (!error) {
          setSupabaseStatus("online");
        } else {
          setSupabaseStatus("offline");
        }
      } catch (e) {
        setSupabaseStatus("offline");
      }
    };
    checkConnectivity();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        // Enforce specific Admin emails for Partner registration
        const ADMIN_EMAILS = [
          "lakshbetala15@gmail.com",
          "gandhimouriyan1234@gmail.com",
          "monarchankit25@gmail.com",
          "muskanabani01@gmail.com"
        ];
        if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
          throw new Error("Access Denied: Only registered partner Gmail addresses are authorized to register console accounts.");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: fullName || email.split("@")[0],
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          setSuccessMsg(
            "Partner registration initiated successfully. Please verify your email inbox."
          );
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Redirect on successful login
        router.push("/portal");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0A09] text-[#FAF9F6] font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Premium Minimalist Hairline background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Connectivity Status Indicator Widget */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-[#1C1917]/80 backdrop-blur-md border border-[#292524] rounded-full px-4 py-1.5 shadow-2xl font-mono text-[0.6rem] tracking-wider transition-all duration-300">
        {supabaseStatus === "connecting" && (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
            <span className="text-[#A8A29E] uppercase">VERIFYING OS ENGINE CONNECTION...</span>
          </>
        )}
        {supabaseStatus === "online" && (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span className="text-[#10B981] font-bold uppercase">LIVE DATABASE SYNC ACTIVE</span>
          </>
        )}
        {supabaseStatus === "offline" && (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
            <span className="text-[#D97706] font-bold uppercase">LOCAL OFFLINE SANDBOX ACTIVE</span>
          </>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] bg-[#1C1917] border border-[#292524] p-8 relative rounded-xl shadow-2xl z-10"
      >
        {/* Top Header */}
        <div className="flex flex-col items-center text-center mb-8 border-b border-[#292524] pb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
            <h1 className="font-mono text-[0.75rem] uppercase tracking-[0.25em] text-[#FAF9F6] font-bold">
              ALMMATIX OS
            </h1>
          </div>
          <p className="font-mono text-[0.625rem] text-[#A8A29E] uppercase tracking-widest">
            Partner Control Console
          </p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignUp ? "signup" : "signin"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {isSignUp && (
                <div>
                  <label className="block text-[0.55rem] uppercase tracking-widest font-mono text-[#A8A29E] mb-1.5 font-bold">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full bg-[#0C0A09] border border-[#292524] rounded-lg px-3 py-2 text-xs font-mono text-[#FAF9F6] outline-none focus:border-[#06B6D4] focus:bg-[#0C0A09]/80 transition-all placeholder:text-[#57534E]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[0.55rem] uppercase tracking-widest font-mono text-[#A8A29E] mb-1.5 font-bold">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="partner@gmail.com"
                  className="w-full bg-[#0C0A09] border border-[#292524] rounded-lg px-3 py-2 text-xs font-mono text-[#FAF9F6] outline-none focus:border-[#06B6D4] focus:bg-[#0C0A09]/80 transition-all placeholder:text-[#57534E]"
                />
              </div>

              <div>
                <label className="block text-[0.55rem] uppercase tracking-widest font-mono text-[#A8A29E] mb-1.5 font-bold">
                  {isSignUp ? "Create Password" : "Secret Password"}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0C0A09] border border-[#292524] rounded-lg px-3 py-2 text-xs font-mono text-[#FAF9F6] outline-none focus:border-[#06B6D4] focus:bg-[#0C0A09]/80 transition-all placeholder:text-[#57534E]"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-[0.625rem] font-mono leading-relaxed text-center">
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-emerald-400 text-[0.625rem] font-mono leading-relaxed text-center">
              ✓ {successMsg}
            </div>
          )}

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#06B6D4] hover:bg-[#0891B2] text-[#0C0A09] font-mono text-xs uppercase tracking-[0.2em] font-bold py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : isSignUp ? "Request Partner Account" : "Access Control Gate"}
          </button>
        </form>

        {/* Footer controls & sign up toggler */}
        <div className="mt-6 pt-5 border-t border-[#292524] flex flex-col items-center justify-between text-center gap-2">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="font-mono text-[0.6rem] text-[#06B6D4] hover:underline uppercase tracking-wider"
          >
            {isSignUp ? "← Return to login panel" : "New partner account signup request"}
          </button>

          <p className="font-mono text-[0.525rem] text-[#A8A29E] mt-3 leading-relaxed">
            Authorized partner accounts only. Access permissions are verified cryptographically. Registrants must use an active partner Gmail address.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
