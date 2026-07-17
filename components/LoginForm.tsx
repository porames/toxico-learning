"use client";

import { useState, useEffect, type FormEvent } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  getAuth,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { useRouter } from "next/navigation";


type Mode = "sign-in" | "sign-up";

export default function LoginForm() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ramaId, setRamaId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const isSignUp = mode === "sign-up";
  const router = useRouter();
  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading("email");
    try {
      if (isSignUp) {
        const res = await fetch("https://us-central1-rama-toxico-edu.cloudfunctions.net/signUp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            rama_id: ramaId,
            pw: password
          }),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.message || "Failed to sign up");
        }
        setRamaId("");
        setEmail("");
        setPassword("");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/classes");
      }
      // Replace with your post-auth redirect, e.g. router.push("/dashboard")
      setNotice(isSignUp ? "Account created." : "Signed in. Redirecting…");
    } catch (err: any) {
      setError(getAuthErrorMessage(err?.code ?? ""));
    } finally {
      setLoading(null);
    }
  }

  async function handleForgotPassword() {
    setError(null);
    setNotice(null);
    if (!email) {
      setError("Enter your email above first, then click \u201cForgot password\u201d.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setNotice(`Password reset email sent to ${email}.`);
    } catch (err: any) {
      setError(getAuthErrorMessage(err?.code ?? ""));
    }
  }
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/classes");
      } else {
        setChecking(false); // no user, safe to show login form
      }
    });
    return () => unsubscribe();
  }, [router]);
  if (checking) {
    return (
      <h1>Loading ...</h1>
    )
  }

  return (
    <div className="w-full max-w-[380px]">
      <h2 className="text-[26px] font-semibold tracking-tight text-ink-900">
        {isSignUp ? "Create your account" : "Sign in"}
      </h2>
      <p className="mt-2 text-[14.5px] text-ink-500">
        {isSignUp ? "ลงทะเบียนกรณียังไม่มีรหัสผ่าน" : "เข้าสู่ระบบ"}
      </p>

      <form onSubmit={handleEmailSubmit} className="mt-5 space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-ink-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-lg border border-ink-900/12 bg-white px-3.5 py-2.5 text-[14.5px] text-ink-900 placeholder:text-ink-300 transition focus:border-iris-500 focus:ring-4 focus:ring-iris-500/15"
          />
        </div>

        {isSignUp &&
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-ink-700">
              รหัสนักศึกษา
            </label>
            <input
              id="ramaId"
              value={ramaId}
              onChange={(e) => setRamaId(e.target.value)}
              type="text"
              required
              placeholder="รหัสนักศึกษาเฉพาะตัวเลข (ไม่ต้องมี u นำหน้า)"
              className="w-full rounded-lg border border-ink-900/12 bg-white px-3.5 py-2.5 text-[14.5px] text-ink-900 placeholder:text-ink-300 transition focus:border-iris-500 focus:ring-4 focus:ring-iris-500/15"
            />
          </div>
        }

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-[13px] font-medium text-ink-700">
              Password
            </label>
            {!isSignUp && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[13px] font-medium text-iris-600 hover:text-iris-700"
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-ink-900/12 bg-white px-3.5 py-2.5 pr-10 text-[14.5px] text-ink-900 placeholder:text-ink-300 transition focus:border-iris-500 focus:ring-4 focus:ring-iris-500/15"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13.5px] text-red-700">
            {error}
          </div>
        )}
        {notice && (
          <div className="rounded-lg border border-mesh-teal/30 bg-mesh-teal/10 px-3.5 py-2.5 text-[13.5px] text-emerald-700">
            {notice}
          </div>
        )}

        <button
          type="submit"
          disabled={loading !== null}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-iris-500 to-iris-700 py-2.5 text-[14.5px] font-semibold text-white shadow-button transition hover:from-iris-500 hover:to-iris-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading === "email" && <Spinner />}
          {isSignUp ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-7 text-center text-[14px] text-ink-500">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(isSignUp ? "sign-in" : "sign-up");
            setError(null);
            setNotice(null);
          }}
          className="font-medium text-iris-600 hover:text-iris-700"
        >
          {isSignUp ? "Sign in" : "Sign up"}
        </button>
      </p>
    </div>
  );
}

function Spinner({ className = "text-white" }: { className?: string }) {
  return (
    <svg className={`h-4 w-4 animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a20.4 20.4 0 0 1-3.22 4.44M14.12 14.12a3 3 0 1 1-4.24-4.24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M1 1l22 22" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
