const fs = require('fs');
let code = fs.readFileSync('src/app/submit/page.tsx', 'utf8');

const privacyCbOrig = `<input 
                  type="checkbox" 
                  checked={formData.agreedPrivacy}
                  onChange={e => setFormData({...formData, agreedPrivacy: e.target.checked})}
                  className="w-5 h-5 mt-0.5 text-accent border-soft-border rounded focus:ring-accent" 
                />`;
                
const privacyCbNew = `<div className="relative flex items-center justify-center w-6 h-6 shrink-0 mt-0.5">
                  <input 
                    type="checkbox" 
                    checked={formData.agreedPrivacy}
                    onChange={e => setFormData({...formData, agreedPrivacy: e.target.checked})}
                    className="peer appearance-none w-6 h-6 border-2 border-soft-border rounded-md checked:bg-accent checked:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer bg-background" 
                  />
                  <svg className="absolute w-3.5 h-3.5 text-surface opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>`;

code = code.replace(privacyCbOrig, privacyCbNew);

const emergencyCbOrig = `<input 
                  type="checkbox" 
                  checked={formData.agreedNotEmergency}
                  onChange={e => setFormData({...formData, agreedNotEmergency: e.target.checked})}
                  className="w-5 h-5 mt-0.5 text-accent border-soft-border rounded focus:ring-accent" 
                />`;

const emergencyCbNew = `<div className="relative flex items-center justify-center w-6 h-6 shrink-0 mt-0.5">
                  <input 
                    type="checkbox" 
                    checked={formData.agreedNotEmergency}
                    onChange={e => setFormData({...formData, agreedNotEmergency: e.target.checked})}
                    className="peer appearance-none w-6 h-6 border-2 border-soft-border rounded-md checked:bg-accent checked:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer bg-background" 
                  />
                  <svg className="absolute w-3.5 h-3.5 text-surface opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>`;

code = code.replace(emergencyCbOrig, emergencyCbNew);

const moderationCbOrig = `<input 
                  type="checkbox" 
                  checked={formData.agreedModeration}
                  onChange={e => setFormData({...formData, agreedModeration: e.target.checked})}
                  className="w-5 h-5 mt-0.5 text-accent border-soft-border rounded focus:ring-accent" 
                />`;

const moderationCbNew = `<div className="relative flex items-center justify-center w-6 h-6 shrink-0 mt-0.5">
                  <input 
                    type="checkbox" 
                    checked={formData.agreedModeration}
                    onChange={e => setFormData({...formData, agreedModeration: e.target.checked})}
                    className="peer appearance-none w-6 h-6 border-2 border-soft-border rounded-md checked:bg-accent checked:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer bg-background" 
                  />
                  <svg className="absolute w-3.5 h-3.5 text-surface opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>`;

code = code.replace(moderationCbOrig, moderationCbNew);

fs.writeFileSync('src/app/submit/page.tsx', code);
