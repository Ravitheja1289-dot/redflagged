"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type PendingItem = {
  type: 'NEW_REPORT' | 'REVISION';
  id: string;
  reportId: string;
  city: string;
  year: number;
  narrative: string;
  advice: string;
  pseudonym: string;
  createdAt: string;
  moderatorFeedback: string | null;
  incidentTypes: string[];
  context: string;
  behaviors: string[];
};

export default function AdminDashboard() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackText, setFeedbackText] = useState("");
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const router = useRouter();

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/reports");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      toast.error("Failed to load queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAction = async (id: string, type: string, action: string, feedback?: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, action, feedback }),
      });
      
      if (res.ok) {
        toast.success(`Successfully applied action: ${action}`);
        fetchItems();
        setActiveItem(null);
        setFeedbackText("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Action failed");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  if (loading) return <div className="p-20 text-center">Loading queue...</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-foreground">Moderation Queue</h1>
        <div className="flex gap-4 items-center">
          <span className="bg-secondary/10 px-3 py-1 rounded-full text-sm font-medium">{items.length} Pending</span>
          <button onClick={handleLogout} className="text-sm font-medium text-secondary hover:text-foreground">Logout</button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-soft-border">
          <p className="text-foreground font-medium">The queue is empty. Great job!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {items.map(item => (
            <div key={item.id} className="bg-surface border border-soft-border rounded-2xl p-8 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-3 items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${item.type === 'NEW_REPORT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                    {item.type === 'NEW_REPORT' ? 'NEW SUBMISSION' : 'REVISION (EDIT)'}
                  </span>
                  <span className="text-sm text-secondary">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-sm text-secondary text-right">
                  <div><strong>ID:</strong> <span className="font-mono">{item.reportId}</span></div>
                  <div><strong>Pseudonym:</strong> {item.pseudonym}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-6 mb-8 border-t border-b border-soft-border py-6">
                <div className="md:col-span-1 border-r border-soft-border pr-6 space-y-4">
                  <div>
                    <span className="text-xs text-secondary uppercase tracking-wider block mb-1">Context</span>
                    <span className="font-medium text-foreground">{item.context}</span>
                  </div>
                  <div>
                    <span className="text-xs text-secondary uppercase tracking-wider block mb-1">Location & Time</span>
                    <span className="font-medium text-foreground">{item.city} &middot; {item.year}</span>
                  </div>
                  <div>
                    <span className="text-xs text-secondary uppercase tracking-wider block mb-2">Categories</span>
                    <div className="flex flex-wrap gap-1">
                      {item.incidentTypes.map(t => <span key={t} className="text-xs bg-secondary/10 px-2 py-1 rounded">{t}</span>)}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-secondary uppercase tracking-wider block mb-2">Behaviors</span>
                    <div className="flex flex-wrap gap-1">
                      {item.behaviors.map(b => <span key={b} className="text-xs bg-accent-secondary/30 text-foreground px-2 py-1 rounded">{b}</span>)}
                    </div>
                  </div>
                </div>
                <div className="md:col-span-3 space-y-6">
                  <div>
                    <span className="text-xs text-secondary uppercase tracking-wider block mb-2">Narrative</span>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{item.narrative}</p>
                  </div>
                  {item.advice && item.advice.trim().length > 0 && (
                    <div>
                      <span className="text-xs text-secondary uppercase tracking-wider block mb-2">Advice</span>
                      <p className="text-foreground leading-relaxed italic border-l-2 border-soft-border pl-4">{item.advice}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                {activeItem === item.id ? (
                  <div className="w-full flex gap-3 items-start">
                    <textarea 
                      placeholder="Explain what personal information needs to be removed..."
                      className="flex-1 p-3 border border-soft-border rounded-lg text-sm bg-background resize-none focus:outline-none focus:border-accent"
                      rows={2}
                      value={feedbackText}
                      onChange={e => setFeedbackText(e.target.value)}
                      autoFocus
                    />
                    <div className="flex flex-col gap-2 shrink-0">
                      <button 
                        onClick={() => handleAction(item.id, item.type, 'REQUEST_CHANGES', feedbackText)}
                        disabled={!feedbackText.trim()}
                        className="px-4 py-2 bg-accent text-surface rounded-lg text-sm font-medium hover:bg-accent/90 disabled:opacity-50"
                      >
                        Send Request
                      </button>
                      <button onClick={() => { setActiveItem(null); setFeedbackText(""); }} className="px-4 py-2 border border-soft-border rounded-lg text-sm font-medium hover:bg-background">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      {item.moderatorFeedback ? (
                        <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200 inline-flex">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          <span className="font-medium">Waiting on user:</span>
                          <span className="truncate max-w-[200px]">{item.moderatorFeedback}</span>
                          <button onClick={() => { setFeedbackText(item.moderatorFeedback || ""); setActiveItem(item.id); }} className="ml-2 font-bold underline hover:text-yellow-800">Edit</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setActiveItem(item.id)}
                          className="text-sm font-medium text-accent hover:underline"
                        >
                          Request Changes
                        </button>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          toast.custom((t) => (
                            <div className="bg-surface border border-soft-border p-4 rounded-xl shadow-lg w-[320px]">
                              <h3 className="font-bold text-foreground mb-2">Reject this report?</h3>
                              <p className="text-sm text-secondary mb-4">It will be permanently hidden from public view.</p>
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => toast.dismiss(t)} className="px-4 py-2 border border-soft-border rounded-lg text-sm font-medium hover:bg-background">Cancel</button>
                                <button onClick={() => { toast.dismiss(t); handleAction(item.id, item.type, 'REJECT'); }} className="px-4 py-2 bg-accent text-surface rounded-lg text-sm font-medium hover:bg-accent/90">Reject</button>
                              </div>
                            </div>
                          ), { duration: Infinity });
                        }}
                        className="px-6 py-2 border border-soft-border text-foreground rounded-full text-sm font-medium hover:bg-background"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleAction(item.id, item.type, 'APPROVE')}
                        className="px-8 py-2 bg-foreground text-surface rounded-full text-sm font-medium hover:bg-foreground/90"
                      >
                        Approve & Publish
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
