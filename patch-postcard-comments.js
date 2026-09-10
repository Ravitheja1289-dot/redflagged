const fs = require('fs');
let code = fs.readFileSync('src/components/PostCard.tsx', 'utf8');

code = code.replace(
  /<span className="text-sm font-bold">Comments<\/span>/g,
  '{report.commentCount === 1 ? <span className="text-sm font-bold">1 Comment</span> : <span className="text-sm font-bold">{report.commentCount || 0} Comments</span>}'
);

fs.writeFileSync('src/components/PostCard.tsx', code);
