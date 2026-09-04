"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SubmitPage() {
  const [step, setStep] = useState(1);
  const totalSteps = 8;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [managementToken, setManagementToken] = useState("");

  const [formData, setFormData] = useState({
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

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

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
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
      case 5: return formData.narrative.length >= 10;
      case 6: return true; // advice is optional
      case 7: return formData.agreedPrivacy && formData.agreedNotEmergency && formData.agreedModeration;
      default: return true;
    }
  };

  // If successfully submitted, show success screen entirely
  if (managementToken) {
    const manageUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/manage/report/${managementToken}`;
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
          <Link href="/reports" className="text-accent font-medium hover:underline">Return to experiences feed &rarr;</Link>
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
            className="bg-accent h-full transition-all duration-300 ease-in-out" 
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 relative">
        <div key={step} className="animate-fade-in-up will-change-[opacity,transform]">
        {step === 1 && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">What happened?</h1>
            <p className="text-secondary">Select the primary category that best describes your experience.</p>
            <div className="grid gap-3">
              {incidentTypes.map(type => (
                <label key={type.slug} className="flex items-center gap-3 p-4 border border-soft-border rounded-xl cursor-pointer hover:border-accent/50 hover:bg-surface transition-colors">
                  <input 
                    type="checkbox" 
                    checked={formData.incidentTypeSlugs.includes(type.slug)}
                    onChange={() => setFormData({...formData, incidentTypeSlugs: toggleArray(formData.incidentTypeSlugs, type.slug)})}
                    className="w-4 h-4 text-accent border-soft-border focus:ring-accent rounded" 
                  />
                  <span className="font-medium text-foreground">{type.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Who was involved?</h1>
            <p className="text-secondary">What was your relationship to the person? Do not use names.</p>
            <select 
              value={formData.contextSlug}
              onChange={e => setFormData({...formData, contextSlug: e.target.value})}
              className="w-full p-4 border border-soft-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              <option value="">Select relationship</option>
              {contexts.map(c => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>
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
                  className="w-full p-4 border border-soft-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Year</label>
                <select 
                  value={formData.incidentYear}
                  onChange={e => setFormData({...formData, incidentYear: parseInt(e.target.value)})}
                  className="w-full p-4 border border-soft-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
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
                <label key={sign.label} className="flex items-center gap-3 p-4 border border-soft-border rounded-xl cursor-pointer hover:border-accent/50 hover:bg-surface transition-colors">
                  <input 
                    type="checkbox" 
                    checked={formData.behaviorSlugs.includes(sign.slug)}
                    onChange={() => setFormData({...formData, behaviorSlugs: toggleArray(formData.behaviorSlugs, sign.slug)})}
                    className="w-4 h-4 text-accent border-soft-border rounded focus:ring-accent" 
                  />
                  <span className="font-medium text-foreground text-sm">{sign.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Tell your experience</h1>
            <p className="text-secondary">Focus on the behaviors and how the situation developed.</p>
            <div className="bg-accent-secondary/20 border border-accent-secondary/30 p-4 rounded-xl mb-4">
              <h4 className="text-sm font-bold text-accent mb-2">Important Privacy Rules</h4>
              <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
                <li>Do not use real names of people or companies</li>
                <li>Do not include phone numbers or social media handles</li>
                <li>Do not include exact addresses</li>
              </ul>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Detailed narrative</label>
              <textarea 
                rows={8} 
                value={formData.narrative}
                onChange={e => setFormData({...formData, narrative: e.target.value})}
                className="w-full p-4 border border-soft-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
                placeholder="Describe what happened, focusing on the warning signs..."
              ></textarea>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">What would you tell others?</h1>
            <p className="text-secondary">If someone is in a similar situation now, what advice would you give them based on your experience?</p>
            <textarea 
              rows={5} 
              value={formData.advice}
              onChange={e => setFormData({...formData, advice: e.target.value})}
              className="w-full p-4 border border-soft-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
              placeholder="Your advice (optional)..."
            ></textarea>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Privacy review</h1>
            <p className="text-secondary">Please confirm that your submission follows our safety guidelines.</p>
            
            <div className="space-y-4">
              <label className="flex items-start gap-4 p-4 border border-soft-border rounded-xl cursor-pointer hover:bg-surface transition-colors">
                <input 
                  type="checkbox" 
                  checked={formData.agreedPrivacy}
                  onChange={e => setFormData({...formData, agreedPrivacy: e.target.checked})}
                  className="w-5 h-5 mt-0.5 text-accent border-soft-border rounded focus:ring-accent" 
                />
                <span className="text-sm text-foreground leading-relaxed">
                  I confirm that I have not included any real names, phone numbers, exact addresses, or social media handles.
                </span>
              </label>
              <label className="flex items-start gap-4 p-4 border border-soft-border rounded-xl cursor-pointer hover:bg-surface transition-colors">
                <input 
                  type="checkbox" 
                  checked={formData.agreedNotEmergency}
                  onChange={e => setFormData({...formData, agreedNotEmergency: e.target.checked})}
                  className="w-5 h-5 mt-0.5 text-accent border-soft-border rounded focus:ring-accent" 
                />
                <span className="text-sm text-foreground leading-relaxed">
                  I understand that this platform is not an emergency response service and will not automatically notify authorities.
                </span>
              </label>
              <label className="flex items-start gap-4 p-4 border border-soft-border rounded-xl cursor-pointer hover:bg-surface transition-colors">
                <input 
                  type="checkbox" 
                  checked={formData.agreedModeration}
                  onChange={e => setFormData({...formData, agreedModeration: e.target.checked})}
                  className="w-5 h-5 mt-0.5 text-accent border-soft-border rounded focus:ring-accent" 
                />
                <span className="text-sm text-foreground leading-relaxed">
                  I understand that my submission will be reviewed by moderators before becoming public.
                </span>
              </label>
            </div>
          </div>
        )}

        {step === 8 && (
          <div className="space-y-6 text-center py-10">
            <div className="w-20 h-20 bg-accent-secondary/30 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Ready to submit</h1>
            <p className="text-secondary max-w-md mx-auto mb-8">
              Your experience will be submitted anonymously. It will be reviewed by our team before appearing on the platform.
            </p>
            {submitError && (
              <div className="bg-accent/10 border border-accent p-4 rounded-xl text-accent font-medium mb-8">
                {submitError}
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      <div className="mt-12 flex justify-between items-center pt-6 border-t border-soft-border">
        {step > 1 ? (
          <button 
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
            onClick={nextStep}
            disabled={!isStepValid()}
            className="px-8 py-3 rounded-full font-medium bg-foreground text-surface hover:bg-foreground/90 transition-colors ml-auto btn-interaction disabled:opacity-50"
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
