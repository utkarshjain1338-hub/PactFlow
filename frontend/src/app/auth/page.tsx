"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { ApiClientError } from "@/lib/api-client";
import { toast } from "sonner";

type Mode = "login" | "register";

export default function AuthPage() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [accountType, setAccountType] = useState<"FREELANCER" | "COMPANY">("FREELANCER");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, displayName, accountType);
      }
      router.push("/dashboard");
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.apiError?.detail || err.message
          : "Something went wrong. Please try again.";
      toast.error(mode === "login" ? "Login failed" : "Registration failed", {
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-1 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"/>
              <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"/>
              <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">PactFlow</h1>
          <p className="text-sm text-text-secondary mt-1">
            {mode === "login" ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-2 border border-border-subtle rounded-2xl p-8 shadow-xl">
          {/* Tab switcher */}
          <div className="flex rounded-lg bg-surface-1 p-1 mb-6">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === m
                    ? "bg-surface-2 text-text-primary shadow-sm border border-border-subtle"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display name — only on register */}
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-1 border border-border-subtle text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-lg bg-surface-1 border border-border-subtle text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg bg-surface-1 border border-border-subtle text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
              />
            </div>

            {/* Account type — only on register */}
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  I am a…
                </label>
                <div className="flex gap-3">
                  {(["FREELANCER", "COMPANY"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAccountType(type)}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                        accountType === type
                          ? "bg-primary/10 border-primary/40 text-primary"
                          : "border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary"
                      }`}
                    >
                      {type === "FREELANCER" ? "Freelancer" : "Company"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 mt-2 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading
                ? mode === "login"
                  ? "Signing in…"
                  : "Creating account…"
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-text-tertiary mt-6">
          Secured by Stellar blockchain ·{" "}
          <Link href="/" className="text-primary hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
