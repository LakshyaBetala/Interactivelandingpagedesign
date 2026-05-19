"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"admin" | "client">("admin");
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [clientProject, setClientProject] = useState("");
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if already authenticated on mount
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
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        // Enforce Almmatix domain for Admin signups
        if (activeTab === "admin" && !email.toLowerCase().endsWith("@almmatix.com")) {
          throw new Error("Only @almmatix.com email addresses are authorized to register as partners.");
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
            "Account created! Please check your email for confirmation or sign in directly if email verification is bypassed."
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
    <div className="min-h-screen bg-sand font-sans flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Brutalist Architectural background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(40,40,40,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(40,40,40,0.05)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Decorative Ember light streak */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-ember/5 rounded-full filter blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[480px] bg-white border-4 border-charcoal p-8 relative shadow-[8px_8px_0px_0px_#282828] z-10"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8 border-b-2 border-charcoal pb-4">
          <div>
            <h1 className="font-mono text-xs uppercase tracking-[0.2em] text-ember font-bold">
              ALMMATIX // OS
            </h1>
            <p className="font-mono text-[0.65rem] text-charcoal/60 mt-1 uppercase tracking-wider">
              Control Center Auth Gate
            </p>
          </div>
          <div className="font-mono text-[0.6rem] bg-charcoal text-sand px-2 py-1 uppercase tracking-widest font-bold">
            SECURE
          </div>
        </div>

        {/* Dynamic Portal Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-6 bg-sand/30 p-1 border-2 border-charcoal">
          {(["admin", "client"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-[0.65rem] uppercase font-mono tracking-wider font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? "bg-charcoal text-white shadow-md"
                  : "text-charcoal/60 hover:text-charcoal"
              }`}
            >
              {tab === "admin" ? "Partner Console" : "Client Hub"}
            </button>
          ))}
        </div>

        {/* Main Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignUp ? "signup" : "signin"}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {isSignUp && (
                <div>
                  <label className="block text-[0.6rem] uppercase tracking-widest font-mono text-charcoal/70 mb-1.5 font-bold">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full bg-sand/10 border-2 border-charcoal px-3 py-2 text-xs font-mono text-charcoal outline-none focus:border-ember focus:bg-white transition-all placeholder:text-charcoal/30"
                  />
                </div>
              )}

              <div>
                <label className="block text-[0.6rem] uppercase tracking-widest font-mono text-charcoal/70 mb-1.5 font-bold">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    activeTab === "admin"
                      ? "name@almmatix.com"
                      : "partner@clientcompany.com"
                  }
                  className="w-full bg-sand/10 border-2 border-charcoal px-3 py-2 text-xs font-mono text-charcoal outline-none focus:border-ember focus:bg-white transition-all placeholder:text-charcoal/30"
                />
              </div>

              <div>
                <label className="block text-[0.6rem] uppercase tracking-widest font-mono text-charcoal/70 mb-1.5 font-bold">
                  {isSignUp ? "Create Password" : "Secret Password"}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-sand/10 border-2 border-charcoal px-3 py-2 text-xs font-mono text-charcoal outline-none focus:border-ember focus:bg-white transition-all placeholder:text-charcoal/30"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="bg-red-50 border-2 border-red-500 p-3 text-red-700 text-[0.65rem] font-mono leading-relaxed">
              [ERROR]: {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 border-2 border-green-500 p-3 text-green-700 text-[0.65rem] font-mono leading-relaxed">
              [SUCCESS]: {successMsg}
            </div>
          )}

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ember hover:bg-ember-dark text-white font-mono text-xs uppercase tracking-[0.15em] font-semibold py-3 border-2 border-charcoal hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_#282828] active:translate-y-[0px] active:shadow-none transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : isSignUp ? "Create Access Token" : "Request Portal Access"}
          </button>
        </form>

        {/* Footer controls & sign up toggler */}
        <div className="mt-6 pt-4 border-t-2 border-charcoal/10 flex flex-col items-center justify-between text-center gap-2">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="font-mono text-[0.65rem] text-ember hover:underline uppercase tracking-wider"
          >
            {isSignUp ? "← Return to login panel" : "First time partner or client? Create Account"}
          </button>

          <p className="font-mono text-[0.55rem] text-charcoal/45 mt-2 leading-relaxed">
            {activeTab === "admin"
              ? "Notice: Accessing administrative assets requires verification. Registrants with domain @almmatix.com are seeded with admin access."
              : "Welcome client: Log in with credentials provided by your Almmatix project manager to monitor tickets and verify releases."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
