import React, { useState, useEffect } from "react";
import { Lock, AlertTriangle, ArrowRight, Zap, Shield } from "lucide-react";

interface AdminProtectedRouteProps {
  children: React.ReactElement;
  onBack: () => void;
  onAuthenticated: (token: string) => void;
}

export default function AdminProtectedRoute({ children, onBack, onAuthenticated }: AdminProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      setIsAuthenticated(true);
      onAuthenticated(token);
    }
  }, [onAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.status === "success" && data.token) {
        localStorage.setItem("admin_token", data.token);
        setIsAuthenticated(true);
        onAuthenticated(data.token);
      } else {
        setLoginError(data.message || "Invalid administrative passcode.");
      }
    } catch (err) {
      setLoginError("Failed to issue credentials. Verify local server runtime.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col justify-center min-h-[75vh]">
      
      {/* Header Panel mock for layout continuity */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5 mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
            <Shield className="h-6 w-6 text-emerald-400" />
            Core Aegis Controls
          </h1>
          <p className="text-xs text-slate-400 font-medium font-mono mt-1">
            Secure Administrator Hub / Port Authority Matrix
          </p>
        </div>
        <div>
          <button 
            onClick={onBack}
            className="px-3.5 py-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-xs font-bold rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            Terminal View
          </button>
        </div>
      </div>

      {/* JWT Login Center */}
      <div className="max-w-md mx-auto my-6 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden w-full">
        <div className="absolute top-0 right-0 p-3 opacity-20">
          <Lock className="h-16 w-16 text-slate-600" />
        </div>

        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Lock className="h-5 w-5 text-emerald-400" />
          Establish Port Connection
        </h3>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Specify administration credentials to connect.
        </p>

        {loginError && (
          <div className="p-3.5 rounded-lg bg-red-950/50 border border-red-900/30 text-red-400 text-xs mb-4 flex items-start gap-2 select-none">
            <AlertTriangle className="h-4.5 w-4.5 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">User Identity</label>
            <input 
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-slate-700 font-mono"
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">Administrative Code</label>
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-slate-700 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 transition-colors text-slate-950 font-extrabold text-xs rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? "Opening Tunnel..." : "Establish Aegis Connection"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>Rate Limiting Protected</span>
          <span className="flex items-center gap-1 text-emerald-500">
            <Zap className="h-3 w-3" /> SSL Active
          </span>
        </div>
      </div>
    </div>
  );
}
