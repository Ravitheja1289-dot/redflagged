"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import { PostCard } from "@/components/PostCard";
import { FormattedText } from "@/components/FormattedText";

type PendingReport = {
  type: 'NEW_REPORT' | 'REVISION';
  id: string;
  reportId: string;
  title: string;
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

type PendingComment = {
  id: string;
  report_id: string;
  pseudonym: string;
  body: string;
  created_at: string;
  status: string;
};

type PendingFlag = {
  id: string;
  type: 'REPORT_FLAG' | 'COMMENT_FLAG';
  target_id: string;
  reason: string;
  details: string;
  created_at: string;
  status: string;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'REPORTS' | 'COMMENTS' | 'FLAGS' | 'FEED'>('REPORTS');
  
  const [reports, setReports] = useState<PendingReport[]>([]);
  const [comments, setComments] = useState<PendingComment[]>([]);
  const [flags, setFlags] = useState<PendingFlag[]>([]);
  
  // Feed tab states
  const [feedReports, setFeedReports] = useState<any[]>([]);
  const [feedSearch, setFeedSearch] = useState("");
  const [feedLoading, setFeedLoading] = useState(false);
  const [editingReport, setEditingReport] = useState<any | null>(null);
  const [selectedReportComments, setSelectedReportComments] = useState<any | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [reportComments, setReportComments] = useState<any[]>([]);
  const [editingComment, setEditingComment] = useState<{ id: string; body: string } | null>(null);

  const [loading, setLoading] = useState(true);
  const [feedbackText, setFeedbackText] = useState("");
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const router = useRouter();

  const fetchFeedReports = async () => {
    setFeedLoading(true);
    try {
      const res = await fetch("/api/admin/feed");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setFeedReports(data.reports || []);
    } catch (err) {
      toast.error("Failed to load feed");
    } finally {
      setFeedLoading(false);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [resReports, resComments, resFlags] = await Promise.all([
        fetch("/api/admin/reports"),
        fetch("/api/admin/comments"),
        fetch("/api/admin/flags")
      ]);

      if (resReports.status === 401) {
        router.push("/admin/login");
        return;
      }

      const [dataReports, dataComments, dataFlags] = await Promise.all([
        resReports.json(),
        resComments.json(),
        resFlags.json()
      ]);

      setReports(dataReports.items || []);
      setComments(dataComments.items || []);
      setFlags(dataFlags.items || []);

      // Pre-load feed in background
      fetchFeedReports();
    } catch (err) {
      toast.error("Failed to load queues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleReportAction = async (id: string, type: string, action: string, feedback?: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, action, feedback }),
      });
      if (res.ok) {
        toast.success(`Report action applied: ${action}`);
        fetchAll();
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

  const handleCommentAction = async (id: string, action: string) => {
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        toast.success(`Comment action applied: ${action}`);
        fetchAll();
      } else {
        const data = await res.json();
        toast.error(data.error || "Action failed");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleFlagAction = async (id: string, type: string, action: string, target_id: string) => {
    try {
      const res = await fetch(`/api/admin/flags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, action, target_id }),
      });
      if (res.ok) {
        toast.success(`Flag action applied: ${action}`);
        fetchAll();
      } else {
        const data = await res.json();
        toast.error(data.error || "Action failed");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleDeletePost = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this post? All associated comments and votes will also be permanently removed.")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Post deleted successfully");
        setFeedReports(prev => prev.filter(r => r.id !== reportId));
        if (selectedReportComments?.id === reportId) {
          setSelectedReportComments(null);
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete post");
      }
    } catch (err) {
      toast.error("An error occurred while deleting the post");
    }
  };

  const handleSaveEditPost = async () => {
    if (!editingReport) return;
    if (!editingReport.title?.trim()) {
      toast.error("Heading / Title cannot be empty");
      return;
    }
    if (!editingReport.narrative?.trim() || editingReport.narrative.trim().length < 10) {
      toast.error("Detailed narrative must be at least 10 characters");
      return;
    }

    try {
      const res = await fetch(`/api/admin/reports/${editingReport.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingReport.title,
          narrative: editingReport.narrative,
          city: editingReport.city,
          advice: editingReport.advice,
        }),
      });

      if (res.ok) {
        toast.success("Post updated successfully");
        setFeedReports(prev => prev.map(r => r.id === editingReport.id ? { ...r, ...editingReport } : r));
        setEditingReport(null);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to edit post");
      }
    } catch (err) {
      toast.error("An error occurred while updating the post");
    }
  };

  const handleOpenComments = async (report: any) => {
    setSelectedReportComments(report);
    setCommentsLoading(true);
    try {
      const res = await fetch(`/api/reports/${report.id}/comments`);
      const data = await res.json();
      setReportComments(data.comments || []);
    } catch (err) {
      toast.error("Failed to load comments");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Comment deleted");
        setReportComments(prev => prev.filter(c => c.id !== commentId));
        if (selectedReportComments) {
          setFeedReports(prev => prev.map(r => r.id === selectedReportComments.id ? { ...r, commentCount: Math.max(0, (r.commentCount || 1) - 1) } : r));
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete comment");
      }
    } catch (err) {
      toast.error("Failed to delete comment");
    }
  };

  const handleSaveEditComment = async () => {
    if (!editingComment || !editingComment.body.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    try {
      const res = await fetch(`/api/admin/comments/${editingComment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editingComment.body }),
      });
      if (res.ok) {
        toast.success("Comment updated");
        setReportComments(prev => prev.map(c => c.id === editingComment.id ? { ...c, body: editingComment.body } : c));
        setEditingComment(null);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update comment");
      }
    } catch (err) {
      toast.error("Failed to update comment");
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Moderation Queue</h1>
        <button onClick={handleLogout} className="text-sm font-medium text-secondary hover:text-foreground cursor-pointer">Logout</button>
      </div>

      {/* TABS HEADER - APPLE SEGMENTED CONTROL */}
      <div className="flex p-1.5 bg-surface rounded-2xl border border-soft-border mb-10 overflow-x-auto max-w-fit shadow-xs">
        {[
          { id: 'REPORTS', label: 'Reports', count: reports.length },
          { id: 'COMMENTS', label: 'Comments', count: comments.length },
          { id: 'FLAGS', label: 'Flags', count: flags.length },
          { id: 'FEED', label: 'Live Feed', count: feedReports.length },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'FEED' && feedReports.length === 0) fetchFeedReports();
              }}
              className={`relative px-5 py-2 text-sm font-medium rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-2 z-10 ${
                isActive ? 'text-foreground font-semibold' : 'text-secondary hover:text-foreground'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="adminActiveTabPill"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="absolute inset-0 bg-background rounded-xl border border-soft-border shadow-xs -z-10"
                />
              )}
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isActive ? 'bg-secondary/15 text-foreground' : 'bg-soft-border text-secondary'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* LIVE FEED TAB */}
      {activeTab === 'FEED' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-surface/80 border border-soft-border p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-foreground tracking-wide uppercase">Live Published Feed</span>
              <span className="text-xs text-secondary">({feedReports.length} total)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  value={feedSearch}
                  onChange={e => setFeedSearch(e.target.value)}
                  placeholder="Search posts, users, city..."
                  className="w-full bg-background border border-soft-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-secondary/60 focus:outline-none focus:border-accent"
                />
                {feedSearch && (
                  <button
                    onClick={() => setFeedSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-secondary hover:text-foreground"
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                onClick={fetchFeedReports}
                disabled={feedLoading}
                className="px-3 py-1.5 text-xs text-secondary hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer font-medium border border-soft-border rounded-xl bg-background hover:bg-surface shrink-0"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={feedLoading ? "animate-spin" : ""}>
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {feedLoading ? (
            <div className="text-center py-20 bg-surface rounded-2xl border border-soft-border">
              <p className="text-secondary text-sm">Loading published feed...</p>
            </div>
          ) : feedReports.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-2xl border border-soft-border">
              <p className="text-foreground font-medium mb-1">No published posts on the feed</p>
              <p className="text-secondary text-xs">Approved reports will show up here automatically.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {feedReports
                .filter(r => {
                  if (!feedSearch.trim()) return true;
                  const q = feedSearch.toLowerCase();
                  return (
                    r.title?.toLowerCase().includes(q) ||
                    r.narrative?.toLowerCase().includes(q) ||
                    r.pseudonym?.toLowerCase().includes(q) ||
                    r.city?.toLowerCase().includes(q) ||
                    r.id?.toLowerCase().includes(q)
                  );
                })
                .map(report => (
                  <PostCard
                    key={report.id}
                    report={report}
                    isAdmin={true}
                    onAdminDelete={handleDeletePost}
                    onAdminEdit={r => setEditingReport(r)}
                    onOpenComments={r => handleOpenComments(r)}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'REPORTS' && (
        reports.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-2xl border border-soft-border">
            <p className="text-foreground font-medium">The reports queue is empty. Great job!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {reports.map(item => (
              <div key={item.id} className="bg-surface border border-soft-border rounded-2xl p-8 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-3 items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${item.type === 'NEW_REPORT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                      {item.type === 'NEW_REPORT' ? 'NEW SUBMISSION' : 'REVISION (EDIT)'}
                    </span>
                    <span className="text-sm text-secondary">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <span className="text-xs text-secondary font-mono bg-background px-2.5 py-1 rounded border border-soft-border">
                    Report ID: {item.reportId}
                  </span>
                </div>

                <div className="space-y-4 mb-8">
                  <h2 className="text-xl font-bold text-foreground">{item.title}</h2>
                  <div>
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">Context & Location</span>
                    <p className="text-sm text-foreground">{item.context} &bull; {item.city} ({item.year})</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">Categories & Warning Signs</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {item.incidentTypes.map(t => (
                        <span key={t} className="text-xs bg-red-50 text-red-700 font-medium px-2 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                      {item.behaviors.map(b => (
                        <span key={b} className="text-xs bg-secondary/10 text-secondary font-medium px-2 py-0.5 rounded">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">Narrative</span>
                    <div className="text-sm text-foreground bg-background p-4 rounded-xl border border-soft-border">
                      <FormattedText text={item.narrative} className="space-y-3" />
                    </div>
                  </div>
                  {item.advice && (
                    <div>
                      <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">Advice</span>
                      <div className="text-sm text-secondary bg-background p-4 rounded-xl border border-soft-border italic">
                        <FormattedText text={item.advice} className="space-y-2" />
                      </div>
                    </div>
                  )}
                  {item.moderatorFeedback && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">Previous Feedback to User</span>
                      <p className="text-sm text-amber-900">{item.moderatorFeedback}</p>
                    </div>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="border-t border-soft-border pt-6 flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleReportAction(item.id, item.type, 'APPROVE')}
                      className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                      Approve & Publish
                    </button>
                    <button 
                      onClick={() => handleReportAction(item.id, item.type, 'REJECT')}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>

                  <button 
                    onClick={() => setActiveItem(activeItem === item.id ? null : item.id)}
                    className="px-5 py-2.5 border border-soft-border hover:bg-background text-foreground rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  >
                    {activeItem === item.id ? 'Cancel Changes Request' : 'Request Changes'}
                  </button>
                </div>

                {/* EXPANDABLE FEEDBACK BOX */}
                {activeItem === item.id && (
                  <div className="mt-6 pt-6 border-t border-soft-border">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Reason / Required Changes for User
                    </label>
                    <textarea 
                      rows={3}
                      value={feedbackText}
                      onChange={e => setFeedbackText(e.target.value)}
                      placeholder="e.g., Please remove specific company/individual names..."
                      className="w-full p-3 bg-background border border-soft-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent mb-3"
                    ></textarea>
                    <button 
                      onClick={() => handleReportAction(item.id, item.type, 'REQUEST_CHANGES', feedbackText)}
                      disabled={!feedbackText.trim()}
                      className="px-5 py-2.5 bg-foreground text-surface rounded-lg text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 cursor-pointer"
                    >
                      Send Feedback & Request Changes
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* COMMENTS TAB */}
      {activeTab === 'COMMENTS' && (
        comments.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-2xl border border-soft-border">
            <p className="text-foreground font-medium">No comments awaiting moderation!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map(c => (
              <div key={c.id} className="bg-surface border border-soft-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-foreground">{c.pseudonym}</span>
                    <span className="text-xs text-secondary">&bull;</span>
                    <span className="text-xs text-secondary">{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-foreground bg-background p-4 rounded-xl border border-soft-border max-w-2xl">
                    <FormattedText text={c.body} className="space-y-2" />
                  </div>
                  <div className="mt-2 text-xs text-secondary font-mono">
                    Report ID: {c.report_id}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <button 
                    onClick={() => handleCommentAction(c.id, 'APPROVE')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleCommentAction(c.id, 'REJECT')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* FLAGS TAB */}
      {activeTab === 'FLAGS' && (
        flags.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-2xl border border-soft-border">
            <p className="text-foreground font-medium">No open flags. Everything looks good!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {flags.map(flag => (
              <div key={flag.id} className="bg-surface border border-soft-border rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-accent/10 text-accent border border-accent/20">
                        {flag.type}
                      </span>
                      <span className="text-xs text-secondary">{new Date(flag.created_at).toLocaleString()}</span>
                    </div>
                    <div className="text-sm mb-4">
                      <span className="font-medium text-foreground">Reason:</span> <span className="text-accent">{flag.reason}</span>
                    </div>
                    {flag.details && (
                      <div className="p-3 bg-background border border-soft-border rounded-lg text-sm text-secondary mb-4 italic">
                        &quot;{flag.details}&quot;
                      </div>
                    )}
                    <div className="text-xs text-secondary font-mono bg-background p-2 rounded border border-soft-border inline-block">
                      Target ID: {flag.target_id}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end items-center gap-3 border-t border-soft-border pt-4">
                  <Link 
                    href={flag.type === 'REPORT_FLAG' ? `/reports/${flag.target_id}` : `#`}
                    target="_blank"
                    className="text-xs font-medium text-secondary hover:text-foreground mr-auto"
                  >
                    {flag.type === 'REPORT_FLAG' ? 'View Report' : ''}
                  </Link>
                  <button 
                    onClick={() => handleFlagAction(flag.id, flag.type, 'DISMISSED', flag.target_id)}
                    className="px-4 py-2 border border-soft-border text-foreground rounded-lg text-sm font-medium hover:bg-background cursor-pointer"
                  >
                    Dismiss Flag
                  </button>
                  <button 
                    onClick={() => handleFlagAction(flag.id, flag.type, 'RESOLVED', flag.target_id)}
                    className="px-4 py-2 bg-accent text-surface rounded-lg text-sm font-medium hover:bg-accent/90 cursor-pointer"
                  >
                    Remove Content & Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* EDIT REPORT MODAL */}
      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121212] border border-soft-border rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-scale-in">
            <div className="flex justify-between items-center border-b border-soft-border pb-4">
              <div className="flex items-center gap-2">
                <span className="text-accent text-xs font-bold uppercase tracking-wider">Admin Action</span>
                <span className="text-secondary">&middot;</span>
                <h3 className="font-bold text-foreground text-sm">Edit Post</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingReport(null)}
                className="text-secondary hover:text-foreground p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Heading / Title
                </label>
                <input
                  type="text"
                  value={editingReport.title || ""}
                  onChange={e => setEditingReport({ ...editingReport, title: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-soft-border bg-surface text-foreground text-sm font-medium focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Detailed Narrative
                </label>
                <textarea
                  rows={6}
                  value={editingReport.narrative || ""}
                  onChange={e => setEditingReport({ ...editingReport, narrative: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-soft-border bg-surface text-foreground text-sm font-medium focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={editingReport.city || ""}
                    onChange={e => setEditingReport({ ...editingReport, city: e.target.value })}
                    className="w-full p-3 rounded-xl border border-soft-border bg-surface text-foreground text-sm font-medium focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                    Year
                  </label>
                  <input
                    type="number"
                    value={editingReport.year || ""}
                    onChange={e => setEditingReport({ ...editingReport, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    className="w-full p-3 rounded-xl border border-soft-border bg-surface text-foreground text-sm font-medium focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Advice (optional)
                </label>
                <textarea
                  rows={2}
                  value={editingReport.advice || ""}
                  onChange={e => setEditingReport({ ...editingReport, advice: e.target.value })}
                  className="w-full p-3 rounded-xl border border-soft-border bg-surface text-foreground text-sm font-medium focus:outline-none focus:border-accent resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-soft-border">
              <button
                type="button"
                onClick={() => setEditingReport(null)}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-secondary hover:text-foreground border border-soft-border hover:bg-surface transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditPost}
                className="px-6 py-2.5 rounded-full text-xs font-bold bg-foreground text-surface hover:bg-foreground/90 transition-all shadow-sm cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMMENTS MANAGER MODAL */}
      {selectedReportComments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121212] border border-soft-border rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[85vh] flex flex-col animate-scale-in">
            <div className="flex justify-between items-start border-b border-soft-border pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-accent text-xs font-bold uppercase tracking-wider">Comments Manager</span>
                  <span className="text-secondary">&middot;</span>
                  <span className="text-secondary text-xs">{reportComments.length} comments</span>
                </div>
                <h3 className="font-bold text-foreground text-base line-clamp-1">
                  {selectedReportComments.title || "Untitled Experience"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReportComments(null)}
                className="text-secondary hover:text-foreground p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {commentsLoading ? (
                <div className="text-center py-12 text-secondary text-sm">Loading comments...</div>
              ) : reportComments.length === 0 ? (
                <div className="text-center py-12 text-secondary text-sm">
                  No comments on this post yet.
                </div>
              ) : (
                reportComments.map(comment => (
                  <div key={comment.id} className="p-4 rounded-2xl bg-surface/80 border border-soft-border space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{comment.pseudonym}</span>
                        <span className="text-[10px] text-secondary">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] bg-white/5 border border-soft-border px-1.5 py-0.5 rounded text-secondary font-mono">
                          Score: {comment.score || 0}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingComment({ id: comment.id, body: comment.body })}
                          className="text-[11px] font-semibold text-secondary hover:text-foreground transition-colors px-2.5 py-1 rounded-md hover:bg-white/5 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors px-2.5 py-1 rounded-md hover:bg-rose-500/10 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {editingComment && editingComment.id === comment.id ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          rows={3}
                          value={editingComment.body}
                          onChange={e => setEditingComment({ id: comment.id, body: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-soft-border bg-background text-foreground text-xs focus:outline-none focus:border-accent"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingComment(null)}
                            className="text-xs text-secondary hover:text-foreground px-3 py-1 rounded cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveEditComment}
                            className="text-xs font-bold bg-foreground text-surface px-3 py-1 rounded-full cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-foreground">
                        <FormattedText text={comment.body} className="space-y-1.5" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-soft-border flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedReportComments(null)}
                className="px-5 py-2 rounded-full text-xs font-semibold text-secondary hover:text-foreground border border-soft-border hover:bg-surface transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
