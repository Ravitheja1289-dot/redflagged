"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { FormattedText } from "@/components/FormattedText";

export default function ManageReportPage() {
  const { token } = useParams();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [hasPending, setHasPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: "", narrative: "", advice: "", city: "", incidentYear: 0 });
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetch(`/api/manage/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setReport({ ...data.report, feedback: data.feedback });
        setHasPending(data.hasPendingRevision);
        setEditData({
          title: data.report.title || "",
          narrative: data.report.narrative,
          advice: data.report.advice || "",
          city: data.report.city,
          incidentYear: data.report.year,
        });
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    try {
      const res = await fetch(`/api/manage/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setIsEditing(false);
      setHasPending(true);
      // Status on the frontend updates
      setReport({ ...report, status: 'PENDING', feedback: null });
      toast.success("Edit submitted for review");
    } catch (err: any) {
      setSubmitError(err.message);
      toast.error(err.message);
    }
  };

  const handleDelete = () => {
    toast.custom((t) => (
      <div className="bg-surface border border-soft-border p-4 rounded-xl shadow-lg w-[320px]">
        <h3 className="font-bold text-foreground mb-2">Delete this report?</h3>
        <p className="text-sm text-secondary mb-4">It will be removed from public view immediately. This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => toast.dismiss(t)} 
            className="px-4 py-2 border border-soft-border rounded-lg text-sm font-medium hover:bg-background"
          >
            Cancel
          </button>
          <button 
            onClick={async () => {
              toast.dismiss(t);
              setIsDeleting(true);
              try {
                const res = await fetch(`/api/manage/${token}`, { method: 'DELETE' });
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                toast.success("Report deleted successfully");
                router.push("/");
              } catch (err: any) {
                toast.error("Failed to delete: " + err.message);
                setIsDeleting(false);
              }
            }}
            className="px-4 py-2 bg-accent text-surface rounded-lg text-sm font-medium hover:bg-accent/90"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  if (loading) return <div className="container mx-auto px-4 py-20 text-center text-secondary">Loading your report...</div>;
  
  if (error) return (
    <div className="container mx-auto px-4 py-20 text-center max-w-md">
      <div className="bg-surface border border-soft-border p-8 rounded-2xl">
        <div className="w-16 h-16 bg-accent-secondary/30 text-foreground rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-secondary mb-6">{error}</p>
        <Link href="/" className="btn-interaction inline-block px-6 py-2 bg-foreground text-surface rounded-full">Return Home</Link>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Manage your report</h1>
        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${report.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {report.status}
        </span>
      </div>

      {report.feedback && !isEditing && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl mb-8">
          <div className="flex gap-4 items-start">
            <div className="mt-1 text-red-600 bg-red-100 p-2 rounded-full">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-900 mb-2">Moderator Feedback: Changes Requested</h3>
              <p className="text-red-800 mb-4 whitespace-pre-wrap">{report.feedback}</p>
              <button 
                onClick={() => setIsEditing(true)}
                className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Edit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {hasPending && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-8 flex items-start gap-4">
          <div className="mt-1 text-yellow-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          </div>
          <div>
            <h3 className="font-bold text-yellow-900 mb-1">Review pending</h3>
            <p className="text-sm text-yellow-800">Your recent edits are currently being reviewed by moderators. The public version will update once approved.</p>
          </div>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="bg-surface border border-soft-border p-6 rounded-2xl space-y-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Edit Report</h2>
          {submitError && <div className="text-accent text-sm">{submitError}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Title</label>
              <input 
                type="text" 
                value={editData.title} 
                onChange={e => setEditData({...editData, title: e.target.value})}
                className="w-full p-3 border border-soft-border rounded-lg bg-background" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">City</label>
              <input 
                type="text" 
                value={editData.city} 
                onChange={e => setEditData({...editData, city: e.target.value})}
                className="w-full p-3 border border-soft-border rounded-lg bg-background" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Year</label>
              <input 
                type="number" 
                value={editData.incidentYear} 
                onChange={e => setEditData({...editData, incidentYear: parseInt(e.target.value)})}
                className="w-full p-3 border border-soft-border rounded-lg bg-background" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Narrative</label>
            <textarea 
              rows={6} 
              value={editData.narrative}
              onChange={e => setEditData({...editData, narrative: e.target.value})}
              className="w-full p-3 border border-soft-border rounded-lg bg-background resize-none" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Advice (optional)</label>
            <textarea 
              rows={3} 
              value={editData.advice}
              onChange={e => setEditData({...editData, advice: e.target.value})}
              className="w-full p-3 border border-soft-border rounded-lg bg-background resize-none" 
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-soft-border">
            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 border border-soft-border rounded-full hover:bg-background">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-foreground text-surface rounded-full btn-interaction">Submit Edit</button>
          </div>
        </form>
      ) : (
        <div className="bg-surface border border-soft-border p-6 rounded-2xl space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{report.title || "Untitled Experience"}</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-y-6">
            <div>
              <span className="text-xs text-secondary uppercase tracking-wider block mb-1">City</span>
              <span className="font-medium text-foreground">{report.city}</span>
            </div>
            <div>
              <span className="text-xs text-secondary uppercase tracking-wider block mb-1">Year</span>
              <span className="font-medium text-foreground">{report.year}</span>
            </div>
          </div>
          
          <div>
            <span className="text-xs text-secondary uppercase tracking-wider block mb-2">Narrative</span>
            <div className="text-foreground leading-relaxed">
              <FormattedText text={report.narrative} className="space-y-4" />
            </div>
          </div>

          {report.advice && report.advice.trim().length > 0 && (
            <div>
              <span className="text-xs text-secondary uppercase tracking-wider block mb-2">Advice</span>
              <div className="text-foreground leading-relaxed italic">
                <FormattedText text={report.advice} className="space-y-2" />
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-6 border-t border-soft-border mt-8">
            <button 
              onClick={() => setIsEditing(true)} 
              className="px-6 py-2 bg-foreground text-surface rounded-full text-sm font-medium btn-interaction"
            >
              Edit Content
            </button>
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-6 py-2 text-accent border border-accent/20 rounded-full text-sm font-medium hover:bg-accent/5 transition-colors"
            >
              {isDeleting ? "Deleting..." : "Delete Report"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
