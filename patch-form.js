const fs = require('fs');
let code = fs.readFileSync('src/app/submit/page.tsx', 'utf8');

const selectContextOrig = `<select 
              value={formData.contextSlug}
              onChange={e => setFormData({...formData, contextSlug: e.target.value})}
              className="w-full p-4 border border-soft-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              <option value="">Select relationship</option>
              {contexts.map(c => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>`;

const selectContextNew = `<div className="relative">
              <select 
                value={formData.contextSlug}
                onChange={e => setFormData({...formData, contextSlug: e.target.value})}
                className="appearance-none w-full p-4 pr-12 border border-soft-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-foreground font-medium transition-all"
              >
                <option value="">Select relationship</option>
                {contexts.map(c => (
                  <option key={c.slug} value={c.slug}>{c.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>`;

code = code.replace(selectContextOrig, selectContextNew);

const selectYearOrig = `<select 
                  value={formData.incidentYear}
                  onChange={e => setFormData({...formData, incidentYear: parseInt(e.target.value)})}
                  className="w-full p-4 border border-soft-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>`;

const selectYearNew = `<div className="relative">
                <select 
                  value={formData.incidentYear}
                  onChange={e => setFormData({...formData, incidentYear: parseInt(e.target.value)})}
                  className="appearance-none w-full p-4 pr-12 border border-soft-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-foreground font-medium transition-all"
                >
                  {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-secondary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </div>`;

code = code.replace(selectYearOrig, selectYearNew);

code = code.replace(/className="w-full p-4 border border-soft-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-accent\/20 focus:border-accent"/g, 'className="appearance-none w-full p-4 border border-soft-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-medium text-foreground transition-all placeholder:text-secondary/50"');
code = code.replace(/className="w-full p-4 border border-soft-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-accent\/20 focus:border-accent mb-6"/g, 'className="appearance-none w-full p-4 border border-soft-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-medium text-foreground transition-all placeholder:text-secondary/50 mb-6"');
code = code.replace(/className="w-full p-4 border border-soft-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-accent\/20 focus:border-accent resize-none"/g, 'className="appearance-none w-full p-4 border border-soft-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-medium text-foreground transition-all placeholder:text-secondary/50 resize-none"');

const oldIncidentCb = `<input 
                    type="checkbox" 
                    checked={formData.incidentTypeSlugs.includes(type.slug)}
                    onChange={() => setFormData({...formData, incidentTypeSlugs: toggleArray(formData.incidentTypeSlugs, type.slug)})}
                    className="w-4 h-4 text-accent border-soft-border focus:ring-accent rounded" 
                  />`;

const newIncidentCb = `<div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                    <input 
                      type="checkbox" 
                      checked={formData.incidentTypeSlugs.includes(type.slug)}
                      onChange={() => setFormData({...formData, incidentTypeSlugs: toggleArray(formData.incidentTypeSlugs, type.slug)})}
                      className="peer appearance-none w-5 h-5 border-2 border-soft-border rounded-md checked:bg-accent checked:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer bg-background" 
                    />
                    <svg className="absolute w-3 h-3 text-surface opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>`;
                  
code = code.replace(oldIncidentCb, newIncidentCb);

const oldBehaviorCb = `<input 
                    type="checkbox" 
                    checked={formData.behaviorSlugs.includes(sign.slug)}
                    onChange={() => setFormData({...formData, behaviorSlugs: toggleArray(formData.behaviorSlugs, sign.slug)})}
                    className="w-4 h-4 text-accent border-soft-border rounded focus:ring-accent" 
                  />`;
                  
const newBehaviorCb = `<div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                    <input 
                      type="checkbox" 
                      checked={formData.behaviorSlugs.includes(sign.slug)}
                      onChange={() => setFormData({...formData, behaviorSlugs: toggleArray(formData.behaviorSlugs, sign.slug)})}
                      className="peer appearance-none w-5 h-5 border-2 border-soft-border rounded-md checked:bg-accent checked:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer bg-background" 
                    />
                    <svg className="absolute w-3 h-3 text-surface opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>`;
                  
code = code.replace(oldBehaviorCb, newBehaviorCb);

fs.writeFileSync('src/app/submit/page.tsx', code);
