const fs = require('fs');
let code = fs.readFileSync('src/components/PostCard.tsx', 'utf8');

// We need to import useEffect
if (!code.includes('useEffect')) {
  code = code.replace(/import { useState } from "react";/g, 'import { useState, useEffect } from "react";');
}

// Add useEffect
const reportVoteUseEffect = `
  useEffect(() => {
    if (report?.id) {
      fetch(\`/api/reports/\${report.id}/vote?clientId=\${getClientId()}\`)
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.vote !== 'undefined') {
            setUserVote(data.vote);
          }
        })
        .catch(console.error);
    }
  }, [report?.id]);
`;

code = code.replace(
  /const isLong = report\.narrative\.length > 250;/g,
  `${reportVoteUseEffect}\n  const isLong = report.narrative.length > 250;`
);

fs.writeFileSync('src/components/PostCard.tsx', code);
