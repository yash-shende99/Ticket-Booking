"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="max-w-md mx-auto pt-10 pb-24 md:py-16 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1] mb-2">Welcome Back</h1>
        <p className="text-slate-500 font-medium">Log in to manage your tickets.</p>
      </div>

      <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 shadow-[0_8px_32px_rgb(0,0,0,0.03)] border border-white/80">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl text-center border border-red-100">{error}</div>}
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-white/60 border border-white rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium text-slate-800 placeholder-slate-400 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]" 
              placeholder="hello@example.com" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-white/60 border border-white rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium text-slate-800 placeholder-slate-400 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]" 
              placeholder="••••••••" 
              required 
            />
          </div>
          <button 
            disabled={loading} 
            type="submit" 
            className="w-full bg-[#111] hover:bg-black text-white font-bold py-4 px-6 rounded-full transition-colors mt-4 disabled:opacity-50 text-lg shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>}
          </button>
        </form>
        
        <p className="text-center text-sm font-medium text-slate-500 mt-6">
          Don't have an account? <Link href="/register" className="text-slate-900 font-bold hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
