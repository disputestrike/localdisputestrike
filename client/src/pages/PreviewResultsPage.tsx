/**
 * /preview-results route wrapper (Compliance Audit Jan 2026)
 * Reads analysis from sessionStorage (set by GetReports after upload-and-analyze)
 * and renders PreviewResults with blurred preview. No method/FCRA exposure.
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { safeJsonParse } from "@/lib/utils";
import PreviewResults from "./PreviewResults";
import type { LightAnalysisResult } from "@shared/types";

const STORAGE_KEY = "previewAnalysis";

export default function PreviewResultsPage() {
  const [, setLocation] = useLocation();
  const [analysis, setAnalysis] = useState<(LightAnalysisResult & { fileUrl?: string }) | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setLocation("/get-reports");
      return;
    }
    try {
      const data = safeJsonParse(raw, null) as LightAnalysisResult & { fileUrl?: string };
      setAnalysis({ ...data, fileUrl: data.fileUrl ?? "" });
      // Keep preview in sessionStorage for post-payment hydrate (Phase 1 zero-friction).
      // Do NOT remove here; Dashboard clears after successful hydrate.
    } catch (e) {
      setLocation("/get-reports");
    }
  }, [setLocation]);

  const onUpgrade = () => setLocation("/pricing");

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading preview…</p>
      </div>
    );
  }

  return <PreviewResults analysis={analysis} onUpgrade={onUpgrade} />;
}
