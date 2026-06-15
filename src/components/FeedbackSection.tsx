import React, { useState, useEffect } from "react";
import { Feedback } from "../types";
import { MessageSquare, Send, Sparkles, Star, User, Mail, PlusCircle } from "lucide-react";

export default function FeedbackSection() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [requestUpdate, setRequestUpdate] = useState("");
  const [disasterReference, setDisasterReference] = useState("");
  const [rating, setRating] = useState(5);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch recent comments on load
  const loadFeedbacks = async () => {
    try {
      const res = await fetch("/api/feedback");
      const data = await res.json();
      if (data.status === "success") {
        setFeedbackList(data.data);
      }
    } catch (err) {
      console.error("Failed to load feedback from server:", err);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !comment.trim() || !requestUpdate.trim()) {
      setMessage({ type: "error", text: "Please complete the required areas: Name, Comment, and Feature Request." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          comment,
          requestUpdate,
          disasterReference: disasterReference || undefined,
          rating
        })
      });

      const data = await res.json();
      if (data.status === "success") {
        setMessage({ type: "success", text: "Your research advisory feedback has been filed successfully!" });
        // Reset form
        setUsername("");
        setEmail("");
        setComment("");
        setRequestUpdate("");
        setDisasterReference("");
        setRating(5);
        // Refresh feedback list
        loadFeedbacks();
      } else {
        throw new Error(data.message || "Failed to submit.");
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="feedback-hub" className="border-t border-slate-800 bg-slate-950/40 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 text-[11px] font-bold text-emerald-400 rounded-full mb-3 uppercase tracking-wider">
            <MessageSquare className="h-3 w-3" />
            Advisory Console
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight sm:text-3xl">Feedback & Update Proposal</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2">
            Submit scientific feedback or propose natural events/metrics you want to see rendered in our upcoming simulation telemetry updates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Block: Form Column */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <PlusCircle className="h-4.5 w-4.5 text-emerald-400" />
              File Simulation Advisory Form
            </h3>

            {message && (
              <div className={`p-4 rounded-xl text-xs mb-4 border ${
                message.type === "success" 
                  ? "bg-emerald-950/50 text-emerald-400 border-emerald-900" 
                  : "bg-red-950/50 text-red-400 border-red-900"
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase font-mono">Researcher Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Dr. Jane Doe"
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-slate-700 font-medium"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase font-mono">Institutional Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. jane@geotech.org"
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-slate-700 font-medium"
                  />
                </div>
              </div>

              {/* Rating representation */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase font-mono">Aegis Simulation Accuracy Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="text-slate-500 hover:scale-110 transition-transform"
                    >
                      <Star className={`h-5 w-5 ${star <= rating ? "fill-amber-400 text-amber-500" : "text-slate-700"}`} />
                    </button>
                  ))}
                  <span className="text-[10px] uppercase font-mono text-slate-500 ml-2">({rating}/5 stars)</span>
                </div>
              </div>

              {/* Disaster Reference */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase font-mono">Disaster Module Reference</label>
                <select
                  value={disasterReference}
                  onChange={(e) => setDisasterReference(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-slate-700 font-medium"
                >
                  <option value="">General Research Platform</option>
                  <option value="Earthquakes">Earthquakes Module</option>
                  <option value="Volcanoes">Volcanos Module</option>
                  <option value="Tsunamis">Tsunamis Module</option>
                  <option value="Cyclones">Cyclones Module</option>
                  <option value="Tornadoes">Tornadoes Module</option>
                  <option value="Floods">Floods Module</option>
                </select>
              </div>

              {/* COMMENT AREA */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase font-mono">Comment regarding Platform *</label>
                <textarea
                  required
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What is your opinion or observation regarding our real-time physical simulation mechanics?"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-slate-700 leading-relaxed font-medium"
                />
              </div>

              {/* REQUEST UPDATE FORM SECTION - SEPARATE AND EXPLICIT */}
              <div className="p-3.5 bg-emerald-950/20 border border-emerald-900/40 rounded-xl">
                <label className="block text-xs font-bold text-emerald-400 mb-1.5 uppercase font-mono flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  Proposed Next Update Request *
                </label>
                <textarea
                  required
                  rows={2}
                  value={requestUpdate}
                  onChange={(e) => setRequestUpdate(e.target.value)}
                  placeholder="What specific visual styles, disasters, or sensor data models should we deploy in the next software iteration?"
                  className="w-full px-3 py-2 bg-slate-950 border border-emerald-950/80 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-700 leading-relaxed font-medium"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:bg-slate-800 text-xs text-slate-950 font-bold rounded-lg cursor-pointer transition-colors"
              >
                {isSubmitting ? "Submitting advisory..." : "Submit Research Advisory"}
                <Send className="h-3 w-3" />
              </button>

            </form>
          </div>

          {/* Right Block: Live Feed comments listing */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="h-4.5 w-4.5 text-slate-400" />
              Recent Research Advisories & Features Filed
            </h3>

            {feedbackList.length === 0 ? (
              <div className="p-8 bg-slate-900/40 rounded-2xl border border-slate-850 text-center">
                <p className="text-xs text-slate-500">No advisories filed yet. Be the first explorer to contribute science parameters!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[510px] overflow-y-auto pr-1">
                {feedbackList.map((feedback) => (
                  <div 
                    key={feedback.id}
                    className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-755 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-slate-850 border border-slate-800 flex items-center justify-center font-bold text-xs text-emerald-400">
                            {feedback.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white select-text">{feedback.username}</h4>
                            <span className="text-[9px] font-mono text-slate-500">{feedback.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {feedback.disasterReference && (
                            <span className="text-[9px] uppercase font-mono font-bold text-emerald-400 px-2 py-0.5 bg-slate-950 border border-slate-850 rounded">
                              {feedback.disasterReference}
                            </span>
                          )}
                          <div className="flex text-amber-400">
                            {Array.from({ length: feedback.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-500" />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* General platform feedback message */}
                      <p className="text-xs text-slate-300 leading-relaxed italic select-text mb-3">
                        "{feedback.comment}"
                      </p>

                      {/* Separate section representing requested next updates */}
                      <div className="mt-3 pt-3 border-t border-slate-800/40 bg-emerald-950/10 p-3 rounded-lg border border-emerald-950/40">
                        <span className="text-[9px] uppercase font-mono font-bold text-emerald-400 block mb-1">
                          Proposed Next Update Request:
                        </span>
                        <p className="text-xs text-emerald-200 select-text font-medium leading-relaxed">
                          {feedback.requestUpdate}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 text-right text-[9px] text-slate-500 font-mono">
                      Filed: {new Date(feedback.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
