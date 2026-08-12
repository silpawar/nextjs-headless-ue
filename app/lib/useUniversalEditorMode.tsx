"use client";
import { useState, useEffect } from "react";

export type UniversalEditorMode = "publish" | "edit" | "preview";

export function useUniversalEditorMode(
  initialValue = false,
): UniversalEditorMode {
  const [mode, setMode] = useState<UniversalEditorMode>(() => {
    // Trust the server-provided value first (e.g. Universal Editor detected
    // server-side). This keeps the initial client render consistent with the
    // server render and avoids hydration mismatches.
    if (initialValue) {
      return "edit";
    }

    if (typeof window === "undefined") {
      return "publish";
    }

    try {
      return window.self !== window.top ? "edit" : "publish";
    } catch {
      return "edit";
    }
  });

  useEffect(() => {
    const handleEditMode = (): void => setMode("edit");
    const handlePreviewMode = (): void => setMode("preview");

    document.addEventListener("aue:ui-edit", handleEditMode);
    document.addEventListener("aue:ui-preview", handlePreviewMode);

    return (): void => {
      document.removeEventListener("aue:ui-edit", handleEditMode);
      document.removeEventListener("aue:ui-preview", handlePreviewMode);
    };
  }, []);

  return mode;
}
