"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/portal");
      }
    });
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setErrorMsg(null); 
    setLoading(true);

    setTimeout(async () => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password
        });
        
        if (error) throw error;
        
        router.push("/portal");
      } catch (err: any) { 
        setErrorMsg(err.message || "Authentication error."); 
      } finally { 
        setLoading(false); 
      }
    }, 500); // Simulate network request
  };

  const inputClass = "w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-[12px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-ember)] transition-colors placeholder:text-[var(--color-text-faint)]";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-2xl p-7 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-[14px] font-bold tracking-tight text-[var(--color-card-text)] mb-1">almmatix</h1>
            <p className="text-[11px] text-[var(--color-card-text-muted)]">Sign in to CRM</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-3">
            <AnimatePresence mode="wait">
              <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <div>
                  <label className="block text-[10px] text-[var(--color-card-text-muted)] mb-1 font-medium">Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass + " !border-[var(--color-border-card)] focus:!border-[var(--color-ember)] !placeholder:text-[var(--color-card-text-muted)]"} />
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--color-card-text-muted)] mb-1 font-medium">Password</label>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputClass + " !border-[var(--color-border-card)] focus:!border-[var(--color-ember)] !placeholder:text-[var(--color-card-text-muted)]"} />
                </div>
              </motion.div>
            </AnimatePresence>

            {errorMsg && <div className="bg-[var(--color-bad-soft)] border border-[var(--color-bad)]/20 rounded-xl p-3 text-[var(--color-bad)] text-[11px] text-center">{errorMsg}</div>}

            <button type="submit" disabled={loading} className="w-full bg-[var(--color-ember)] hover:bg-[var(--color-ember-hover)] text-white text-[12px] font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50">
              {loading ? "Loading..." : "Sign In"}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[var(--color-border-card)] text-center">
            <p className="text-[9px] text-[var(--color-card-text-muted)]">Please ensure your account has been provisioned by an Admin.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
