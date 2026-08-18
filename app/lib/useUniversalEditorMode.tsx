"use client";
import { useSyncExternalStore } from "react";

export type UniversalEditorMode = "publish" | "edit" | "preview";

let currentMode: UniversalEditorMode = "publish";

function detectMode(): UniversalEditorMode {
  try {
    return window.self !== window.top ? "edit" : "publish";
  } catch {
    return "edit";
  }
}

function subscribe(onStoreChange: () => void): () => void {
  currentMode = detectMode();

  const handleEditMode = (): void => {
    currentMode = "edit";
    onStoreChange();
  };
  const handlePreviewMode = (): void => {
    currentMode = "preview";
    onStoreChange();
  };

  document.addEventListener("aue:ui-edit", handleEditMode);
  document.addEventListener("aue:ui-preview", handlePreviewMode);

  return (): void => {
    document.removeEventListener("aue:ui-edit", handleEditMode);
    document.removeEventListener("aue:ui-preview", handlePreviewMode);
  };
}

function getMode(): UniversalEditorMode {
  return currentMode;
}

function getServerMode(): UniversalEditorMode {
  return "publish";
}

// export function useUniversalEditorMode(
//   initialValue = false,
// ): UniversalEditorMode {
export function useUniversalEditorMode(): UniversalEditorMode {
  return useSyncExternalStore(subscribe, getMode, getServerMode);
}
