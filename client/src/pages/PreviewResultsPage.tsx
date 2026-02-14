/**
 * /preview-results route wrapper (Compliance Audit Jan 2026)
 * Reads analysis from sessionStorage/localStorage (set by GetReports after upload-and-analyze)
 * and renders PreviewResults with blurred preview. No method/FCRA exposure.
 * Reads synchronously on mount so we never show "Loading" when data exists.
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { safeJsonParse } from "@/lib/utils";
import PreviewResults from "./PreviewResults";
import type { LightAnalysisResult } from "@shared/types";

const STORAGE_KEY = "previewAnalysis";

function readPreviewFromStorage(): (LightAnalysisResult & { fileUrl?: string }) | null {
  const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const data = safeJsonParse(raw, null) as LightAnalysisResult & { fileUrl?: string } | null;
  if (!data || typeof (data as { totalViolations?: unknown }).totalViolations !== "number") return null;
  return { ...data, fileUrl: data.fileUrl ?? "" };
}

export default function PreviewResultsPage() {
  const [, setLocation] = useLocation();
  const [analysis, setAnalysis] = useState<(LightAnalysisResult & { fileUrl?: string }) | null>(readPreviewFromStorage);

  useEffect(() => {
    if (analysis) return;
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setLocation("/get-reports");
      return;
    }
    const data = readPreviewFromStorage();
    if (data) setAnalysis(data);
    else setLocation("/get-reports");
  }, [analysis, setLocation]);

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
