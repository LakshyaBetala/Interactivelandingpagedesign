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
  const [status, setStatus] = useState<"connecting" | "online" | "offline">("connecting");

  // Check existing session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push("/portal");
    });
  }, [router]);

  // Supabase connectivity check
  useEffect(() => {
    const check = async () => {
      const configured =
        process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder-project.supabase.co" &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== undefined &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key-for-build";
      if (!configured) { setStatus("offline"); return; }
      try {
        const { error } = await supabase.from("profiles").select("count", { count: "exact", head: true });
        setStatus(error ? "offline" : "online");
      } catch { setStatus("offline"); }
    };
    check();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null); setSuccessMsg(null); setLoading(true);
    try {
      if (isSignUp) {
        const ADMIN_EMAILS = ["lakshbetala15@gmail.com", "gandhimouriyan1234@gmail.com", "monarchankit25@gmail.com", "muskanabani01@gmail.com"];
        if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
          throw new Error("Access denied. Only authorized emails can register.");
        }
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name: fullName || email.split("@")[0] } } });
        if (error) throw error;
        if (data.user) { setSuccessMsg("Account created. Check your email to verify."); setIsSignUp(false); }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/portal");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication error.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex items-center justify-center p-4">
      {/* Status badge */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5 text-[11px]">
        <span className={`w-1.5 h-1.5 rounded-full ${status === "online" ? "bg-emerald-500" : status === "connecting" ? "bg-amber-500 animate-pulse" : "bg-amber-500"}`} />
        <span className="text-zinc-400">{status === "online" ? "Connected" : status === "connecting" ? "Connecting..." : "Offline mode"}</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-7 shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-[15px] font-bold tracking-tight mb-1">almmatix</h1>
          <p className="text-[12px] text-zinc-500">{isSignUp ? "Create your account" : "Sign in to continue"}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-3">
          <AnimatePresence mode="wait">
            <motion.div key={isSignUp ? "signup" : "signin"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {isSignUp && (
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1 font-medium">Full Name</label>
                  <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-[13px] text-zinc-100 outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600" />
                </div>
              )}
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1 font-medium">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-[13px] text-zinc-100 outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600" />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1 font-medium">Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-[13px] text-zinc-100 outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600" />
              </div>
            </motion.div>
          </AnimatePresence>

          {errorMsg && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-[12px] text-center">{errorMsg}</div>}
          {successMsg && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-emerald-400 text-[12px] text-center">{successMsg}</div>}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50">
            {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-zinc-800 text-center">
          <button onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); setSuccessMsg(null); }}
            className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
            {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
          </button>
          <p className="text-[10px] text-zinc-600 mt-2">Only authorized emails can register.</p>
        </div>
      </motion.div>
    </div>
  );
}
