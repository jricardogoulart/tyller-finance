export function renderPlanMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('###')) {
      return (
        <h3 key={i} className="ds-markdown-h3">
          {trimmed.replace('###', '')}
        </h3>
      );
    }
    if (trimmed.startsWith('####')) {
      return (
        <h4 key={i} className="ds-markdown-h4">
          {trimmed.replace('####', '')}
        </h4>
      );
    }
    if (/^[1-4]\./.test(trimmed)) {
      return (
        <div key={i} className="ds-markdown-list-item">
          <span className="ds-markdown-list-num">{trimmed.slice(0, 2)}</span> {trimmed.slice(2)}
        </div>
      );
    }
    if (trimmed.startsWith('*') && trimmed.endsWith('*')) {
      return (
        <p key={i} className="ds-markdown-footnote">
          {trimmed.replace(/\*/g, '')}
        </p>
      );
    }
    if (trimmed) {
      return (
        <p key={i} className="ds-markdown-p">
          {trimmed}
        </p>
      );
    }
    return <div key={i} className="h-2" />;
  });
}
