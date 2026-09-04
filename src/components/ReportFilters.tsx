"use client";

import { useState, useRef, useEffect } from "react";

export function ReportFilters() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex gap-3 w-full relative">
      <div className="relative flex-1">
        <input 
          type="search" 
          placeholder="Search experiences..." 
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-soft-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm"
        />
        <svg className="absolute left-3.5 top-3 w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      
      <div className="relative" ref={filterRef}>
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors text-sm font-medium ${isFilterOpen ? 'bg-secondary/10 border-secondary/30 text-foreground' : 'bg-surface border-soft-border text-secondary hover:border-secondary/30 hover:text-foreground'}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          Filters
        </button>

        {isFilterOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-surface border border-soft-border rounded-2xl shadow-lg p-4 z-50 animate-fade-in-up">
            <h3 className="font-bold text-foreground text-sm mb-4">Filter by</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Incident Type</label>
                <select className="w-full p-2.5 rounded-lg border border-soft-border bg-background text-sm focus:outline-none focus:border-accent">
                  <option>All Types</option>
                  <option>Physical assault</option>
                  <option>Harassment</option>
                  <option>Stalking</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Context</label>
                <select className="w-full p-2.5 rounded-lg border border-soft-border bg-background text-sm focus:outline-none focus:border-accent">
                  <option>All Contexts</option>
                  <option>Spouse</option>
                  <option>Dating partner</option>
                  <option>Colleague</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Warning Sign</label>
                <select className="w-full p-2.5 rounded-lg border border-soft-border bg-background text-sm focus:outline-none focus:border-accent">
                  <option>All Signs</option>
                  <option>Controlling behavior</option>
                  <option>Isolation</option>
                  <option>Gaslighting</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6 pt-4 border-t border-soft-border">
              <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-2 text-sm font-medium text-secondary hover:text-foreground">Clear</button>
              <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-2 bg-foreground text-surface rounded-lg text-sm font-medium hover:bg-foreground/90">Apply</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
