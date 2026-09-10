const fs = require('fs');
let code = fs.readFileSync('src/components/ReportDetail.tsx', 'utf8');

// Update fetch comments to include clientId
code = code.replace(
  /fetch\(\`\/api\/reports\/\$\{report\.id\}\/comments\`\)/g,
  "fetch(`/api/reports/${report.id}/comments?clientId=${getClientId()}`)"
);

// Add useEffect to fetch report vote
const reportVoteUseEffect = `
  useEffect(() => {
    if (report?.id) {
      fetch(\`/api/reports/\${report.id}/vote?clientId=\${getClientId()}\`)
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.vote !== 'undefined') {
            setReportUserVote(data.vote);
          }
        })
        .catch(console.error);
    }
  }, [report?.id]);
`;

// Insert the useEffect before the comments useEffect
code = code.replace(
  /useEffect\(\(\) => \{\n    if \(report\?\.id\)/,
  reportVoteUseEffect + "\n  useEffect(() => {\n    if (report?.id)"
);

fs.writeFileSync('src/components/ReportDetail.tsx', code);
