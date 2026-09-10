const fs = require('fs');
let code = fs.readFileSync('src/components/ReportDetail.tsx', 'utf8');

const target1 = `  const commentTree = useMemo(() => {
    const map = new Map();
    const roots: any[] = [];
    
    comments.forEach(c => {
      map.set(c.id, { ...c, children: [] });
    });
    
    comments.forEach(c => {
      if (c.parent_id && map.has(c.parent_id)) {
        map.get(c.parent_id).children.push(map.get(c.id));
      } else {
        roots.push(map.get(c.id));
      }
    });
    
    return roots;
  }, [comments]);`;

const target2 = `  const renderComment = (comment: any, depth = 0) => {
    return (
      <div key={comment.id} className={\`group \${depth > 0 ? 'ml-6 mt-4 pl-4 border-l-2 border-soft-border' : 'mb-6'}\`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">{comment.pseudonym}</span>
            <span className="text-xs text-secondary">{new Date(comment.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <p className="text-sm text-foreground leading-relaxed mb-2 whitespace-pre-wrap">
          {comment.body}
        </p>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setReplyTo(comment.id)}
            className="text-[11px] font-bold text-secondary hover:text-foreground transition-colors"
          >
            REPLY
          </button>
          <button 
            onClick={() => setFlagTarget({ type: 'COMMENT', id: comment.id })}
            className="text-[11px] font-bold text-secondary opacity-0 group-hover:opacity-100 hover:text-accent transition-all"
          >
            REPORT
          </button>
        </div>
        
        {/* Render Children */}
        {comment.children && comment.children.length > 0 && (
          <div className="mt-2">
            {comment.children.map((child: any) => renderComment(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };`;

const replaceWith = `  const commentTree = useMemo(() => {
    const map = new Map();
    const roots: any[] = [];
    
    comments.forEach(c => {
      map.set(c.id, { ...c, children: [], localScore: c.score || 0, userVote: 0 });
    });
    
    comments.forEach(c => {
      if (c.parent_id && map.has(c.parent_id)) {
        map.get(c.parent_id).children.push(map.get(c.id));
      } else {
        roots.push(map.get(c.id));
      }
    });
    
    return roots;
  }, [comments]);

  const [reportScore, setReportScore] = useState(report.score || 0);
  const [reportUserVote, setReportUserVote] = useState<1 | -1 | 0>(0);

  const handleReportVote = async (voteType: 1 | -1) => {
    const previousVote = reportUserVote;
    const previousScore = reportScore;
    
    if (reportUserVote === voteType) {
      setReportScore(s => s - voteType);
      setReportUserVote(0);
    } else {
      setReportScore(s => s - reportUserVote + voteType);
      setReportUserVote(voteType);
    }

    try {
      const clientId = getClientId();
      const res = await fetch(\`/api/reports/\${report.id}/vote\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, voteType })
      });
      if (!res.ok) throw new Error("Vote failed");
    } catch (err) {
      setReportScore(previousScore);
      setReportUserVote(previousVote);
    }
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: any, depth?: number }) => {
    const [score, setScore] = useState(comment.localScore);
    const [userVote, setUserVote] = useState<1 | -1 | 0>(comment.userVote);

    const handleVote = async (voteType: 1 | -1) => {
      const previousVote = userVote;
      const previousScore = score;
      
      if (userVote === voteType) {
        setScore((s: number) => s - voteType);
        setUserVote(0);
      } else {
        setScore((s: number) => s - userVote + voteType);
        setUserVote(voteType);
      }

      try {
        const clientId = getClientId();
        const res = await fetch(\`/api/comments/\${comment.id}/vote\`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId, voteType })
        });
        if (!res.ok) throw new Error("Vote failed");
      } catch (err) {
        setScore(previousScore);
        setUserVote(previousVote);
      }
    };

    return (
      <div className={\`group \${depth > 0 ? 'ml-6 mt-4 pl-4 border-l-2 border-soft-border' : 'mb-6'}\`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">{comment.pseudonym}</span>
            <span className="text-xs text-secondary">{new Date(comment.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <p className="text-sm text-foreground leading-relaxed mb-2 whitespace-pre-wrap">
          {comment.body}
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button onClick={() => handleVote(1)} className={\`w-6 h-6 flex items-center justify-center rounded-full hover:bg-background transition-colors \${userVote === 1 ? 'text-orange-500' : 'text-secondary'}\`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            </button>
            <span className={\`text-xs font-bold w-4 text-center \${userVote === 1 ? 'text-orange-500' : userVote === -1 ? 'text-indigo-500' : 'text-secondary'}\`}>{score}</span>
            <button onClick={() => handleVote(-1)} className={\`w-6 h-6 flex items-center justify-center rounded-full hover:bg-background transition-colors \${userVote === -1 ? 'text-indigo-500' : 'text-secondary'}\`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
            </button>
          </div>
          <button onClick={() => setReplyTo(comment.id)} className="text-[11px] font-bold text-secondary hover:text-foreground transition-colors">REPLY</button>
          <button onClick={() => setFlagTarget({ type: 'COMMENT', id: comment.id })} className="text-[11px] font-bold text-secondary opacity-0 group-hover:opacity-100 hover:text-accent transition-all">REPORT</button>
        </div>
        {comment.children && comment.children.length > 0 && (
          <div className="mt-2">
            {comment.children.map((child: any) => <CommentItem key={child.id} comment={child} depth={depth + 1} />)}
          </div>
        )}
      </div>
    );
  };`;

code = code.replace(target1, '').replace(target2, replaceWith);
code = code.replace(/commentTree\.map\(comment => renderComment\(comment\)\)/g, 'commentTree.map(comment => <CommentItem key={comment.id} comment={comment} />)');

fs.writeFileSync('src/components/ReportDetail.tsx', code);
