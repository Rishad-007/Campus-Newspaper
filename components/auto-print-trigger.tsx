"use client";

import { useEffect, useRef } from "react";

type AutoPrintTriggerProps = {
  enabled: boolean;
};

export function AutoPrintTrigger({ enabled }: AutoPrintTriggerProps) {
  const hasPrintedRef = useRef(false);

  useEffect(() => {
    if (!enabled || hasPrintedRef.current) {
      return;
    }

    hasPrintedRef.current = true;

    try {
      window.print();
    } catch {
      // Ignore print failures; the manual Print PDF link still works.
    }
  }, [enabled]);

  return null;
}