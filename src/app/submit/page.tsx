"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  error = false,
}: {
  value: string | number;
  onChange: (value: any) => void;
  options: { label: string; value: string | number }[];
  placeholder?: string;
  error?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-4 rounded-2xl border bg-surface flex items-center justify-between text-left transition-all duration-150 active:scale-[0.99] cursor-pointer ${
          error
            ? "border-rose-500/80 focus:border-rose-500 bg-rose-500/[0.03]"
            : isOpen
            ? "border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.04)]"
            : "border-soft-border hover:border-white/20"
        }`}
      >
        <span className={`text-sm font-medium ${selectedOption ? "text-foreground" : "text-secondary/70"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-secondary transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180 text-foreground" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0E0E0E]/95 backdrop-blur-2xl border border-soft-border rounded-2xl p-1.5 shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-scale-in">
          {options.map(option => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white/[0.08] text-white"
                    : "text-secondary hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white shrink-0 ml-2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CheckCard({
  checked,
  onChange,
  label,
  align = "center"
}: {
  checked: boolean;
  onChange: () => void;
  label: React.ReactNode;
  align?: "center" | "start";
}) {
  return (
    <label
      className={`group relative flex ${
        align === "start" ? "items-start" : "items-center"
      } gap-3.5 p-4 rounded-2xl border cursor-pointer select-none transition-all duration-150 active:scale-[0.985] ${
        checked
          ? "bg-white/[0.08] border-white/40 shadow-[0_0_24px_rgba(255,255,255,0.04)]"
          : "bg-surface/50 border-soft-border hover:border-white/20 hover:bg-surface"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <div
        className={`w-5 h-5 rounded-[6px] flex items-center justify-center transition-all duration-150 shrink-0 ${
          align === "start" ? "mt-0.5" : ""
        } ${
          checked
            ? "bg-white text-black shadow-sm"
            : "border border-white/20 bg-white/[0.03] group-hover:border-white/40"
        }`}
      >
        <svg
          className={`w-3.5 h-3.5 transition-all duration-150 ${
            checked ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="2.5 7.2 5.5 10.2 11.5 3.8" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        {typeof label === "string" ? (
          <span
            className={`text-sm transition-colors block ${
              checked ? "text-white font-semibold" : "text-foreground font-medium"
            }`}
          >
            {label}
          </span>
        ) : (
          label
        )}
      </div>
    </label>
  );
}

export default function SubmitPage() {
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [managementToken, setManagementToken] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    incidentTypeSlugs: [] as string[],
    contextSlug: "",
    city: "",
    incidentYear: new Date().getFullYear(),
    behaviorSlugs: [] as string[],
    narrative: "",
    advice: "",
    agreedPrivacy: false,
    agreedNotEmergency: false,
    agreedModeration: false
  });

  const [showErrors, setShowErrors] = useState(false);

  const handleContinue = () => {
    if (!isStepValid()) {
      setShowErrors(true);
      if (step === 1) {
        toast.error("Please select at least one category to continue.");
      } else if (step === 2) {
        toast.error("Please select your relationship to the person involved.");
      } else if (step === 3) {
        toast.error("Please enter a city or general location.");
      } else if (step === 4) {
        toast.error("Please select at least one warning sign.");
      } else if (step === 5) {
        if (!formData.title.trim()) {
          toast.error("Heading is required. Please provide a title.");
        } else if (formData.title.trim().length < 3) {
          toast.error("Heading must be at least 3 characters long.");
        } else if (!formData.narrative.trim()) {
          toast.error("Detailed narrative is required.");
        } else if (formData.narrative.trim().length < 10) {
          toast.error("Detailed narrative must be at least 10 characters long.");
        }
      } else if (step === 6) {
        toast.error("Please confirm all safety permissions before submitting.");
      }
      return;
    }
    setShowErrors(false);
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setShowErrors(false);
    setStep(prev => Math.max(prev - 1, 1));
  };

  const toggleArray = (array: string[], item: string) => {
    return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
  };

  // Maps UI strings to DB slugs
  const incidentTypes = [
    { label: "Physical assault", slug: "physical-assault" },
    { label: "Sexual assault", slug: "sexual-assault" },
    { label: "Harassment", slug: "harassment" },
    { label: "Stalking", slug: "stalking" },
    { label: "Threats / intimidation", slug: "threats-intimidation" },
    { label: "Domestic abuse", slug: "domestic-abuse" },
    { label: "Controlling behavior", slug: "controlling-behavior" },
    { label: "Workplace misconduct", slug: "workplace-misconduct" },
    { label: "Other", slug: "other" }
  ];

  const contexts = [
    { label: "Spouse", slug: "spouse" },
    { label: "Former partner", slug: "former-partner" },
    { label: "Dating partner", slug: "dating-partner" },
    { label: "Family member", slug: "family-member" },
    { label: "Manager / Supervisor", slug: "manager-supervisor" },
    { label: "Colleague / Coworker", slug: "colleague-coworker" },
    { label: "Acquaintance", slug: "acquaintance" },
    { label: "Stranger", slug: "stranger" },
    { label: "Other", slug: "other" }
  ];

  const behaviors = [
    { label: "Physical intimidation", slug: "physical-intimidation" },
    { label: "Threats", slug: "threats" },
    { label: "Controlling behavior", slug: "controlling-communication" }, // Mapping to controlling-communication for now
    { label: "Isolation", slug: "isolation" },
    { label: "Extreme jealousy", slug: "extreme-jealousy" },
    { label: "Controlling communication", slug: "controlling-communication" },
    { label: "Blocking exit", slug: "blocking-exit" },
    { label: "Unwanted repeated contact", slug: "unwanted-repeated-contact" },
    { label: "Monitoring", slug: "phone-monitoring" },
    { label: "Boundary violation", slug: "boundary-violation" },
    { label: "Gaslighting", slug: "gaslighting" },
    { label: "Power abuse", slug: "power-abuse" }
  ];

  const handleSubmit = async () => {
    if (!formData.agreedPrivacy || !formData.agreedNotEmergency || !formData.agreedModeration) {
      setShowErrors(true);
      toast.error("Please confirm all safety permissions before submitting.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim() || "Untitled Experience",
          incidentTypeSlugs: formData.incidentTypeSlugs,
          contextSlug: formData.contextSlug,
          city: formData.city,
          incidentYear: formData.incidentYear,
          behaviorSlugs: formData.behaviorSlugs,
          narrative: formData.narrative,
          advice: formData.advice,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit report");
      
      setManagementToken(data.managementToken);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.incidentTypeSlugs.length > 0;
      case 2: return formData.contextSlug !== "";
      case 3: return formData.city.trim() !== "";
      case 4: return formData.behaviorSlugs.length > 0;
      case 5: return formData.title.trim().length >= 3 && formData.narrative.trim().length >= 10;
      case 6: return formData.agreedPrivacy && formData.agreedNotEmergency && formData.agreedModeration;
      default: return true;
    }
  };

  // If successfully submitted, show success screen entirely
  if (managementToken) {
    const manageUrl = `https://redflaggers.vercel.app/manage/report/${managementToken}`;
    return (
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <div className="w-20 h-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Your experience has been submitted.</h1>
        <p className="text-xl text-secondary mb-12">Your report is currently under review.</p>
        
        <div className="bg-surface border border-soft-border p-8 rounded-2xl text-left shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-2">Save your private management link.</h2>
          <p className="text-secondary mb-6 text-sm">
            Anyone with this private link may be able to manage your report. Keep it private. Do not share it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              readOnly 
              value={manageUrl} 
              className="flex-1 p-3 bg-background border border-soft-border rounded-lg text-foreground text-sm font-mono"
            />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(manageUrl);
                toast.success("Copied to clipboard!");
              }}
              className="px-6 py-3 bg-foreground text-surface rounded-lg font-medium btn-interaction shrink-0"
            >
              Copy Link
            </button>
          </div>
        </div>
        <div className="mt-12">
          <Link href="/" className="text-accent font-medium hover:underline">Return to experiences feed &rarr;</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl min-h-[calc(100vh-16rem)] flex flex-col">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-secondary">Step {step} of {totalSteps}</span>
          <Link href="/" className="text-sm font-medium text-secondary hover:text-foreground">
            Cancel
          </Link>
        </div>
        <div className="w-full bg-soft-border h-2 rounded-full overflow-hidden">
          <div 
            className="bg-accent h-full transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" 
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 14, filter: "blur(3px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -14, filter: "blur(3px)" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
        {step === 1 && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">What happened?</h1>
            <p className="text-secondary">Select the primary category that best describes your experience.</p>
            <div className="grid gap-3">
              {incidentTypes.map(type => (
                <CheckCard
                  key={type.slug}
                  checked={formData.incidentTypeSlugs.includes(type.slug)}
                  onChange={() => setFormData({...formData, incidentTypeSlugs: toggleArray(formData.incidentTypeSlugs, type.slug)})}
                  label={type.label}
                />
              ))}
            </div>
            {showErrors && formData.incidentTypeSlugs.length === 0 && (
              <p className="text-xs text-rose-400 flex items-center gap-1.5 font-medium animate-fade-in-up">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Please select at least one primary category to continue.
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Who was involved?</h1>
            <p className="text-secondary">What was your relationship to the person? Do not use names.</p>
            <div>
              <CustomSelect
                value={formData.contextSlug}
                onChange={val => setFormData({...formData, contextSlug: val})}
                options={contexts.map(c => ({ label: c.label, value: c.slug }))}
                placeholder="Select relationship"
                error={showErrors && !formData.contextSlug}
              />
              {showErrors && !formData.contextSlug && (
                <p className="mt-2 text-xs text-rose-400 flex items-center gap-1.5 font-medium animate-fade-in-up">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Please select your relationship to the person involved.
                </p>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Where and when?</h1>
            <p className="text-secondary">Provide general location and time frame. Do not use exact addresses.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">City</label>
                <input 
                  type="text" 
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  placeholder="e.g., Mumbai, Delhi, Bengaluru" 
                  className={`appearance-none w-full p-4 border rounded-xl bg-surface focus:outline-none font-medium text-foreground transition-all placeholder:text-secondary/50 ${
                    showErrors && !formData.city.trim()
                      ? "border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-500/[0.03]"
                      : "border-soft-border focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  }`} 
                />
                {showErrors && !formData.city.trim() && (
                  <p className="mt-2 text-xs text-rose-400 flex items-center gap-1.5 font-medium animate-fade-in-up">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Please enter a city or general location.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Year</label>
                <CustomSelect
                  value={formData.incidentYear}
                  onChange={val => setFormData({...formData, incidentYear: parseInt(val)})}
                  options={[2026, 2025, 2024, 2023, 2022, 2021, 2020].map(y => ({ label: String(y), value: y }))}
                  placeholder="Select year"
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Warning signs</h1>
            <p className="text-secondary">What behaviors were present? Select all that apply.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {behaviors.map(sign => (
                <CheckCard
                  key={sign.label}
                  checked={formData.behaviorSlugs.includes(sign.slug)}
                  onChange={() => setFormData({...formData, behaviorSlugs: toggleArray(formData.behaviorSlugs, sign.slug)})}
                  label={sign.label}
                />
              ))}
            </div>
            {showErrors && formData.behaviorSlugs.length === 0 && (
              <p className="text-xs text-rose-400 flex items-center gap-1.5 font-medium animate-fade-in-up">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Please select at least one warning sign or behavior.
              </p>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Tell your experience</h1>
            <p className="text-secondary">Focus on the behaviors and how the situation developed.</p>
            <div className="bg-accent-secondary/20 border border-accent-secondary/30 p-4 rounded-xl mb-4">
              <h4 className="text-sm font-bold text-accent mb-2">Important Rules</h4>
              <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
                <li>Don&apos;t use AI — we want to hear from you in your own words</li>
                <li>Do not use real names of people or companies</li>
                <li>Do not include phone numbers or social media handles</li>
                <li>Do not include exact addresses</li>
              </ul>
            </div>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-foreground">
                    Heading / Title <span className="text-accent">*</span>
                  </label>
                  <span className={`text-xs transition-colors ${
                    formData.title.trim().length >= 3 
                      ? "text-emerald-500 font-medium" 
                      : showErrors 
                        ? "text-rose-400 font-semibold" 
                        : "text-secondary"
                  }`}>
                    {formData.title.trim().length >= 3 
                      ? `${formData.title.trim().length} chars (valid)` 
                      : `${formData.title.trim().length}/3 min`}
                  </span>
                </div>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Red flags while dating a former colleague" 
                  className={`appearance-none w-full p-4 border rounded-xl bg-surface focus:outline-none font-medium text-foreground transition-all placeholder:text-secondary/50 ${
                    showErrors && formData.title.trim().length < 3
                      ? "border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-500/[0.03]"
                      : "border-soft-border focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  }`} 
                />
                {showErrors && formData.title.trim().length < 3 && (
                  <p className="mt-2 text-xs text-rose-400 flex items-center gap-1.5 font-medium animate-fade-in-up">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>
                      {formData.title.trim().length === 0 
                        ? "Heading is required. Please provide a title before continuing." 
                        : `Heading must be at least 3 characters long (currently ${formData.title.trim().length}/3).`}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-foreground">
                    Detailed narrative <span className="text-accent">*</span>
                  </label>
                  <span className={`text-xs transition-colors ${
                    formData.narrative.trim().length >= 10 
                      ? "text-emerald-500 font-medium" 
                      : showErrors 
                        ? "text-rose-400 font-semibold" 
                        : "text-secondary"
                  }`}>
                    {formData.narrative.trim().length >= 10 
                      ? `${formData.narrative.trim().length} chars (valid)` 
                      : `${formData.narrative.trim().length}/10 min`}
                  </span>
                </div>
                <textarea 
                  rows={8} 
                  value={formData.narrative}
                  onChange={e => setFormData({...formData, narrative: e.target.value})}
                  className={`appearance-none w-full p-4 border rounded-xl bg-surface focus:outline-none font-medium text-foreground transition-all placeholder:text-secondary/50 resize-none ${
                    showErrors && formData.narrative.trim().length < 10
                      ? "border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-500/[0.03]"
                      : "border-soft-border focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  }`} 
                  placeholder="Describe what happened, focusing on the warning signs..."
                ></textarea>
                {showErrors && formData.narrative.trim().length < 10 && (
                  <p className="mt-2 text-xs text-rose-400 flex items-center gap-1.5 font-medium animate-fade-in-up">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>
                      {formData.narrative.trim().length === 0 
                        ? "Detailed narrative is required. Please explain what occurred." 
                        : `Narrative must be at least 10 characters long (currently ${formData.narrative.trim().length}/10).`}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Advice & Safety Permissions</h1>
              <p className="text-secondary mt-1">If someone is in a similar situation now, what advice would you give them based on your experience?</p>
            </div>

            <textarea 
              rows={4} 
              value={formData.advice}
              onChange={e => setFormData({...formData, advice: e.target.value})}
              className="appearance-none w-full p-4 border border-soft-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-medium text-foreground transition-all placeholder:text-secondary/50 resize-none"
              placeholder="Your advice (optional)..."
            ></textarea>

            <div className="pt-5 border-t border-soft-border space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Safety permissions</h3>
                <p className="text-xs text-secondary mt-0.5">Please confirm that your submission follows our safety guidelines before submitting.</p>
              </div>
              
              <div className="space-y-3">
                <CheckCard
                  align="start"
                  checked={formData.agreedPrivacy}
                  onChange={() => setFormData({...formData, agreedPrivacy: !formData.agreedPrivacy})}
                  label={
                    <span className="text-sm leading-relaxed">
                      I confirm that I have not included any real names, phone numbers, exact addresses, or social media handles.
                    </span>
                  }
                />
                <CheckCard
                  align="start"
                  checked={formData.agreedNotEmergency}
                  onChange={() => setFormData({...formData, agreedNotEmergency: !formData.agreedNotEmergency})}
                  label={
                    <span className="text-sm leading-relaxed">
                      I understand that this platform is not an emergency response service and will not automatically notify authorities.
                    </span>
                  }
                />
                <CheckCard
                  align="start"
                  checked={formData.agreedModeration}
                  onChange={() => setFormData({...formData, agreedModeration: !formData.agreedModeration})}
                  label={
                    <span className="text-sm leading-relaxed">
                      I understand that my submission will be reviewed by moderators before becoming public.
                    </span>
                  }
                />
              </div>

              {showErrors && (!formData.agreedPrivacy || !formData.agreedNotEmergency || !formData.agreedModeration) && (
                <p className="text-xs text-rose-400 flex items-center gap-1.5 font-medium animate-fade-in-up">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Please confirm all three safety permissions before submitting.
                </p>
              )}

              {submitError && (
                <div className="bg-accent/10 border border-accent p-4 rounded-xl text-accent font-medium mt-4">
                  {submitError}
                </div>
              )}
            </div>
          </div>
        )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-12 flex justify-between items-center pt-6 border-t border-soft-border">
        {step > 1 ? (
          <button 
            type="button"
            onClick={prevStep}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-full font-medium text-foreground border border-soft-border hover:bg-surface transition-colors btn-interaction disabled:opacity-50"
          >
            Back
          </button>
        ) : (
          <div></div>
        )}
        
        {step < totalSteps ? (
          <button 
            type="button"
            onClick={handleContinue}
            className="px-8 py-3 rounded-full font-medium bg-foreground text-surface hover:bg-foreground/90 transition-all ml-auto btn-interaction shadow-sm active:scale-95"
          >
            Continue
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 rounded-full font-medium bg-accent text-surface hover:bg-accent/90 transition-colors ml-auto btn-interaction shadow-sm disabled:opacity-70"
          >
            {isSubmitting ? "Submitting..." : "Submit anonymously"}
          </button>
        )}
      </div>
    </div>
  );
}
