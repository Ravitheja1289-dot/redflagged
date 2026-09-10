"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getClientId } from "@/lib/client-id";
import { FormattedText } from "@/components/FormattedText";

export function PostCard({
  report,
  isAdmin = false,
  onAdminDelete,
  onAdminEdit,
  onOpenComments,
}: {
  report: any;
  isAdmin?: boolean;
  onAdminDelete?: (id: string) => void;
  onAdminEdit?: (report: any) => void;
  onOpenComments?: (report: any) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localScore, setLocalScore] = useState(report.score || 0);
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0); // 0 means no vote yet in this session
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleDeletePost = async () => {
    if (onAdminDelete) {
      onAdminDelete(report.id);
      return;
    }
    if (!confirm("Are you sure you want to permanently delete this post? All associated comments and votes will also be removed.")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/reports/${report.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsDeleted(true);
      } else {
        const d = await res.json();
        alert(d.error || "Failed to delete post");
      }
    } catch {
      alert("An error occurred while deleting the post");
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  useEffect(() => {
    if (report?.id) {
      fetch(`/api/reports/${report.id}/vote?clientId=${getClientId()}`)
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.vote !== 'undefined') {
            setUserVote(data.vote);
          }
        })
        .catch(console.error);
    }
  }, [report?.id]);

  const isLong = report.narrative.length > 250;
  const displayNarrative = isExpanded ? report.narrative : (isLong ? report.narrative.slice(0, 250) + "..." : report.narrative);

  const handleVote = async (voteType: 1 | -1) => {
    // Optimistic update
    const previousVote = userVote;
    const previousScore = localScore;
    
    if (userVote === voteType) {
      setLocalScore((s: number) => s - voteType);
      setUserVote(0);
    } else {
      setLocalScore((s: number) => s - userVote + voteType);
      setUserVote(voteType);
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
      // Revert on failure
      setLocalScore(previousScore);
      setUserVote(previousVote);
    }
  };

  if (isDeleted) return null;

  return (
    <article className="bg-surface apple-card md:rounded-3xl border border-soft-border shadow-sm overflow-hidden flex flex-col mb-6 transition-all duration-200">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-soft-border relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-soft-border flex items-center justify-center text-foreground font-bold">
            {report.pseudonym?.charAt(10) || report.pseudonym?.charAt(0) || "?"} 
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground leading-none">{report.pseudonym}</span>
            <span className="text-xs text-secondary mt-1">{report.context} &middot; {report.city}, {report.year}</span>
          </div>
        </div>

        {/* Admin Three-dots Menu */}
        {isAdmin && (
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-secondary hover:text-foreground transition-colors cursor-pointer"
              aria-label="Admin options"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-50 w-48 bg-[#121212] border border-soft-border/80 rounded-2xl shadow-2xl p-1.5 backdrop-blur-xl animate-scale-in">
                {onAdminEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onAdminEdit(report);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-foreground hover:text-white hover:bg-white/10 rounded-xl transition-all text-left cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit Post
                  </button>
                )}
                {onOpenComments && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenComments(report);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-foreground hover:text-white hover:bg-white/10 rounded-xl transition-all text-left cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    Manage Comments
                  </button>
                )}
                <div className="h-px bg-soft-border/50 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleDeletePost();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all text-left cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <Link href={`/reports/${report.id}`}>
          <h2 className="text-lg font-bold text-foreground mb-2 leading-tight hover:text-accent transition-colors">
            {report.title || "Untitled Experience"}
          </h2>
        </Link>
        <motion.div 
          layout="position"
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="text-sm text-foreground"
        >
          <FormattedText text={displayNarrative} className="space-y-3" />
        </motion.div>
        {isLong && (
          <button 
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-white transition-all active:scale-95 cursor-pointer select-none group"
          >
            <span>{isExpanded ? "Less" : "Read more"}</span>
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={`text-secondary group-hover:text-foreground transition-transform duration-200 ${
                isExpanded ? "rotate-180" : "group-hover:translate-y-0.5"
              }`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
        
        {/* Hashtag-style behaviors */}
        <div className="mt-4 flex flex-wrap gap-1">
          {report.behaviors?.map((b: string) => (
            <span key={b} className="text-xs text-accent">#{b.replace(/\s+/g, '')}</span>
          ))}
        </div>
      </div>
      
      {/* Action Bar (Reddit Style) */}
      <div className="px-4 py-2.5 border-t border-soft-border flex items-center gap-4">
        <div className="flex items-center gap-1 bg-surface rounded-full p-0.5 border border-soft-border">
          <button 
            onClick={() => handleVote(1)}
            className={`w-7 h-7 flex items-center justify-center rounded-full hover:bg-background transition-all duration-120 active:scale-80 cursor-pointer ${userVote === 1 ? 'text-orange-500' : 'text-secondary'}`}
            aria-label="Upvote"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          </button>
          <span className={`text-xs font-bold w-5 text-center transition-all duration-150 ${userVote === 1 ? 'text-orange-500' : userVote === -1 ? 'text-indigo-500' : 'text-foreground'}`}>
            {localScore}
          </span>
          <button 
            onClick={() => handleVote(-1)}
            className={`w-7 h-7 flex items-center justify-center rounded-full hover:bg-background transition-all duration-120 active:scale-80 cursor-pointer ${userVote === -1 ? 'text-indigo-500' : 'text-secondary'}`}
            aria-label="Downvote"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
          </button>
        </div>

        {onOpenComments ? (
          <button 
            type="button"
            onClick={() => onOpenComments(report)}
            className="flex items-center gap-1.5 text-secondary hover:text-foreground transition-all duration-120 active:scale-95 bg-surface rounded-full px-3 py-1.5 border border-soft-border cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <span className="text-xs font-bold">
              {report.commentCount === 1 ? '1 Comment' : `${report.commentCount || 0} Comments`}
            </span>
          </button>
        ) : (
          <Link href={`/reports/${report.id}`} className="flex items-center gap-1.5 text-secondary hover:text-foreground transition-all duration-120 active:scale-95 bg-surface rounded-full px-3 py-1.5 border border-soft-border">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <span className="text-xs font-bold">
              {report.commentCount === 1 ? '1 Comment' : `${report.commentCount || 0} Comments`}
            </span>
          </Link>
        )}
      </div>
    </article>
  );
}
