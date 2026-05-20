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

  useEffect(() => { supabase.auth.getSession().then(({ data: { session } }) => { if (session) router.push("/portal"); }); }, [router]);

  useEffect(() => {
    const check = async () => {
      const configured = process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined && process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder-project.supabase.co" && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== undefined && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key-for-build";
      if (!configured) { setStatus("offline"); return; }
      try { const { error } = await supabase.from("profiles").select("count", { count: "exact", head: true }); setStatus(error ? "offline" : "online"); } catch { setStatus("offline"); }
    };
    check();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMsg(null); setSuccessMsg(null); setLoading(true);
    try {
      if (isSignUp) {
        const ADMIN_EMAILS = ["lakshbetala15@gmail.com", "gandhimouriyan1234@gmail.com", "monarchankit25@gmail.com", "muskanabani01@gmail.com"];
        if (!ADMIN_EMAILS.includes(email.toLowerCase())) throw new Error("Access denied. Only authorized emails can register.");
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name: fullName || email.split("@")[0] } } });
        if (error) throw error;
        if (data.user) { setSuccessMsg("Account created. Check your email to verify."); setIsSignUp(false); }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/portal");
      }
    } catch (err: any) { setErrorMsg(err.message || "Authentication error."); } finally { setLoading(false); }
  };

  const inputClass = "w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-[12px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-ember)] transition-colors placeholder:text-[var(--color-text-faint)]";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans flex items-center justify-center p-4">
      <div className="fixed top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-full px-3 py-1.5 text-[10px]">
        <span className={`w-1.5 h-1.5 rounded-full ${status === "online" ? "bg-[var(--color-ok)]" : "bg-[var(--color-warn)] animate-pulse"}`} />
        <span className="text-[var(--color-text-muted)]">{status === "online" ? "Connected" : status === "connecting" ? "Connecting..." : "Offline mode"}</span>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-2xl p-7 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-[14px] font-bold tracking-tight text-[var(--color-card-text)] mb-1">almmatix</h1>
            <p className="text-[11px] text-[var(--color-card-text-muted)]">{isSignUp ? "Create your account" : "Sign in to continue"}</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-3">
            <AnimatePresence mode="wait">
              <motion.div key={isSignUp ? "s" : "l"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {isSignUp && (
                  <div>
                    <label className="block text-[10px] text-[var(--color-card-text-muted)] mb-1 font-medium">Full Name</label>
                    <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" className={inputClass + " !bg-white !text-[var(--color-card-text)] !border-[var(--color-border-card)] focus:!border-[var(--color-ember)] !placeholder:text-[var(--color-card-text-muted)]"} />
                  </div>
                )}
                <div>
                  <label className="block text-[10px] text-[var(--color-card-text-muted)] mb-1 font-medium">Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass + " !bg-white !text-[var(--color-card-text)] !border-[var(--color-border-card)] focus:!border-[var(--color-ember)] !placeholder:text-[var(--color-card-text-muted)]"} />
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--color-card-text-muted)] mb-1 font-medium">Password</label>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputClass + " !bg-white !text-[var(--color-card-text)] !border-[var(--color-border-card)] focus:!border-[var(--color-ember)] !placeholder:text-[var(--color-card-text-muted)]"} />
                </div>
              </motion.div>
            </AnimatePresence>

            {errorMsg && <div className="bg-[var(--color-bad-soft)] border border-[var(--color-bad)]/20 rounded-xl p-3 text-[var(--color-bad)] text-[11px] text-center">{errorMsg}</div>}
            {successMsg && <div className="bg-[var(--color-ok-soft)] border border-[var(--color-ok)]/20 rounded-xl p-3 text-[var(--color-ok)] text-[11px] text-center">{successMsg}</div>}

            <button type="submit" disabled={loading} className="w-full bg-[var(--color-ember)] hover:bg-[var(--color-ember-hover)] text-white text-[12px] font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50">
              {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[var(--color-border-card)] text-center">
            <button onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); setSuccessMsg(null); }} className="text-[11px] text-[var(--color-ember)] hover:underline">
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
            <p className="text-[9px] text-[var(--color-card-text-muted)] mt-2">Only authorized emails can register.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
