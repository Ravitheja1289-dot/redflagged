"use client";

import { notFound } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { FlagModal, FlagTarget } from "./FlagModal";
import { getClientId } from "@/lib/client-id";
import { FormattedText } from "@/components/FormattedText";

export default function ReportDetail({ report, isModal = false }: { report: any; isModal?: boolean }) {
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  
  const [flagTarget, setFlagTarget] = useState<FlagTarget | null>(null);

  useEffect(() => {
    if (report?.id) {
      fetch(`/api/reports/${report.id}/vote?clientId=${getClientId()}`)
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.vote !== 'undefined') {
            setReportUserVote(data.vote);
          }
        })
        .catch(console.error);
    }
  }, [report?.id]);

  useEffect(() => {
    if (report?.id) {
      fetch(`/api/reports/${report.id}/comments?clientId=${getClientId()}`)
        .then(res => res.json())
        .then(data => {
          if (data.comments) setComments(data.comments);
          setLoadingComments(false);
        })
        .catch(() => setLoadingComments(false));
    }
  }, [report?.id]);

  if (!report) {
    return notFound();
  }

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/reports/${report.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newComment, parent_id: replyTo })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message);
      setNewComment("");
      setReplyTo(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build comment tree


  const commentTree = useMemo(() => {
    const map = new Map();
    const roots: any[] = [];
    
    comments.forEach(c => {
      map.set(c.id, { ...c, children: [], localScore: c.score || 0, userVote: 0 });
    });
    
    comments.forEach(c => {
      if (c.parent_id && map.has(c.parent_id)) {
        map.get(c.parent_id).children.push(map.get(c.id));
      } else {
        roots.push(map.get(c.id));
      }
    });
    
    return roots;
  }, [comments]);

  const [reportScore, setReportScore] = useState(report.score || 0);
  const [reportUserVote, setReportUserVote] = useState<1 | -1 | 0>(0);

  const handleReportVote = async (voteType: 1 | -1) => {
    const previousVote = reportUserVote;
    const previousScore = reportScore;
    
    if (reportUserVote === voteType) {
      setReportScore((s: number) => s - voteType);
      setReportUserVote(0);
    } else {
      setReportScore((s: number) => s - reportUserVote + voteType);
      setReportUserVote(voteType);
    }

    try {
      const clientId = getClientId();
      const res = await fetch(`/api/reports/${report.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, voteType })
      });
      if (!res.ok) throw new Error("Vote failed");
    } catch (err) {
      setReportScore(previousScore);
      setReportUserVote(previousVote);
    }
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: any, depth?: number }) => {
    const [score, setScore] = useState(comment.localScore);
    const [userVote, setUserVote] = useState<1 | -1 | 0>(comment.userVote);

    const handleVote = async (voteType: 1 | -1) => {
      const previousVote = userVote;
      const previousScore = score;
      
      if (userVote === voteType) {
        setScore((s: number) => s - voteType);
        setUserVote(0);
      } else {
        setScore((s: number) => s - userVote + voteType);
        setUserVote(voteType);
      }

      try {
        const clientId = getClientId();
        const res = await fetch(`/api/comments/${comment.id}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId, voteType })
        });
        if (!res.ok) throw new Error("Vote failed");
      } catch (err) {
        setScore(previousScore);
        setUserVote(previousVote);
      }
    };

    return (
      <div className={`group ${depth > 0 ? 'ml-6 mt-4 pl-4 border-l-2 border-soft-border' : 'mb-6'}`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">{comment.pseudonym}</span>
            <span className="text-[10px] text-secondary">{new Date(comment.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="text-sm text-foreground mb-2">
          <FormattedText text={comment.body} className="space-y-2" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button onClick={() => handleVote(1)} className={`w-6 h-6 flex items-center justify-center rounded-full hover:bg-background transition-colors ${userVote === 1 ? 'text-orange-500' : 'text-secondary'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            </button>
            <span className={`text-xs font-bold w-4 text-center ${userVote === 1 ? 'text-orange-500' : userVote === -1 ? 'text-indigo-500' : 'text-secondary'}`}>{score}</span>
            <button onClick={() => handleVote(-1)} className={`w-6 h-6 flex items-center justify-center rounded-full hover:bg-background transition-colors ${userVote === -1 ? 'text-indigo-500' : 'text-secondary'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
            </button>
          </div>
          <button onClick={() => setReplyTo(comment.id)} className="text-[11px] font-bold text-secondary hover:text-foreground transition-colors">REPLY</button>
          <button onClick={() => setFlagTarget({ type: 'COMMENT', id: comment.id })} className="text-[11px] font-bold text-secondary opacity-0 group-hover:opacity-100 hover:text-accent transition-all">REPORT</button>
          {isAdmin && (
            <button
              onClick={async () => {
                if (confirm("Admin: Delete this comment?")) {
                  const res = await fetch(`/api/admin/comments/${comment.id}`, { method: "DELETE" });
                  if (res.ok) {
                    toast.success("Comment deleted");
                    setComments(prev => prev.filter(c => c.id !== comment.id));
                  } else {
                    toast.error("Failed to delete comment");
                  }
                }
              }}
              className="text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
            >
              DELETE
            </button>
          )}
        </div>
        {comment.children && comment.children.length > 0 && (
          <div className="mt-2">
            {comment.children.map((child: any) => <CommentItem key={child.id} comment={child} depth={depth + 1} />)}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className={`flex flex-col md:flex-row ${isModal ? 'h-[85vh] max-h-[800px]' : 'min-h-[calc(100vh-6rem)] md:min-h-screen'}`}>
        {/* Left Side: Report */}
        <div className={`flex-1 flex flex-col ${isModal ? 'overflow-y-auto md:w-[60%] border-b md:border-b-0 md:border-r border-soft-border' : 'md:pr-12'}`}>
          <div className={`p-6 md:p-10 ${isModal ? '' : 'max-w-3xl mx-auto w-full'}`}>
            <div className="flex justify-between items-start mb-6 gap-4">
              <h1 className="text-2xl font-bold text-foreground leading-tight max-w-[80%]">
                {report.title || "Untitled Experience"}
              </h1>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-xs text-secondary bg-surface border border-soft-border px-3 py-1 rounded-full shrink-0">
                  {report.year}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-secondary mb-10 pb-6 border-b border-soft-border">
              <span><strong>Context:</strong> {report.context}</span>
              <span>&bull;</span>
              <span><strong>City:</strong> {report.city}</span>
            </div>

            <div className="mb-12">
              <FormattedText text={report.narrative} className="text-foreground text-base leading-relaxed space-y-4" />
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-medium text-secondary mb-3">Categories & Warning signs</h3>
              <div className="flex flex-wrap gap-1.5">
                {report.incidentTypes.map((type: string) => (
                  <span key={`type-${type}`} className="text-[11px] font-bold text-accent tracking-wider bg-accent-secondary/30 px-2 py-0.5 rounded-md">
                    {type}
                  </span>
                ))}
                {report.behaviors.map((b: string) => (
                  <span key={`beh-${b}`} className="text-[11px] bg-surface border border-soft-border px-2 py-0.5 rounded-md text-secondary font-medium">
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {report.advice && report.advice.trim().length > 0 && (
              <div className="bg-background border border-soft-border rounded-xl p-5 mb-8">
                <h3 className="text-[11px] font-bold text-secondary mb-1.5 uppercase tracking-wider">Advice to others</h3>
                <div className="text-sm text-secondary italic">
                  <FormattedText text={report.advice} className="space-y-2.5" />
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-5 border-t border-soft-border text-xs text-secondary">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-surface rounded-full p-0.5 border border-soft-border">
                  <button onClick={() => handleReportVote(1)} className={`w-6 h-6 flex items-center justify-center rounded-full hover:bg-background transition-colors ${reportUserVote === 1 ? 'text-orange-500' : 'text-secondary'}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                  </button>
                  <span className={`text-xs font-bold w-4 text-center ${reportUserVote === 1 ? 'text-orange-500' : reportUserVote === -1 ? 'text-indigo-500' : 'text-foreground'}`}>{reportScore}</span>
                  <button onClick={() => handleReportVote(-1)} className={`w-6 h-6 flex items-center justify-center rounded-full hover:bg-background transition-colors ${reportUserVote === -1 ? 'text-indigo-500' : 'text-secondary'}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                  </button>
                </div>
                <div className="flex items-center gap-2 border-l border-soft-border pl-4">
                  <div className="w-5 h-5 text-[10px] rounded-full bg-soft-border flex items-center justify-center text-foreground font-bold">
                    {report.pseudonym.charAt(10)}
                  </div>
                  <span>Shared by <strong>{report.pseudonym}</strong></span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setFlagTarget({ type: 'REPORT', id: report.id })}
                  className="text-[11px] font-medium text-secondary hover:text-foreground hover:underline transition-colors hidden md:block"
                >
                  Report this experience
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Comments */}
        <div className={`flex flex-col ${isModal ? 'md:w-[40%] h-full bg-surface opacity-0 animate-fade-in-left animate-stagger-2 will-change-[opacity,transform]' : 'md:w-[400px] lg:w-[450px] border-t md:border-t-0 md:border-l border-soft-border bg-background/50 pt-10 md:pt-0'}`}>
          <div className="p-6 border-b border-soft-border flex-shrink-0">
            <h3 className="text-lg font-bold text-foreground">Comments</h3>
            <p className="text-xs text-secondary">
              {loadingComments ? "Loading..." : `${comments.length} people shared their perspective`}
            </p>
          </div>
          
          <div className={`p-4 flex-1 ${isModal ? 'overflow-y-auto' : 'overflow-y-auto max-h-[600px] md:max-h-none'}`}>
            {loadingComments ? (
              <div className="text-center py-10 text-secondary text-sm">Loading comments...</div>
            ) : commentTree.length > 0 ? (
              commentTree.map(comment => <CommentItem key={comment.id} comment={comment} />)
            ) : (
              <div className="text-center py-10 text-secondary text-sm">
                No comments yet.
              </div>
            )}
          </div>

          <div className="p-4 border-t border-soft-border bg-surface flex-shrink-0">
            {replyTo && (
              <div className="flex justify-between items-center mb-2 px-2 py-1 bg-secondary/10 rounded-lg text-xs text-secondary">
                <span>Replying to thread...</span>
                <button onClick={() => setReplyTo(null)} className="font-bold hover:text-foreground">X</button>
              </div>
            )}
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..." 
              className="w-full bg-background border border-soft-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none h-16 mb-2"
            ></textarea>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-secondary">Your comment will appear anonymously.</span>
              <button 
                onClick={handleCommentSubmit}
                disabled={isSubmitting || !newComment.trim()}
                className="bg-foreground text-surface px-3 py-1.5 rounded-full text-xs font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <FlagModal 
        isOpen={!!flagTarget} 
        onClose={() => setFlagTarget(null)} 
        target={flagTarget} 
      />
    </>
  );
}
