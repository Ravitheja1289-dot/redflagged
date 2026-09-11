import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export type FlagTarget = { type: 'REPORT' | 'COMMENT', id: string };

type FlagModalProps = {
  isOpen: boolean;
  onClose: () => void;
  target: FlagTarget | null;
};

export function FlagModal({ isOpen, onClose, target }: FlagModalProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const reportReasons = [
    "Contains identifying information",
    "Contains private/personal information",
    "Harassment or hateful content",
    "Threatening content",
    "Spam",
    "Other"
  ];

  const commentReasons = [
    "Harassment",
    "Threat",
    "Personal information",
    "Hate or abusive content",
    "Spam",
    "Other"
  ];

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setDetails("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target || !reason) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: target.type === 'REPORT' ? 'REPORT_FLAG' : 'COMMENT_FLAG',
          target_id: target.id,
          reason,
          details
        })
      });
      if (res.ok) {
        toast.success('Report submitted to moderation');
        onClose();
      } else {
        toast.error('Failed to submit flag');
      }
    } catch {
      toast.error('Failed to submit flag');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasons = target?.type === 'REPORT' ? reportReasons : commentReasons;

  return (
    <AnimatePresence>
      {isOpen && target && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
        >
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="flag-title"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", damping: 28, stiffness: 320, mass: 0.85 }}
            className="bg-surface w-full max-w-md rounded-2xl p-6 shadow-2xl border border-soft-border"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 id="flag-title" className="text-xl font-bold text-foreground">
                Report {target.type === 'REPORT' ? 'Experience' : 'Comment'}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background text-secondary hover:text-foreground transition-colors cursor-pointer active:scale-90"
                aria-label="Close modal"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">Why are you reporting this?</label>
            {reasons.map(r => (
              <label key={r} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-white/[0.04] active:scale-[0.985] transition-all">
                <input 
                  type="radio" 
                  name="reason" 
                  value={r} 
                  checked={reason === r}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-4 h-4 text-accent border-soft-border focus:ring-accent"
                />
                <span className="text-sm text-foreground">{r}</span>
              </label>
            ))}
          </div>

          <div className="space-y-2">
            <label htmlFor="details" className="block text-sm font-medium text-foreground">Additional details (optional)</label>
            <textarea
              id="details"
              value={details}
              onChange={e => setDetails(e.target.value)}
              className="w-full p-3 border border-soft-border rounded-xl bg-background text-sm resize-none focus:outline-none focus:border-accent/60"
              rows={3}
              placeholder="Provide more context..."
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-soft-border rounded-xl text-xs font-semibold hover:bg-white/[0.06] active:scale-95 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason || isSubmitting}
              className="px-4 py-2 bg-foreground text-surface rounded-xl text-xs font-semibold hover:bg-white active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
          </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
