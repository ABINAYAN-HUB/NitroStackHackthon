"use client";

import { useEffect } from "react";

export function AutoPrint() {
  useEffect(() => {
    // Small delay to ensure styles are loaded
    const timeout = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  return null;
}
