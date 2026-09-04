"use client";

import { notFound } from "next/navigation";

export default function ReportDetail({ report, isModal = false }: { report: any; isModal?: boolean }) {
  if (!report) {
    return notFound();
  }

  // Placeholder for comments in phase 2
  const comments: any[] = [];

  return (
    <div className={`flex flex-col md:flex-row ${isModal ? 'h-[85vh] max-h-[800px]' : 'min-h-[calc(100vh-16rem)]'}`}>
      {/* Left Side: Report */}
      <div className={`flex-1 flex flex-col ${isModal ? 'overflow-y-auto md:w-[60%] border-b md:border-b-0 md:border-r border-soft-border' : 'md:pr-12'}`}>
        <div className={`p-6 md:p-10 ${isModal ? '' : 'max-w-3xl mx-auto w-full'}`}>
          <div className="flex justify-between items-start mb-8">
            <div className="flex gap-2 flex-wrap">
              {report.incidentTypes.map((type: string) => (
                <span key={type} className="text-sm font-bold text-accent tracking-wider bg-accent-secondary/30 px-3 py-1 rounded-full">
                  {type}
                </span>
              ))}
            </div>
            <span className="text-sm text-secondary bg-surface border border-soft-border px-3 py-1 rounded-full">
              {report.year}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-secondary mb-10 pb-6 border-b border-soft-border">
            <span><strong>Context:</strong> {report.context}</span>
            <span>&bull;</span>
            <span><strong>City:</strong> {report.city}</span>
          </div>

          <div className="prose prose-neutral max-w-none mb-12">
            <h3 className="text-xl font-medium text-foreground mb-4">The experience</h3>
            <p className="text-foreground leading-relaxed text-lg whitespace-pre-line">
              {report.narrative}
            </p>
          </div>

          <div className="mb-12">
            <h3 className="text-lg font-medium text-foreground mb-4">Warning signs present</h3>
            <div className="flex flex-wrap gap-2">
              {report.behaviors.map((b: string) => (
                <span key={b} className="text-sm bg-accent-secondary/30 border border-accent-secondary/40 px-3 py-1.5 rounded-md text-foreground font-medium">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {report.advice && report.advice.trim().length > 0 && (
            <div className="bg-background border border-soft-border rounded-xl p-6 mb-8">
              <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wider">Advice to others</h3>
              <p className="text-secondary italic">&quot;{report.advice}&quot;</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-6 border-t border-soft-border text-sm text-secondary">
            <div className="w-8 h-8 rounded-full bg-soft-border flex items-center justify-center text-foreground font-bold">
              {report.pseudonym.charAt(10)} {/* Just getting first letter of pseudonym name */}
            </div>
            <span>Shared by <strong>{report.pseudonym}</strong></span>
          </div>
        </div>
      </div>

      {/* Right Side: Comments */}
      <div className={`flex flex-col ${isModal ? 'md:w-[40%] h-full bg-surface opacity-0 animate-fade-in-left animate-stagger-2 will-change-[opacity,transform]' : 'md:w-[400px] lg:w-[450px] border-t md:border-t-0 md:border-l border-soft-border bg-background/50'}`}>
        <div className="p-6 border-b border-soft-border flex-shrink-0">
          <h3 className="font-bold text-foreground">Comments</h3>
          <p className="text-sm text-secondary">{comments.length} people shared their perspective</p>
        </div>
        
        <div className={`p-6 flex-1 ${isModal ? 'overflow-y-auto' : ''} space-y-6`}>
          {comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment.id} className="group">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-foreground">{comment.pseudonym}</span>
                  <span className="text-xs text-secondary">{new Date(comment.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-secondary leading-relaxed">
                  {comment.content}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-secondary text-sm">
              No comments yet.
            </div>
          )}
        </div>

        <div className="p-6 border-t border-soft-border bg-surface flex-shrink-0">
          <textarea 
            placeholder="Add a comment..." 
            className="w-full bg-background border border-soft-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none h-24 mb-3"
          ></textarea>
          <div className="flex justify-between items-center">
            <span className="text-xs text-secondary">Your comment will appear anonymously.</span>
            <button className="bg-foreground text-surface px-4 py-2 rounded-full text-sm font-medium hover:bg-foreground/90 transition-colors">
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
