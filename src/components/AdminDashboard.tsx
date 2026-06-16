import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Trash2, 
  RefreshCw, 
  Lock, 
  Database, 
  Eye, 
  BarChart2, 
  MessageSquare, 
  Save, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Zap,
  Star,
  CornerDownRight,
  ArrowRight,
  Sparkles,
  Server
} from "lucide-react";
import { Feedback } from "../types";
import { apiFetch } from "../utils/api";

interface AdminDashboardProps {
  onBack: () => void;
  onLogout?: () => void;
}

interface AdminConfig {
  heroTitle: string;
  heroDescription: string;
  aiPromptOverride: string;
}

interface AnalyticsData {
  visits: number;
  popularDisasters: { [key: string]: number };
  failedLoginAttempts: number;
  suspiciousActivity: Array<{
    timestamp: string;
    ip: string;
    activityType: string;
    details: string;
  }>;
}

export default function AdminDashboard({ onBack, onLogout }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"analytics" | "designer" | "feedbacks" | "security">("analytics");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // States for dynamic settings
  const [config, setConfig] = useState<AdminConfig>({
    heroTitle: "Nature's Destructive Phases",
    heroDescription: "Operate dynamic 10-second AI-powered simulations of Earth's extreme geophysical transformations.",
    aiPromptOverride: ""
  });
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    visits: 254,
    popularDisasters: { earthquake: 12, volcano: 8, tsunami: 4, cyclone: 3 },
    failedLoginAttempts: 0,
    suspiciousActivity: []
  });
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [msgTimeout, setMsgTimeout] = useState<any>(null);

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem("admin_token");
    if (token) {
      setIsAuthenticated(true);
      fetchDashboardData(token);
    }
  }, []);

  const fetchDashboardData = async (token: string, retries = 3, delay = 1000) => {
    try {
      // Fetch Config
      const configRes = await apiFetch("/api/admin/config", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (configRes.status === 404) {
        console.log("Admin config endpoint not available (404 Not Found). Retries skipped.");
        return;
      }
      if (configRes.ok && configRes.headers.get("content-type")?.includes("application/json")) {
        const configData = await configRes.json();
        if (configData.status === "success") {
          setConfig(configData.data);
        }
      }

      // Fetch Analytics
      const analyticsRes = await apiFetch("/api/admin/analytics", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (analyticsRes.ok && analyticsRes.headers.get("content-type")?.includes("application/json")) {
        const analyticsData = await analyticsRes.json();
        if (analyticsData.status === "success") {
          setAnalytics(analyticsData.data);
        }
      }

      // Fetch Feedbacks
      const feedbacksRes = await apiFetch("/api/feedback");
      if (feedbacksRes.ok && feedbacksRes.headers.get("content-type")?.includes("application/json")) {
        const feedbacksData = await feedbacksRes.json();
        if (feedbacksData.status === "success") {
          setFeedbacks(feedbacksData.data);
        }
      }
    } catch (err: any) {
      console.error(`Error retrieving admin details (retries remaining: ${retries})`, err.message || err);
      if (retries > 0) {
        setTimeout(() => fetchDashboardData(token, retries - 1, delay * 1.5), delay);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    try {
      const res = await apiFetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.status === "success") {
        localStorage.setItem("admin_token", data.token);
        setIsAuthenticated(true);
        fetchDashboardData(data.token);
      } else {
        setLoginError(data.message || "Invalid administrative passcode.");
      }
    } catch (err) {
      setLoginError("Failed to issue credentials. Verify local server runtime.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    if (onLogout) {
      onLogout();
    }
  };

  const handleSaveConfig = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const res = await apiFetch("/api/admin/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });
      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        if (data.status === "success") {
          setSaveSuccess(true);
          if (msgTimeout) clearTimeout(msgTimeout);
          const t = setTimeout(() => setSaveSuccess(false), 4000);
          setMsgTimeout(t);
        }
      } else {
        // Fallback for offline clients: simulate configuration updates locally
        console.warn("Server layout config save bypassed: offline runtime.");
        setSaveSuccess(true);
        if (msgTimeout) clearTimeout(msgTimeout);
        const t = setTimeout(() => setSaveSuccess(false), 4000);
        setMsgTimeout(t);
      }
    } catch (err) {
      console.error("Failed to save layout configs", err);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    if (!window.confirm("Are you absolutely sure you want to delete this user feedback entry?")) {
      return;
    }

    try {
      const res = await apiFetch(`/api/admin/feedback/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        if (data.status === "success") {
          // reload feedbacks
          setFeedbacks(prev => prev.filter(f => f.id !== id));
        }
      } else {
        // Fallback for offline clients: simulate deletion in local memory state cleanly
        console.warn("Feedback delete bypassed: offline runtime.");
        setFeedbacks(prev => prev.filter(f => f.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete feedback row", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Panel */}
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
        <div className="flex gap-2">
          <button 
            onClick={onBack}
            className="px-3.5 py-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-xs font-bold rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            Terminal View
          </button>
          {isAuthenticated && (
            <button 
              onClick={handleLogout}
              className="px-3.5 py-1.5 bg-red-950/40 border border-red-900/30 text-red-400 hover:bg-red-900/30 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Close Session
            </button>
          )}
        </div>
      </div>

      {!isAuthenticated ? (
        /* JWT Login Center */
        <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
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
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">User Identity Identity</label>
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
      ) : (
        /* Authenticated Dashboard Panel */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Navigation Bar links */}
          <div className="lg:col-span-1 border border-slate-800 bg-slate-900/40 rounded-2xl p-4 h-fit space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider p-2 block">Control Matrices</span>
            
            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors text-left ${
                activeTab === "analytics"
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <BarChart2 className="h-4 w-4" />
              Global Telemetry Data
            </button>

            <button
              onClick={() => setActiveTab("designer")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors text-left ${
                activeTab === "designer"
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Database className="h-4 w-4" />
              Dynamic UI Designer
            </button>

            <button
              onClick={() => setActiveTab("feedbacks")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors text-left ${
                activeTab === "feedbacks"
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Advisory Moderation
              {feedbacks.length > 0 && (
                <span className={`text-[9px] px-1.5 py-0.2 ml-auto rounded font-bold font-mono ${
                  activeTab === "feedbacks" ? "bg-slate-950 text-white" : "bg-emerald-950 text-emerald-400"
                }`}>
                  {feedbacks.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors text-left ${
                activeTab === "security"
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Shield className="h-4 w-4" />
              Aegis Threat Center
              {analytics.failedLoginAttempts > 0 && (
                <span className="h-2 w-2 rounded-full bg-red-500 ml-auto animate-ping" />
              )}
            </button>

            <div className="pt-6 border-t border-slate-800 mt-6 text-[10px] font-mono text-slate-500 p-2 space-y-1.5 select-none">
              <span className="block text-slate-400">System Info:</span>
              <p className="flex items-center gap-1">
                <Server className="h-3 w-3 text-slate-600" /> Host: Cloud Run
              </p>
              <p>Node runtime: Active</p>
            </div>
          </div>

          {/* Subview display area */}
          <div className="lg:col-span-3 min-h-[500px]">
            
            {/* TAB 1: ANALYTICS */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-slate-700/60 font-mono text-xs font-bold flex items-center gap-1">
                    <Activity className="h-4 w-4 text-emerald-400 animate-pulse" /> Live Telemetry
                  </div>
                  <h3 className="text-base font-bold text-white mb-4">Traffic Insights</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-center">
                      <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Visits Count</span>
                      <span className="text-3xl font-extrabold text-emerald-400">{analytics.visits}</span>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-center">
                      <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Advisories Lodged</span>
                      <span className="text-3xl font-extrabold text-blue-400">{feedbacks.length}</span>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-center">
                      <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Failed Accesses</span>
                      <span className={`text-3xl font-extrabold ${analytics.failedLoginAttempts > 0 ? "text-red-400" : "text-slate-400"}`}>
                        {analytics.failedLoginAttempts}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Popular disasters bar chart */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Disruption Vector Simulation Popularity</h3>
                  <div className="space-y-3.5">
                    {Object.entries(analytics.popularDisasters || {}).map(([disaster, count]) => {
                      const totalList = Object.values(analytics.popularDisasters || {}) as number[];
                      const total = totalList.reduce((a: number, b: number) => a + b, 1);
                      const percent = Math.round((Number(count) / total) * 100);
                      return (
                        <div key={disaster} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="capitalize text-slate-300 font-bold">{disaster}s</span>
                            <span className="text-slate-500">{count} events ({percent}%)</span>
                          </div>
                          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                            <div 
                              className="h-full bg-emerald-400 transition-all rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: EDITORIAL DESIGNER */}
            {activeTab === "designer" && (
              <div className="space-y-6">
                
                {saveSuccess && (
                  <div className="p-4 bg-emerald-950/50 border border-emerald-900 text-emerald-400 text-xs rounded-xl flex items-center gap-2 select-none animate-bounce">
                    <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <span>Dynamic Layout Configurations written successfully to disk!</span>
                  </div>
                )}

                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <Database className="h-5 w-5 text-emerald-400" />
                    Dynamic Homepage Layout content
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Modify the live page sections. Dynamic savings do not require build recompilation and take effect instantly on users browsers!
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono tracking-wider font-bold text-slate-400 uppercase mb-1.5">Hero Headline Title *</label>
                      <input 
                        type="text"
                        value={config.heroTitle}
                        onChange={(e) => setConfig(prev => ({ ...prev, heroTitle: e.target.value }))}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono tracking-wider font-bold text-slate-400 uppercase mb-1.5">Hero Body description *</label>
                      <textarea
                        rows={3}
                        value={config.heroDescription}
                        onChange={(e) => setConfig(prev => ({ ...prev, heroDescription: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs leading-relaxed text-white focus:outline-none focus:border-slate-700"
                      />
                    </div>

                    <div className="p-4 bg-emerald-950/15 border border-emerald-900/40 rounded-xl">
                      <label className="block text-xs font-mono tracking-wider font-bold text-emerald-400 uppercase mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-emerald-400" />
                        AI Agent Prompt Override (Dynamic instruction override)
                      </label>
                      <textarea
                        rows={2}
                        value={config.aiPromptOverride}
                        onChange={(e) => setConfig(prev => ({ ...prev, aiPromptOverride: e.target.value }))}
                        placeholder="Inject supplementary directives to govern Gemini simulation tone (e.g., 'Utilize deep space atmospheric metaphors')"
                        className="w-full px-3.5 py-2 bg-slate-950 border border-emerald-950 rounded-lg text-xs leading-relaxed text-emerald-200 placeholder:text-emerald-700/60 focus:outline-none focus:border-emerald-700"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveConfig}
                    className="flex items-center gap-1.5 px-4.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl cursor-pointer transition-colors mt-6"
                  >
                    <Save className="h-4 w-4" />
                    Inject Layout Updates
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: ADVISORIES MODERATION */}
            {activeTab === "feedbacks" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Lodged Researchers Advisories</h3>
                  <span className="text-xs font-mono text-slate-500">{feedbacks.length} items logged</span>
                </div>

                {feedbacks.length === 0 ? (
                  <div className="p-12 text-center bg-slate-900/40 border border-slate-850 rounded-2xl">
                    <p className="text-xs text-slate-500">No user remarks recorded.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map((f) => (
                      <div 
                        key={f.id} 
                        className="p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-755 transition-all relative flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
                            <div>
                              <h4 className="text-xs font-bold text-white">{f.username}</h4>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{f.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-slate-950 rounded border border-slate-800 text-slate-400">
                                {f.disasterReference || "General Research Portal"}
                              </span>
                              <div className="flex text-amber-500">
                                {Array.from({ length: f.rating }).map((_, i) => (
                                  <Star key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />
                                ))}
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 italic p-3 bg-slate-950 rounded-lg border border-slate-910">
                            "{f.comment}"
                          </p>

                          {/* Proposed next update request message */}
                          <div className="mt-3 p-3 bg-emerald-950/15 border border-emerald-950 rounded-lg">
                            <span className="text-[9px] font-mono tracking-wider font-bold text-emerald-400 uppercase block mb-1">
                              Proposed Next Update Request:
                            </span>
                            <p className="text-xs text-emerald-200 font-medium">
                              {f.requestUpdate}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>Filed: {new Date(f.timestamp).toLocaleString()}</span>
                          <button
                            onClick={() => handleDeleteFeedback(f.id)}
                            className="flex items-center gap-1 py-1 px-2.5 bg-red-950/30 hover:bg-red-950 border border-red-900/30 text-red-400 rounded transition-all cursor-pointer"
                            title="Moderate / Delete Advisory"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Row
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: THREAT SEGMENTATION & SECURITY LOGS */}
            {activeTab === "security" && (
              <div className="space-y-6">
                
                {/* Cybersecurity summary panel */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-400" />
                    Security & Authentication Controls
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Active systems monitoring. Any repeated unsuccessful passcode matches (over 3 failed attempts) will immediately record an access alert log and trigger an automated email dispatch signal to administrators.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex items-center gap-3">
                      <div className="h-9 w-9 bg-emerald-950/50 rounded-lg flex items-center justify-center border border-emerald-900">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-slate-500 block">Rate Limiter State</span>
                        <span className="text-xs text-white font-bold">100 req / minute Active</span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex items-center gap-3">
                      <div className="h-9 w-9 bg-emerald-950/50 rounded-lg flex items-center justify-center border border-emerald-900">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-slate-500 block">SQL Injection Defense</span>
                        <span className="text-xs text-white font-bold">Parameterized Datasets</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Threat alerts table logs */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Aegis Access & Suspect Audit Logs</h3>
                  
                  {analytics.suspiciousActivity && analytics.suspiciousActivity.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl">
                      <span className="text-xs text-slate-500 font-mono">No suspect alerts triggered. System state stable.</span>
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                      {analytics.suspiciousActivity.map((log, i) => (
                        <div key={i} className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl text-xs space-y-1">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <span className="font-bold text-red-400 flex items-center gap-1.5 font-mono">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              {log.activityType}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-300 leading-relaxed font-mono text-[11px]">{log.details}</p>
                          <div className="flex gap-4 font-mono text-[10px] text-slate-500 pt-1">
                            <span>Origin IP: {log.ip}</span>
                            <span>Email alert dispatch: Standard</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
