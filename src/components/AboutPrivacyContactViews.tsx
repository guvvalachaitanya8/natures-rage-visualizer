import React, { useState } from "react";
import { HelpCircle, Shield, Mail, Send, CheckCircle2, Sparkles, MapPin, Phone, Building } from "lucide-react";

export function AboutView() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <HelpCircle className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
        <h2 className="text-3xl font-black text-white tracking-tight">About Nature's Rage</h2>
        <p className="text-sm text-slate-400 mt-2">Nature's Rage is a global simulation dashboard tracking violent geophysical transformations.</p>
      </div>

      <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            1. Core Mission & High-Fidelity Physics Models
          </h3>
          <p className="text-slate-300">
            Nature's Rage specializes in compiling computational simulations of destructive geological and atmospheric phases. Our models allow geophysicists, educational sectors, and enthusiast divisions to explore dynamic safety constraints and sensory decibel ranges under varied natural phenomena stresses. By synthesizing mathematical modeling matrices and predictive AI (utilizing Gemini models), we generate highly responsive representations of fluid mass velocity, thermal expansions, and fault displacement vectors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <h4 className="text-sm font-bold text-white mb-2">Seismology Analysis Matrix</h4>
            <p className="text-xs text-slate-400">
              Our continuous ground-shearing algorithms model tectonic friction using physical mass-spring system equations. This computes plausible secondary wave releases across all magnitudes (1-2 up to maximum recorded limits).
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <h4 className="text-sm font-bold text-white mb-2">Convective Meteorology Tracker</h4>
            <p className="text-xs text-slate-400">
              Tropical warm atmospheric vortex generators utilize fluid friction values to track Category Saffir-Simpson velocity indices alongside sudden barometric pressure changes in storm eye quadrants.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-base font-bold text-white mb-2">2. Visual Aesthetics Paradigm</h3>
          <p className="text-slate-400 text-xs">
            To accommodate both educational sectors and advanced simulation labs, the platform implements binary visual types: **No. 1 Cartoonish Drawing** focuses on simplified high-contrast vector lines for visual safety guidelines, while **No. 2 Real Visual Type** models multi-layered volumetric particle systems, turbulent flow noise, and high-fidelity lighting shaders.
          </p>
        </div>
      </div>
    </div>
  );
}

export function PrivacyView() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 select-text">
      <div className="text-center mb-10">
        <Shield className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
        <h2 className="text-3xl font-black text-white tracking-tight">Privacy Policy</h2>
        <p className="text-sm text-slate-400 mt-2">Nature's Rage Security and Data Transparency Standard.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-6 text-sm text-slate-300 leading-relaxed">
        <div>
          <h3 className="text-base font-bold text-white mb-2 font-mono">1. Information Governance & Simulation Logs</h3>
          <p className="text-slate-400 text-xs">
            Nature's Rage operates strictly under non-disclosure privacy standards. We do not extract user terminal parameters or personal browser credentials during the visual animation renders. Collected advisory forms, emails, and update proposals are kept in simple storage purely to coordinate software updates. No analytical telemetry is shared or traded with commercial or target-marketing segments.
          </p>
        </div>

        <div className="border-t border-slate-800 pt-5">
          <h3 className="text-base font-bold text-white mb-2 font-mono">2. Analytical Cookies Policy</h3>
          <p className="text-slate-400 text-xs text-justify">
            This platform secures cookies in-memory purely to persist temporary local display choices, including "Cartoonish" vs "Real" styles, and to prevent state disruption during navigation. No telemetry scripts trace geographical sub-surface metrics or external browser tabs.
          </p>
        </div>

        <div className="border-t border-slate-800 pt-5">
          <h3 className="text-base font-bold text-white mb-2 font-mono">3. Compliance Standards</h3>
          <p className="text-slate-400 text-xs">
            We confirm alignment with global scientific database frameworks, ensuring research nodes have immediate deletion authority over submitted feedback comment entries. Address requests to delete recorded names directly via our secure institutional portals.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ContactView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <Mail className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
        <h2 className="text-3xl font-black text-white tracking-tight">Contact Nature's Rage Team</h2>
        <p className="text-sm text-slate-400 mt-2">We coordinate research programs with global geological institutes and meteorological stations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Information column */}
        <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white mb-4">Research Base Office</h3>
          
          <div className="flex items-start gap-3 text-xs leading-relaxed text-slate-400">
            <Building className="h-4.5 w-4.5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-white">Nature's Rage Hub</p>
              <p>Tectonic and Severe Weather Digital Lab</p>
              <p>Interactive Physical Simulation Division</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-slate-400">
            <MapPin className="h-4.5 w-4.5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p>3000 Ingress Avenue, Cloud Run Hub</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-slate-400">
            <Phone className="h-4.5 w-4.5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p>+1 (800) GEO-SIMS</p>
              <p>Lines active 24/7 UTC</p>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="md:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          {isSent ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-white">Message Dispatched!</h4>
              <p className="text-xs text-slate-450 mt-2 max-w-sm mx-auto">
                Your meteorological or geological research proposal was securely routed to our planetary sciences desk. Expect review confirmation within 24 UTC.
              </p>
              <button
                onClick={() => {
                  setIsSent(false);
                  setName("");
                  setEmail("");
                  setTitle("");
                  setMessage("");
                }}
                className="mt-6 px-4 py-2 bg-slate-950 text-emerald-400 text-xs font-semibold rounded-lg border border-slate-800 hover:bg-slate-900 cursor-pointer"
              >
                File Another Communication
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase font-mono">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Prof. Alan Gray"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-slate-700 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase font-mono">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alan.g@seismology.org"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-slate-700 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase font-mono">Subject / Institute</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Seismic Wave Collaborative Verification Node"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-slate-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase font-mono">Proposal Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Draft your proposal, computational resource requests, or collaboration questions..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-slate-700 leading-relaxed font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-xs text-slate-950 font-bold rounded-lg cursor-pointer transition-colors"
              >
                Send Secure Message
                <Send className="h-3 w-3" />
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
