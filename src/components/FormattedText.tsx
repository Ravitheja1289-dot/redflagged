"use client";

import React from "react";

export function FormattedText({
  text,
  className = "",
  paragraphClassName = "",
}: {
  text: string;
  className?: string;
  paragraphClassName?: string;
}) {
  if (!text) return null;

  // Normalize Windows CRLF to standard LF
  const normalized = text.replace(/\r\n/g, "\n");
  
  // Split by blank lines (paragraphs separated by one or more empty lines with optional spaces)
  const rawParagraphs = normalized.split(/\n\s*\n+/);

  // Filter out empty blocks but keep content
  const paragraphs = rawParagraphs.map(p => p.trim()).filter(p => p.length > 0);

  if (paragraphs.length <= 1) {
    return (
      <p className={`whitespace-pre-wrap break-words leading-relaxed ${className} ${paragraphClassName}`}>
        {text}
      </p>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {paragraphs.map((para, idx) => (
        <p
          key={idx}
          className={`whitespace-pre-wrap break-words leading-relaxed ${paragraphClassName}`}
        >
          {para}
        </p>
      ))}
    </div>
  );
}
