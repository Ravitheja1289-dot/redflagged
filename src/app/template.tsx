"use client";

import React from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in-up opacity-0 will-change-[opacity,transform] h-full flex-1 flex flex-col">
      {children}
    </div>
  );
}
